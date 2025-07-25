import axios, { AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import { signMessage } from './util/node-support';
import { RestClientOptions, APIID } from './util/requestUtils';
import { DefaultLogger } from './util/logger';

export interface V5APIResponse<T = any> {
  retCode: number;
  retMsg: string;
  result: T;
  retExtInfo: any;
  time: number;
}

export interface V5RestClientOptions extends RestClientOptions {
  /** Override the base URL for v5 API endpoints */
  baseUrl?: string;
}

export default class RestClientV5 {
  private timeOffset: number | null = null;
  private syncTimePromise: null | Promise<any> = null;
  private options: V5RestClientOptions;
  private baseUrl: string;
  private globalRequestOptions: AxiosRequestConfig;
  private key: string | undefined;
  private secret: string | undefined;

  constructor(
    restOptions: V5RestClientOptions = {},
    networkOptions: AxiosRequestConfig = {}
  ) {
    this.options = {
      recv_window: 5000,
      strict_param_validation: false,
      enable_time_sync: false,
      sync_interval_ms: 3600000,
      ...restOptions,
    };

    this.globalRequestOptions = {
      timeout: 1000 * 60 * 5, // 5 minutes timeout
      ...networkOptions,
      headers: {
        'X-Referer': APIID,
        'Content-Type': 'application/json',
        ...networkOptions.headers,
      },
    };

    this.baseUrl = this.getV5BaseUrl();
    this.key = this.options.key;
    this.secret = this.options.secret;

    if (this.key && !this.secret) {
      throw new Error(
        'API Key & Secret are both required for private endpoints'
      );
    }

    if (this.options.enable_time_sync) {
      this.syncTime();
      setInterval(this.syncTime.bind(this), +this.options.sync_interval_ms!);
    }
  }

  private getV5BaseUrl(): string {
    if (this.options.baseUrl) {
      return this.options.baseUrl;
    }

    if (this.options.testnet) {
      return 'https://api-testnet.bybit.com';
    }

    return 'https://api.bybit.com';
  }

  // Public API methods
  public get<T = any>(endpoint: string, params?: any): Promise<V5APIResponse<T>> {
    return this._call('GET', endpoint, params, true);
  }

  // Private API methods  
  public getPrivate<T = any>(endpoint: string, params?: any): Promise<V5APIResponse<T>> {
    return this._call('GET', endpoint, params, false);
  }

  public post<T = any>(endpoint: string, params?: any): Promise<V5APIResponse<T>> {
    return this._call('POST', endpoint, params, true);
  }

  public postPrivate<T = any>(endpoint: string, params?: any): Promise<V5APIResponse<T>> {
    return this._call('POST', endpoint, params, false);
  }

  public deletePrivate<T = any>(endpoint: string, params?: any): Promise<V5APIResponse<T>> {
    return this._call('DELETE', endpoint, params, false);
  }

  // Market Data endpoints
  public getServerTime(): Promise<V5APIResponse<{ timeSecond: string; timeNano: string }>> {
    return this.get('/v5/market/time');
  }

  public getKline(params: {
    category: 'spot' | 'linear' | 'inverse' | 'option';
    symbol: string;
    interval: string;
    start?: number;
    end?: number;
    limit?: number;
  }): Promise<V5APIResponse<any>> {
    return this.get('/v5/market/kline', params);
  }

  public getOrderbook(params: {
    category: 'spot' | 'linear' | 'inverse' | 'option';
    symbol: string;
    limit?: number;
  }): Promise<V5APIResponse<any>> {
    return this.get('/v5/market/orderbook', params);
  }

  public getTickers(params: {
    category: 'spot' | 'linear' | 'inverse' | 'option';
    symbol?: string;
    baseCoin?: string;
    expDate?: string;
  }): Promise<V5APIResponse<any>> {
    return this.get('/v5/market/tickers', params);
  }

  public getInstrumentsInfo(params: {
    category: 'spot' | 'linear' | 'inverse' | 'option';
    symbol?: string;
    baseCoin?: string;
    limit?: number;
    cursor?: string;
  }): Promise<V5APIResponse<any>> {
    return this.get('/v5/market/instruments-info', params);
  }

  // Trading endpoints (private)
  public placeOrder(params: {
    category: 'spot' | 'linear' | 'inverse' | 'option';
    symbol: string;
    side: 'Buy' | 'Sell';
    orderType: 'Market' | 'Limit';
    qty: string;
    price?: string;
    timeInForce?: 'GTC' | 'IOC' | 'FOK' | 'PostOnly';
    orderLinkId?: string;
    isLeverage?: 0 | 1;
    orderFilter?: 'Order' | 'tpslOrder' | 'StopOrder';
    triggerDirection?: 1 | 2;
    triggerPrice?: string;
    triggerBy?: 'LastPrice' | 'IndexPrice' | 'MarkPrice';
    orderIv?: string;
    positionIdx?: 0 | 1 | 2;
    takeProfit?: string;
    stopLoss?: string;
    tpTriggerBy?: 'LastPrice' | 'IndexPrice' | 'MarkPrice';
    slTriggerBy?: 'LastPrice' | 'IndexPrice' | 'MarkPrice';
    reduceOnly?: boolean;
    closeOnTrigger?: boolean;
    mmp?: boolean;
  }): Promise<V5APIResponse<any>> {
    return this.postPrivate('/v5/order/create', params);
  }

  public cancelOrder(params: {
    category: 'spot' | 'linear' | 'inverse' | 'option';
    symbol: string;
    orderId?: string;
    orderLinkId?: string;
    orderFilter?: 'Order' | 'tpslOrder' | 'StopOrder';
  }): Promise<V5APIResponse<any>> {
    return this.postPrivate('/v5/order/cancel', params);
  }

  public getOrders(params: {
    category: 'spot' | 'linear' | 'inverse' | 'option';
    symbol?: string;
    baseCoin?: string;
    settleCoin?: string;
    orderId?: string;
    orderLinkId?: string;
    openOnly?: 0 | 1;
    orderFilter?: 'Order' | 'tpslOrder' | 'StopOrder';
    limit?: number;
    cursor?: string;
  }): Promise<V5APIResponse<any>> {
    return this.getPrivate('/v5/order/realtime', params);
  }

  public getOrderHistory(params: {
    category: 'spot' | 'linear' | 'inverse' | 'option';
    symbol?: string;
    baseCoin?: string;
    settleCoin?: string;
    orderId?: string;
    orderLinkId?: string;
    orderFilter?: 'Order' | 'tpslOrder' | 'StopOrder';
    orderStatus?: string;
    startTime?: number;
    endTime?: number;
    limit?: number;
    cursor?: string;
  }): Promise<V5APIResponse<any>> {
    return this.getPrivate('/v5/order/history', params);
  }

  // Position endpoints
  public getPositionInfo(params: {
    category: 'linear' | 'inverse' | 'option';
    symbol?: string;
    baseCoin?: string;
    settleCoin?: string;
    limit?: number;
    cursor?: string;
  }): Promise<V5APIResponse<any>> {
    return this.getPrivate('/v5/position/list', params);
  }

  public setLeverage(params: {
    category: 'linear' | 'inverse';
    symbol: string;
    buyLeverage: string;
    sellLeverage: string;
  }): Promise<V5APIResponse<any>> {
    return this.postPrivate('/v5/position/set-leverage', params);
  }

  // Account endpoints
  public getWalletBalance(params: {
    accountType: 'UNIFIED' | 'CONTRACT' | 'SPOT' | 'INVESTMENT' | 'OPTION' | 'FUND';
    coin?: string;
  }): Promise<V5APIResponse<any>> {
    return this.getPrivate('/v5/account/wallet-balance', params);
  }

  public getFeeRate(params: {
    category: 'spot' | 'linear' | 'inverse' | 'option';
    symbol?: string;
    baseCoin?: string;
  }): Promise<V5APIResponse<any>> {
    return this.getPrivate('/v5/account/fee-rate', params);
  }

  // Asset endpoints
  public getCoinBalance(params: {
    accountType: 'SPOT' | 'CONTRACT' | 'INVESTMENT' | 'OPTION' | 'UNIFIED' | 'FUND';
    coin?: string;
  }): Promise<V5APIResponse<any>> {
    return this.getPrivate('/v5/asset/coin/query-info', params);
  }

  public getAllCoinBalance(params: {
    accountType: 'SPOT' | 'CONTRACT' | 'INVESTMENT' | 'OPTION' | 'UNIFIED' | 'FUND';
  }): Promise<V5APIResponse<any>> {
    return this.getPrivate('/v5/asset/account/query-coin-balance', params);
  }

  private async buildRequest(
    method: Method,
    url: string,
    params?: any,
    isPublicApi?: boolean
  ): Promise<AxiosRequestConfig> {
    const options: AxiosRequestConfig = {
      ...this.globalRequestOptions,
      url: url,
      method: method,
    };

    // Remove undefined params
    if (params) {
      for (const key in params) {
        if (typeof params[key] === 'undefined') {
          delete params[key];
        }
      }
    }

    if (isPublicApi) {
      if (method === 'GET') {
        return {
          ...options,
          params: params,
        };
      }
      return {
        ...options,
        data: params,
      };
    }

    // Private endpoints require authentication
    if (!this.key || !this.secret) {
      throw new Error('Private endpoints require API key and secret');
    }

    if (this.timeOffset === null) {
      await this.syncTime();
    }

    const timestamp = Date.now() + (this.timeOffset || 0);
    const recvWindow = this.options.recv_window || 5000;

    if (!options.headers) {
      options.headers = {};
    }

    options.headers['X-BAPI-API-KEY'] = this.key;
    options.headers['X-BAPI-TIMESTAMP'] = timestamp.toString();
    options.headers['X-BAPI-RECV-WINDOW'] = recvWindow.toString();

    // Create signature
    let queryString = '';
    if (method === 'GET' && params) {
      queryString = Object.keys(params)
        .sort()
        .map(key => `${key}=${params[key]}`)
        .join('&');
    } else if (method !== 'GET' && params) {
      queryString = JSON.stringify(params);
    }

    const signaturePayload = timestamp + this.key + recvWindow + queryString;
    const signature = await signMessage(signaturePayload, this.secret);
    options.headers['X-BAPI-SIGN'] = signature;

    if (method === 'GET') {
      return {
        ...options,
        params: params,
      };
    }

    return {
      ...options,
      data: params,
    };
  }

  private async _call<T = any>(
    method: Method,
    endpoint: string,
    params?: any,
    isPublicApi?: boolean
  ): Promise<V5APIResponse<T>> {
    const requestUrl = [this.baseUrl, endpoint].join(
      endpoint.startsWith('/') ? '' : '/'
    );

    const options = await this.buildRequest(
      method,
      requestUrl,
      params,
      isPublicApi
    );

    return axios(options)
      .then((response: AxiosResponse) => {
        if (response.status === 200) {
          return response.data as V5APIResponse<T>;
        }
        throw response;
      })
      .catch((e) => this.parseException(e));
  }

  private parseException(e: any): never {
    if (this.options.parse_exceptions === false) {
      throw e;
    }

    if (!e.response) {
      if (!e.request) {
        throw new Error(e.message || 'Unknown error');
      }
      throw new Error('Request failed: no response received');
    }

    const response: AxiosResponse = e.response;
    const error = {
      code: response.status,
      message: response.statusText,
      body: response.data,
      headers: response.headers,
      requestOptions: this.options,
    };

    throw error;
  }

  private async syncTime(force?: boolean): Promise<any> {
    if (!force && !this.options.enable_time_sync) {
      this.timeOffset = 0;
      return Promise.resolve(false);
    }

    if (this.syncTimePromise !== null) {
      return this.syncTimePromise;
    }

    this.syncTimePromise = this.fetchTimeOffset().then((offset) => {
      this.timeOffset = offset;
      this.syncTimePromise = null;
    });

    return this.syncTimePromise;
  }

  private async fetchTimeOffset(): Promise<number> {
    try {
      const start = Date.now();
      const serverTimeResponse = await this.getServerTime();

      if (!serverTimeResponse?.result?.timeSecond) {
        throw new Error('Invalid server time response');
      }

      const serverTime = parseInt(serverTimeResponse.result.timeSecond) * 1000;
      const end = Date.now();

      const avgDrift = (end - start) / 2;
      return Math.ceil(serverTime - end + avgDrift);
    } catch (e) {
      DefaultLogger.error('Failed to fetch time offset: ', e);
      return 0;
    }
  }
}
