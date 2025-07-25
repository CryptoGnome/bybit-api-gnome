import WebSocket from 'isomorphic-ws';
import { EventEmitter } from 'events';
import { signMessage } from './util/node-support';
import { DefaultLogger } from './util/logger';
import { APIID } from './util/requestUtils';
import WsStore, { WsConnectionStateEnum } from './util/WsStore';
import { WS_KEY_MAP } from './util/websocket-util';
import { WsKey } from './types';

export interface V5WSClientOptions {
  key?: string;
  secret?: string;
  testnet?: boolean;
  pingInterval?: number;
  pongTimeout?: number;
  reconnectTimeout?: number;
  restoreSubscriptionsOnReconnect?: boolean;
  requestTimeoutMs?: number;
}

interface WSMessage {
  op?: string;
  args?: string[];
  req_id?: string;
  topic?: string;
  data?: any;
  success?: boolean;
  ret_msg?: string;
  conn_id?: string;
  type?: string;
}

interface AuthMessage {
  op: string;
  args: [string, number, string];
}

type V5WSCategory = 'spot' | 'linear' | 'inverse' | 'option' | 'private';

export default class WebSocketClientV5 extends EventEmitter {
  private options: V5WSClientOptions;
  private wsStore: WsStore;
  private logger: typeof DefaultLogger;
  private requestIdCounter: number = 0;
  private pendingRequests: Map<string, any> = new Map();

  constructor(options: V5WSClientOptions = {}) {
    super();

    this.logger = DefaultLogger;
    this.wsStore = new WsStore(this.logger);
    this.options = {
      pingInterval: 20000,
      pongTimeout: 10000,
      reconnectTimeout: 500,
      restoreSubscriptionsOnReconnect: true,
      requestTimeoutMs: 10000,
      ...options,
    };
  }

  /**
   * Convert V5WSCategory to WsKey for compatibility with existing WsStore
   */
  private getWsKey(category: V5WSCategory): WsKey {
    switch (category) {
      case 'spot':
        return WS_KEY_MAP.v5Spot;
      case 'linear':
        return WS_KEY_MAP.v5Linear;
      case 'inverse':
        return WS_KEY_MAP.v5Inverse;
      case 'option':
        return WS_KEY_MAP.v5Option;
      case 'private':
        return WS_KEY_MAP.v5Private;
      default:
        throw new Error(`Unknown V5 WebSocket category: ${category}`);
    }
  }

  /**
   * Get the WS base URL for different categories
   */
  private getWsBaseUrl(category: V5WSCategory): string {
    const isTestnet = this.options.testnet;
    const baseUrl = isTestnet ? 'wss://stream-testnet.bybit.com' : 'wss://stream.bybit.com';
    
    return `${baseUrl}/v5/${category}`;
  }

  /**
   * Connect to a WebSocket category
   */
  public async connect(category: V5WSCategory): Promise<void> {
    const wsUrl = this.getWsBaseUrl(category);
    const wsKey = this.getWsKey(category);
    
    if (this.wsStore.isWsOpen(wsKey)) {
      this.logger.warning(`WebSocket for ${category} is already connected`);
      return;
    }

    return this.connectWS(category, wsUrl);
  }

  /**
   * Subscribe to topics
   */
  public subscribe(category: V5WSCategory, topics: string[]): void {
    const wsKey = this.getWsKey(category);
    if (!this.wsStore.isWsOpen(wsKey)) {
      throw new Error(`WebSocket for category ${category} is not connected`);
    }

    const request: WSMessage = {
      op: 'subscribe',
      args: topics,
      req_id: this.generateRequestId(),
    };

    this.sendWSMessage(category, request);

    // Store subscribed topics
    topics.forEach(topic => {
      this.wsStore.addTopic(wsKey, topic);
    });
  }

  /**
   * Unsubscribe from topics
   */
  public unsubscribe(category: V5WSCategory, topics: string[]): void {
    const wsKey = this.getWsKey(category);
    if (!this.wsStore.isWsOpen(wsKey)) {
      throw new Error(`WebSocket for category ${category} is not connected`);
    }

    const request: WSMessage = {
      op: 'unsubscribe',
      args: topics,
      req_id: this.generateRequestId(),
    };

    this.sendWSMessage(category, request);

    // Remove topics from store
    topics.forEach(topic => {
      this.wsStore.deleteTopic(wsKey, topic);
    });
  }

