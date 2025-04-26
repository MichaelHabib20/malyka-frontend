// import mitt from 'mitt';

// // Define the type of events
// type isOnlineEvent = {
//   statusChanged: boolean;
// };

// const emitter = mitt<isOnlineEvent>(); // 👈 now TS knows statusChanged expects a boolean

export class StatusService {
  private static instance: StatusService;
  private _isOnline: boolean;
  private isOnlineValue: boolean = true;
  private isConnectionStable : boolean = true;
  private subscribers: ((isOnline: boolean) => void)[] = [];
  private connection: any; // For Network Information API

  private constructor() {
    this._isOnline = navigator.onLine;
    this.connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    window.addEventListener('online', () => {
      this.isOnlineValue = true;
      this.updateStatus();
    });
    
    window.addEventListener('offline', () => {
      this.isOnlineValue = false;
      this.updateStatus();
    });
    
    // Listen for connection changes if supported
    if (this.connection) {
      this.connection.addEventListener('change', () => this.handleConnectionChange());
    }
  }

  private handleConnectionChange(): void {
    if (this.connection) {
      const isUnstable =
        this.connection.effectiveType === 'slow-2g' ||
        this.connection.effectiveType === '2g' ||
        this.connection.downlink < 0.5 ||
        this.connection.rtt > 1000;
  
      this.isConnectionStable = !isUnstable;
      console.log('status',this.isConnectionStable)
      this.updateStatus();
    }
  }

  public static getInstance(): StatusService {
    if (!StatusService.instance) {
      StatusService.instance = new StatusService();
    }
    return StatusService.instance;
  }

  public getStatus(): boolean {
    return this._isOnline;
  }

  public isOnline(): boolean {
    return this._isOnline;
  }

  public subscribe(callback: (isOnline: boolean) => void): () => void {
    this.subscribers.push(callback);
    callback(this._isOnline); // 👈 emits current value
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private updateStatus(): void {
    const fullyConnected = this.isOnlineValue && this.isConnectionStable;
    console.log(fullyConnected)
    // this._isOnline = this.isOnline;
    this.subscribers.forEach(callback => callback(fullyConnected));
  }
}

export const statusService = StatusService.getInstance();

// Add default export
export default statusService;
