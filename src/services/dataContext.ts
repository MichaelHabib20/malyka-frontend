import axios from 'axios';
import type { AxiosResponse, AxiosError } from 'axios';
import { offlineStore } from './offlineStore';
import { statusService } from './statusService';

// Base API URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://storeapi-tarshoubylab.el-dokan.com';
const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3N0b3JlYXBpLXRhcnNob3VieWxhYi5lbC1kb2thbi5jb20vYXBpL2FkbWluL2F1dGgiLCJpYXQiOjE3NDQzNTU3ODUsImV4cCI6Mzc3NDQzNTU3ODUsIm5iZiI6MTc0NDM1NTc4NSwianRpIjoic2dyQTFacTA2U29JcTNPQyIsInN1YiI6MTExMTQzNiwicHJ2IjoiNGFjMDVjMGY4YWMwOGYzNjRjYjRkMDNmYjhlMWY2MzFmZWMzMjJlOCJ9.FlVPNqbpb19s-06GUuG1N87ScAAaSPkTKgCOPcO8G_Y"
// Generic interface for API response
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// Error interface
interface ApiError {
  message: string;
  status: number;
  error?: any;
}

// Generic data service class
export class DataService {
  private static instance: DataService;
  private baseURL: string;
  private isOnline: boolean;
  private syncInProgress = false;
  private processedRequestIds = new Set<number>();
  private isProcessingBatch = false;

  private constructor() {
    this.baseURL = API_BASE_URL;
    this.isOnline = statusService.getStatus();
    axios.defaults.baseURL = this.baseURL;
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    this.setAuthToken(token);

    // Subscribe to status changes
    statusService.subscribe((isOnline) => {
      const wasOffline = !this.isOnline;
      this.isOnline = isOnline;
      
      // Only trigger auto-sync when coming back online from offline state
      if (isOnline && wasOffline && !this.syncInProgress && !this.isProcessingBatch) {
        this.isProcessingBatch = true;
        this.processNextPendingRequest();
      }
    });
  }

  private async processNextPendingRequest() {
    if (this.syncInProgress) return;
    this.syncInProgress = true;
    offlineStore.setIsCurrentlySyncing(true);

    try {
      const pendingRequests = await offlineStore.getPendingRequests();
      if (!pendingRequests.length) {
        this.syncInProgress = false;
        this.isProcessingBatch = false;
        offlineStore.setIsCurrentlySyncing(false);
        return;
      }

      // Get the next request to process
      const nextRequest = pendingRequests[0];
      
      // Skip if this request was already processed
      if (this.processedRequestIds.has(nextRequest.id)) {
        this.syncInProgress = false;
        this.isProcessingBatch = false;
        offlineStore.setIsCurrentlySyncing(false);
        return;
      }

      try {
        await this.processRequest(nextRequest.method, nextRequest.endpoint, nextRequest.data);
        await offlineStore.removePendingRequest(nextRequest.id);
        this.processedRequestIds.add(nextRequest.id);
        
        // Update last successful sync time
        offlineStore.setLastSuccessfulSync(new Date());
      } catch (error) {
        console.error('Error processing request:', error);
        // Don't remove failed requests, they'll be retried next time
      }
    } catch (error) {
      console.error('Error during request processing:', error);
    } finally {
      this.syncInProgress = false;
      offlineStore.setIsCurrentlySyncing(false);
      // Clear processed IDs after processing is complete
      this.processedRequestIds.clear();

      // If we're still online and processing a batch, continue with next request
      if (this.isOnline && this.isProcessingBatch) {
        this.processNextPendingRequest();
      } else {
        this.isProcessingBatch = false;
      }
    }
  }

  private async processRequest<T>(method: string, endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      let response: AxiosResponse<T>;
      switch (method.toLowerCase()) {
        case 'get':
          response = await axios.get(endpoint);
          break;
        case 'post':
          response = await axios.post(endpoint, data);
          break;
        case 'put':
          response = await axios.put(endpoint, data);
          break;
        case 'delete':
          response = await axios.delete(endpoint);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
      return {
        data: response.data,
        status: response.status,
        message: 'Success'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  // Modified GET request with offline support
  public async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const cacheKey = `${endpoint}${params ? JSON.stringify(params) : ''}`;
    
    try {
      if (!this.isOnline) {
        const cachedData = await offlineStore.getData(cacheKey);
        if (cachedData) {
          return {
            data: cachedData,
            status: 200,
            message: 'Success (Offline)'
          };
        }
        await offlineStore.getPendingRequestCount();
        throw new Error('No cached data available offline');
      }

      const response = await this.processRequest<T>('get', endpoint);
      // Cache the successful response
      await offlineStore.saveData(cacheKey, response.data);
      return response;
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  // Modified POST request with offline support
  public async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      // Always store in queue, let sync process handle the actual API call
      await offlineStore.storePendingRequest(endpoint, 'POST', data);
      await offlineStore.getPendingRequestCount();
      
      // If online and not already processing a batch, start processing
      if (this.isOnline && !this.isProcessingBatch) {
        this.isProcessingBatch = true;
        this.processNextPendingRequest();
      }
      
      return {
        data: null as any,
        status: 202,
        message: 'Request queued for processing'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  // Modified PUT request with offline support
  public async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      // Always store in queue, let sync process handle the actual API call
      await offlineStore.storePendingRequest(endpoint, 'PUT', data);
      await offlineStore.getPendingRequestCount();
      
      // If online and not already processing a batch, start processing
      if (this.isOnline && !this.isProcessingBatch) {
        this.isProcessingBatch = true;
        this.processNextPendingRequest();
      }
      
      return {
        data: null as any,
        status: 202,
        message: 'Request queued for processing'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  // Modified DELETE request with offline support
  public async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      // Always store in queue, let sync process handle the actual API call
      await offlineStore.storePendingRequest(endpoint, 'DELETE', null);
      await offlineStore.getPendingRequestCount();
      
      // If online and not already processing a batch, start processing
      if (this.isOnline && !this.isProcessingBatch) {
        this.isProcessingBatch = true;
        this.processNextPendingRequest();
      }
      
      return {
        data: null as any,
        status: 202,
        message: 'Request queued for processing'
      };
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  // Error handler
  private handleError(error: AxiosError): never {
    const apiError: ApiError = {
      message: error.message || 'An error occurred',
      status: error.response?.status || 500,
      error: error.response?.data
    };
    throw apiError;
  }

  // Set authorization token
  public setAuthToken(token: string): void {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Clear authorization token
  public clearAuthToken(): void {
    delete axios.defaults.headers.common['Authorization'];
  }
}

// Export singleton instance
export const dataService = DataService.getInstance();