  /**
   * Subscribe to public market data topics
   */
  public subscribePublicTopic(category: Exclude<V5WSCategory, 'private'>, topic: string): void {
    this.subscribe(category, [topic]);
  }

  /**
   * Subscribe to private topics (requires authentication)
   */
  public subscribePrivateTopic(topics: string[]): void {
    if (!this.options.key || !this.options.secret) {
      throw new Error('API key and secret are required for private topics');
    }

    this.subscribe('private', topics);
  }

  /**
   * Close connection for a specific category
   */
  public close(category: V5WSCategory): void {
    const wsKey = this.getWsKey(category);
    const ws = this.wsStore.getWs(wsKey);
    if (ws) {
      this.wsStore.setConnectionState(wsKey, WsConnectionStateEnum.CLOSING);
      ws.close();
    }
  }

  /**
   * Close all connections
   */
  public closeAll(): void {
    const wsKeys = this.wsStore.getKeys();
    // Convert back to categories for the close method
    const v5Categories: V5WSCategory[] = [];
    wsKeys.forEach(key => {
      if (key === WS_KEY_MAP.v5Spot) v5Categories.push('spot');
      else if (key === WS_KEY_MAP.v5Linear) v5Categories.push('linear');
      else if (key === WS_KEY_MAP.v5Inverse) v5Categories.push('inverse');
      else if (key === WS_KEY_MAP.v5Option) v5Categories.push('option');
      else if (key === WS_KEY_MAP.v5Private) v5Categories.push('private');
    });
    v5Categories.forEach(category => this.close(category));
  }

  private async connectWS(category: V5WSCategory, wsUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.logger.info(`Connecting to ${category}: ${wsUrl}`);

      const ws = new WebSocket(wsUrl, undefined, {
        headers: {
          'User-Agent': APIID,
        },
      });

      const wsKey = this.getWsKey(category);
      this.wsStore.setWs(wsKey, ws);
      this.wsStore.setConnectionState(wsKey, WsConnectionStateEnum.CONNECTING);

      ws.onopen = () => {
        this.logger.info(`WebSocket ${category} connected`);
        this.wsStore.setConnectionState(wsKey, WsConnectionStateEnum.CONNECTED);
        
        this.startPingPong(category);

        // Authenticate if this is private connection
        if (category === 'private' && this.options.key && this.options.secret) {
          this.authenticate(category)
            .then(() => {
              this.emit('open', { category });
              resolve();
            })
            .catch(reject);
        } else {
          this.emit('open', { category });
          resolve();
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data as string);
          this.handleMessage(category, message);
        } catch (error) {
          this.logger.error(`Failed to parse message for ${category}:`, error);
          this.emit('error', { category, error });
        }
      };

      ws.onerror = (error) => {
        this.logger.error(`WebSocket ${category} error:`, error);
        this.emit('error', { category, error });
        reject(error);
      };

