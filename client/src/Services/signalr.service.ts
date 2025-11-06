import * as signalR from '@microsoft/signalr';
import { SIGNALR_HUB_URL } from '@/Constants';
import Cookies from 'js-cookie';
import { STORAGE_KEYS } from '@/Constants';

/**
 * SignalR connection service
 */
class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private connectionPromise: Promise<void> | null = null;

  /**
   * Initialize SignalR connection
   */
  async connect(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    const token = Cookies.get(STORAGE_KEYS.ACCESS_TOKEN);

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(SIGNALR_HUB_URL, {
        accessTokenFactory: () => token || '',
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff: 0, 2, 10, 30 seconds, then every 30 seconds
          if (retryContext.previousRetryCount === 0) return 0;
          if (retryContext.previousRetryCount === 1) return 2000;
          if (retryContext.previousRetryCount === 2) return 10000;
          return 30000;
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Event handlers
    this.connection.onreconnecting(() => {
      console.warn('SignalR: Reconnecting...');
    });

    this.connection.onreconnected(() => {
      console.log('SignalR: Reconnected');
    });

    this.connection.onclose((error) => {
      console.error('SignalR: Connection closed', error);
      this.connectionPromise = null;
    });

    this.connectionPromise = this.connection
      .start()
      .then(() => {
        console.log('SignalR: Connected');
        this.connectionPromise = null;
      })
      .catch((error) => {
        console.error('SignalR: Connection failed', error);
        this.connectionPromise = null;
        throw error;
      });

    return this.connectionPromise;
  }

  /**
   * Disconnect from SignalR hub
   */
  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      this.connectionPromise = null;
    }
  }

  /**
   * Subscribe to a SignalR event
   */
  on(eventName: string, callback: (...args: any[]) => void): void {
    if (!this.connection) {
      console.warn('SignalR: Not connected. Call connect() first.');
      return;
    }

    this.connection.on(eventName, callback);
  }

  /**
   * Unsubscribe from a SignalR event
   */
  off(eventName: string, callback?: (...args: any[]) => void): void {
    if (!this.connection) return;

    if (callback) {
      this.connection.off(eventName, callback);
    } else {
      this.connection.off(eventName);
    }
  }

  /**
   * Invoke a SignalR method
   */
  async invoke<T = any>(methodName: string, ...args: any[]): Promise<T> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR: Not connected');
    }

    return this.connection.invoke<T>(methodName, ...args);
  }

  /**
   * Get connection state
   */
  getState(): signalR.HubConnectionState | null {
    return this.connection?.state || null;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

export const signalRService = new SignalRService();
export default signalRService;
