import axios from 'axios';
import type { AxiosResponse, AxiosError } from 'axios';
import { offlineStore } from './offlineStore';
import { statusService } from './statusService';
import { loadingService } from './loadingService';
import { ElMessage } from 'element-plus'
// Base API URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://forsa.runasp.net';

// Generic interface for API response
interface ApiResponse<T> {
  statusCode?: number;
  data?: T;
  status?: number;
  message: string;
  httpStatus?: number;
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
    
    // Get token from localStorage if it exists
    const token = localStorage.getItem('authToken');
    if (token) {
      this.setAuthToken(token);
    }

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
      let response: any;
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
        data: response.data.data,
        status: response.status,
        httpStatus: response.status,
        message: response.data.message || 'Success'
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
    // New methods for online-only CRUD operations
    public async fetchOnline<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T> | undefined> {
      loadingService.startLoading();
      try {
        if (!this.isOnline) {
          this.createAlertMessage('You are currently offline. This action requires an internet connection.', 'warning');
          return {
          httpStatus: 503,
          message: 'You are currently offline. This action requires an internet connection.'
          }                 
        }
  
        const response = await axios.get(endpoint, { params });
        return {
          data: response.data.data,
          // status: response.status,
          httpStatus: response.status,
          message: response.data.message || 'Success'
        };
      } catch (error) {
        return this.handleError(error as AxiosError);
      } finally {
        loadingService.endLoading();
      }
    }
  
    public async createOnline<T>(endpoint: string, data: any): Promise<ApiResponse<T> | undefined> {
      loadingService.startLoading();
      try {
        if (!this.isOnline) {
          this.createAlertMessage('You are currently offline. This action requires an internet connection.', 'warning');
          return {
          httpStatus: 503,
          message: 'You are currently offline. This action requires an internet connection.'
          }
        }
  
        const response = await axios.post(endpoint, data);
        return {
          data: response.data.data,
          // status: response.status,
          httpStatus: response.status,
          message: response.data.message || 'Success'
        };
      } catch (error) {
        return this.handleError(error as AxiosError);
      } finally {
        loadingService.endLoading();
      }
    }
  
    public async updateOnline<T>(endpoint: string, data: any): Promise<ApiResponse<T> | undefined>{
      loadingService.startLoading();
      try {
        if (!this.isOnline) {
          this.createAlertMessage('You are currently offline. This action requires an internet connection.', 'warning');
          return {
          httpStatus: 503,
          message: 'You are currently offline. This action requires an internet connection.'
          }
        }
  
        const response = await axios.put(endpoint, data);
        return {
          data: response.data.data,
          // status: response.status,
          httpStatus: response.status,
          message: response.data.message || 'Success'
        };
      } catch (error) {
        return this.handleError(error as AxiosError);
      } finally {
        loadingService.endLoading();
      }
    }
  
    public async removeOnline<T>(endpoint: string): Promise<ApiResponse<T> | undefined> {
      loadingService.startLoading();
      try {
        if (!this.isOnline) {
          this.createAlertMessage('You are currently offline. This action requires an internet connection.', 'warning');
          return {
          httpStatus: 503,
          message: 'You are currently offline. This action requires an internet connection.'
          }
        }
  
        const response = await axios.delete(endpoint);
        return {
          data: response.data.data,
          // status: response.status,
          httpStatus: response.status,
          message: response.data.message || 'Success'
        };
      } catch (error) {
        return this.handleError(error as AxiosError);
      } finally {
        loadingService.endLoading();
      }
    }

    public async downloadFile(endpoint: string, filename?: string): Promise<void> {
      loadingService.startLoading();
      try {
        if (!this.isOnline) {
          this.createAlertMessage('You are currently offline. This action requires an internet connection.', 'warning');
          return;
        }

        const response = await axios.get(endpoint, {
          responseType: 'blob',
          headers: {
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, application/octet-stream'
          }
        });

        // Create blob from response data
        const blob = new Blob([response.data], {
          type: response.headers['content-type'] || 'application/octet-stream'
        });

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Set filename from response headers or use provided filename
        const contentDisposition = response.headers['content-disposition'];
        let downloadFilename = filename;
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (filenameMatch && filenameMatch[1]) {
            downloadFilename = filenameMatch[1].replace(/['"]/g, '');
          }
        }
        
        link.download = downloadFilename || 'download.xlsx';
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.createAlertMessage('File downloaded successfully!', 'success');
      } catch (error) {
        console.error('Error downloading file:', error);
        this.createAlertMessage('Failed to download file. Please try again.', 'error');
      } finally {
        loadingService.endLoading();
      }
    }
    createAlertMessage(message: string, type: 'success' | 'warning' | 'info' | 'error') {
      ElMessage({
        message,
        type,
        duration: 5000,
        showClose: true,
      });
    }
}


// Export singleton instance
export const dataService = DataService.getInstance();