      ws.onclose = (event) => {
        this.logger.info(`WebSocket ${category} closed:`, event.code, event.reason);
        this.wsStore.setConnectionState(wsKey, WsConnectionStateEnum.INITIAL);
        this.emit('close', { category, event });

        // Attempt reconnection if not manually closed
        if (event.code !== 1000 && this.options.restoreSubscriptionsOnReconnect) {
          this.handleReconnection(category);
        }
      };
    });
  }

  private async authenticate(category: V5WSCategory): Promise<void> {
    if (!this.options.key || !this.options.secret) {
      throw new Error('API key and secret are required for authentication');
    }

    const expires = Date.now() + 10000; // 10 seconds from now
    const signature = await signMessage(`GET/realtime${expires}`, this.options.secret);

    const authMessage: AuthMessage = {
      op: 'auth',
      args: [this.options.key, expires, signature],
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Authentication timeout'));
      }, this.options.requestTimeoutMs);

      const handleAuth = (message: WSMessage) => {
        if (message.op === 'auth') {
          clearTimeout(timeout);
          if (message.success) {
            this.logger.info('WebSocket authentication successful');
            resolve();
          } else {
            this.logger.error('WebSocket authentication failed:', message.ret_msg);
            reject(new Error(`Authentication failed: ${message.ret_msg}`));
          }
        }
      };

      this.once('response', handleAuth);
      this.sendWSMessage(category, authMessage);
    });
  }

  private handleMessage(category: V5WSCategory, message: WSMessage): void {
    // Handle pong messages
    if (message.op === 'pong') {
      this.logger.debug(`Received pong from ${category}`);
      return;
    }

    // Handle subscription responses
    if (message.op === 'subscribe' || message.op === 'unsubscribe') {
      this.emit('response', message);
      return;
    }

    // Handle authentication responses
    if (message.op === 'auth') {
      this.emit('response', message);
      return;
    }

    // Handle data updates
    if (message.topic) {
      this.emit('update', {
        category,
        topic: message.topic,
        data: message.data,
        type: message.type,
      });
      return;
    }

    // Handle other messages
    this.emit('message', { category, message });
  }

  private sendWSMessage(category: V5WSCategory, message: any): void {
    const wsKey = this.getWsKey(category);
    const ws = this.wsStore.getWs(wsKey);
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      throw new Error(`WebSocket for ${category} is not connected`);
    }

    const messageStr = JSON.stringify(message);
    this.logger.debug(`Sending message to ${category}:`, messageStr);
    ws.send(messageStr);
  }

  private startPingPong(category: V5WSCategory): void {
    const wsKey = this.getWsKey(category);
    const pingInterval = setInterval(() => {
      if (!this.wsStore.isWsOpen(wsKey)) {
        clearInterval(pingInterval);
        return;
      }

      try {
        this.sendWSMessage(category, { op: 'ping' });
      } catch (error) {
        this.logger.error(`Failed to send ping to ${category}:`, error);
        clearInterval(pingInterval);
      }
    }, this.options.pingInterval);
  }

  private handleReconnection(category: V5WSCategory): void {
    const reconnectDelay = this.options.reconnectTimeout!;
    
    this.logger.info(`Attempting to reconnect ${category} in ${reconnectDelay}ms`);
    
    setTimeout(async () => {
      try {
        const wsUrl = this.getWsBaseUrl(category);
        await this.connectWS(category, wsUrl);
        
        // Restore subscriptions
        const wsKey = this.getWsKey(category);
        const topics = Array.from(this.wsStore.getTopics(wsKey));
        if (topics.length > 0) {
          this.logger.info(`Restoring ${topics.length} subscriptions for ${category}`);
          this.subscribe(category, topics);
        }
      } catch (error) {
        this.logger.error(`Failed to reconnect ${category}:`, error);
        // Try again with exponential backoff
        this.options.reconnectTimeout = Math.min(this.options.reconnectTimeout! * 2, 30000);
        this.handleReconnection(category);
      }
    }, reconnectDelay);
  }

  private generateRequestId(): string {
    return `req_${++this.requestIdCounter}_${Date.now()}`;
  }

  // Convenience methods for common subscriptions

  /**
   * Subscribe to orderbook updates
   */
  public subscribeOrderbook(category: Exclude<V5WSCategory, 'private'>, symbol: string, depth: number = 1): void {
    this.subscribePublicTopic(category, `orderbook.${depth}.${symbol}`);
  }

  /**
   * Subscribe to trade updates
   */
  public subscribeTrades(category: Exclude<V5WSCategory, 'private'>, symbol: string): void {
    this.subscribePublicTopic(category, `publicTrade.${symbol}`);
  }

  /**
   * Subscribe to ticker updates
   */
  public subscribeTicker(category: Exclude<V5WSCategory, 'private'>, symbol: string): void {
    this.subscribePublicTopic(category, `tickers.${symbol}`);
  }

  /**
   * Subscribe to kline updates
   */
  public subscribeKline(category: Exclude<V5WSCategory, 'private'>, symbol: string, interval: string): void {
    this.subscribePublicTopic(category, `kline.${interval}.${symbol}`);
  }

  /**
   * Subscribe to private order updates
   */
  public subscribeOrders(): void {
    this.subscribePrivateTopic(['order']);
  }

  /**
   * Subscribe to private position updates
   */
  public subscribePositions(): void {
    this.subscribePrivateTopic(['position']);
  }

  /**
   * Subscribe to private execution updates
   */
  public subscribeExecutions(): void {
    this.subscribePrivateTopic(['execution']);
  }

  /**
   * Subscribe to wallet updates
   */
  public subscribeWallet(): void {
    this.subscribePrivateTopic(['wallet']);
  }
}
