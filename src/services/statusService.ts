// import mitt from 'mitt';

// // Define the type of events
// type isOnlineEvent = {
//   statusChanged: boolean;
// };

// const emitter = mitt<isOnlineEvent>(); // 👈 now TS knows statusChanged expects a boolean

export class StatusService {
  private static instance: StatusService;
  // private _isOnline: boolean;
  private isOnlineValue: boolean = true;
  private isConnectionStable : boolean = true;
  private subscribers: ((isOnline: boolean) => void)[] = [];
  // private connection: any; // For Network Information API

  private constructor() {
    // Initialize with current status
    this.isOnlineValue = navigator.onLine;
    // Online event handler
    window.addEventListener('online', () => {
        this.isOnlineValue = true;
        this.updateStatus();
    });
    
    // Offline event handler
    window.addEventListener('offline', () => {
        this.isOnlineValue = false;
        this.updateStatus();
    });
}

  public static getInstance(): StatusService {
    if (!StatusService.instance) {
      StatusService.instance = new StatusService();
    }
    return StatusService.instance;
  }

  public getStatus(): boolean {
    return this.isOnlineValue;
  }

  public isOnline(): boolean {
    return this.isOnlineValue;
  }

  public subscribe(callback: (isOnline: boolean) => void): () => void {
    this.subscribers.push(callback);
    callback(this.isOnlineValue); // 👈 emits current value
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private updateStatus(): void {
    const fullyConnected = this.isOnlineValue && this.isConnectionStable;
    this.subscribers.forEach(callback => callback(fullyConnected));
  }
}

export const statusService = StatusService.getInstance();

// Add default export
export default statusService;
