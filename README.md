# Node.js & Typescript Bybit API SDK (with V5 Support)
[![Tests](https://circleci.com/gh/tiagosiebler/bybit-api.svg?style=shield)](https://circleci.com/gh/tiagosiebler/bybit-api)
[![npm version](https://img.shields.io/npm/v/bybit-api)][1] [![npm size](https://img.shields.io/bundlephobia/min/bybit-api/latest)][1] [![npm downloads](https://img.shields.io/npm/dt/bybit-api)][1]
[![last commit](https://img.shields.io/github/last-commit/tiagosiebler/bybit-api)][1]
[![CodeFactor](https://www.codefactor.io/repository/github/tiagosiebler/bybit-api/badge)](https://www.codefactor.io/repository/github/tiagosiebler/bybit-api)

[![connector logo](https://cdn.builder.io/api/v1/image/assets%2Ffddee401a9284ab792b271538c28932d%2F5190c99403ac474699a1959fdee1ab6c?format=webp&width=2000)][1]

[1]: https://www.npmjs.com/package/bybit-api

Node.js connector for the Bybit APIs and WebSockets with full V5 API support:
- Complete integration with all bybit APIs.
- TypeScript support (with type declarations for most API requests & responses).
- Over 300 end-to-end tests making real API calls & WebSocket connections, validating any changes before they reach npm.
- Robust WebSocket integration with configurable connection heartbeats & automatic reconnect then resubscribe workflows.
- Browser support (via webpack bundle - see "Browser Usage" below).

## Installation
`npm install --save bybit-api`

## Issues & Discussion
- Issues? Check the [issues tab](https://github.com/tiagosiebler/bybit-api/issues).
- Discuss & collaborate with other node devs? Join our [Node.js Algo Traders](https://t.me/nodetraders) engineering community on telegram.

## Related projects
Check out my related projects:
- Try my connectors:
  - [binance](https://www.npmjs.com/package/binance)
  - [bybit-api](https://www.npmjs.com/package/bybit-api)
  - [okx-api](https://www.npmjs.com/package/okx-api)
  - [ftx-api](https://www.npmjs.com/package/ftx-api)
- Try my misc utilities:
  - [orderbooks](https://www.npmjs.com/package/orderbooks)
- Check out my examples:
  - [awesome-crypto-examples](https://github.com/tiagosiebler/awesome-crypto-examples)

## Documentation
Most methods accept JS objects. These can be populated using parameters specified by Bybit's API documentation, or check the type definition in each class within this repository (see table below for convenient links to each class).
- [Bybit API Docs (choose API category from the tabs at the top)](https://bybit-exchange.github.io/docs/futuresV2/inverse/#t-introduction).

## Structure
This connector is fully compatible with both TypeScript and pure JavaScript projects, while the connector is written in TypeScript. A pure JavaScript version can be built using `npm run build`, which is also the version published to [npm](https://www.npmjs.com/package/bybit-api).

The version on npm is the output from the `build` command and can be used in projects without TypeScript (although TypeScript is definitely recommended).

- [src](./src) - the whole connector written in TypeScript
- [lib](./lib) - the JavaScript version of the project (built from TypeScript). This should not be edited directly, as it will be overwritten with each release.
- [dist](./dist) - the webpack bundle of the project for use in browser environments (see guidance on webpack below).
- [examples](./examples) - some implementation examples & demonstrations. Contributions are welcome!

---
## REST API Clients
Each REST API group has a dedicated REST client. To avoid confusion, here are the available REST clients and the corresponding API groups:
|                         Class                               	        |                                                                 Description                                       	          |
|:------------------------------------------------------------------:   |:----------------------------------------------------------------------------------------------------------------------------: |
| [ **Derivatives v3** ]              	                                | The Derivatives v3 APIs (successor to the Futures V2 APIs)                                                                     |
| [UnifiedMarginClient](src/unified-margin-client.ts)                   | [Derivatives (v3) Unified Margin APIs](https://bybit-exchange.github.io/docs/derivativesV3/unified_margin/#t-introduction)    |
| [ContractClient](src/contract-client.ts)                              | [Derivatives (v3) Contract APIs](https://bybit-exchange.github.io/docs/derivativesV3/contract).                               |
| [ **Futures v2** ]              	                                    | The Futures v2 APIs                                                                                                           |
| [InverseClient](src/inverse-client.ts)                	              | [Inverse Perpetual Futures (v2) APIs](https://bybit-exchange.github.io/docs/futuresV2/inverse/)                               |
| [LinearClient](src/linear-client.ts)                  	              | [USDT Perpetual Futures (v2) APIs](https://bybit-exchange.github.io/docs/futuresV2/linear/#t-introduction)                    |
| [InverseFuturesClient](src/inverse-futures-client.ts) 	              | [Inverse Futures (v2) APIs](https://bybit-exchange.github.io/docs/futuresV2/inverse_futures/#t-introduction)                  |
| [ **Spot** ]              	                                          | The spot APIs                                                                                                                 |
| [SpotClientV3](src/spot-client-v3.ts)                                 | [Spot Market (v3) APIs](https://bybit-exchange.github.io/docs/spot/v3/#t-introduction)                   	                    |
| [~SpotClient~](src/spot-client.ts) (deprecated, SpotClientV3 recommended)| [Spot Market (v1) APIs](https://bybit-exchange.github.io/docs/spot/v1/#t-introduction)                   	                |
| [ **USDC Contract** ]              	                                  | The USDC Contract APIs                                                                                                        |
| [USDCPerpetualClient](src/usdc-perpetual-client.ts)                   | [USDC Perpetual APIs](https://bybit-exchange.github.io/docs/usdc/option/?console#t-querydeliverylog)                          |
| [USDCOptionClient](src/usdc-option-client.ts)                         | [USDC Option APIs](https://bybit-exchange.github.io/docs/usdc/option/#t-introduction)                                         |
| [ **Other** ]              	                                          | Other standalone API groups                                                                                                   |
| [AccountAssetClient](src/account-asset-client.ts)                     | [Account Asset APIs](https://bybit-exchange.github.io/docs/account_asset/#t-introduction)                                     |
| [CopyTradingClient](src/copy-trading-client.ts)                       | [Copy Trading APIs](https://bybit-exchange.github.io/docs/copy_trading/#t-introduction)           	                          |
| [WebsocketClient](src/websocket-client.ts)                            | All WebSocket Events (Public & Private for all API categories)                                                                |
| [ **V5 API (Latest)** ]              	                              | The latest V5 APIs - unified interface for all trading categories                                                              |
| [RestClientV5](src/rest-client-v5.ts)                                 | [V5 REST APIs](https://bybit-exchange.github.io/docs/v5/intro) - Unified REST client for all V5 endpoints                    |
| [WebSocketClientV5](src/websocket-client-v5.ts)                       | [V5 WebSocket APIs](https://bybit-exchange.github.io/docs/v5/ws/connect) - Unified WebSocket client for V5 real-time data    |

Examples for using each client can be found in:
- the [examples](./examples) folder.
- the [awesome-crypto-examples](https://github.com/tiagosiebler/awesome-crypto-examples) repository.

If you're missing an example, you're welcome to request one. Priority will be given to [github sponsors](https://github.com/sponsors/tiagosiebler).

### Usage
Create API credentials on Bybit's website:
- [Livenet](https://bybit.com/app/user/api-management?affiliate_id=9410&language=en-US&group_id=0&group_type=1)
- [Testnet](https://testnet.bybit.com/app/user/api-management)

All REST clients have can be used in a similar way. However, method names, parameters and responses may vary depending on the API category you're using!

Not sure which function to call or which parameters to use? Click the class name in the table above to look at all the function names (they are in the same order as the official API docs), and check the API docs for a list of endpoints/paramters/responses.

```typescript
const {
  InverseClient,
  LinearClient,
  InverseFuturesClient,
  SpotClient,
  SpotClientV3,
  UnifiedMarginClient,
  USDCOptionClient,
  USDCPerpetualClient,
  AccountAssetClient,
  CopyTradingClient,
} = require('bybit-api');

const restClientOptions = {
  /** Your API key. Optional, if you plan on making private api calls */
  key?: string;

  /** Your API secret. Optional, if you plan on making private api calls */
  secret?: string;

  /** Set to `true` to connect to testnet. Uses the live environment by default. */
  testnet?: boolean;

  /** Override the max size of the request window (in ms) */
  recv_window?: number;

  /** Disabled by default. This can help on machines with consistent latency problems. */
  enable_time_sync?: boolean;

  /** How often to sync time drift with bybit servers */
  sync_interval_ms?: number | string;

  /** Default: false. If true, we'll throw errors if any params are undefined */
  strict_param_validation?: boolean;

  /**
   * Optionally override API protocol + domain
   * e.g baseUrl: 'https://api.bytick.com'
   **/
  baseUrl?: string;

  /** Default: true. whether to try and post-process request exceptions. */
  parse_exceptions?: boolean;
};

const API_KEY = 'xxx';
const API_SECRET = 'yyy';
const useTestnet = false;

const client = new InverseClient({
  key: API_KEY,
  secret: API_SECRET,
  testnet: useTestnet
},
  // requestLibraryOptions
);

// For public-only API calls, simply don't provide a key & secret or set them to undefined
// const client = new InverseClient({});

client.getApiKeyInfo()
  .then(result => {
    console.log("getApiKeyInfo result: ", result);
  })
  .catch(err => {
    console.error("getApiKeyInfo error: ", err);
  });

client.getOrderBook({ symbol: 'BTCUSD' })
  .then(result => {
    console.log("getOrderBook result: ", result);
  })
  .catch(err => {
    console.error("getOrderBook error: ", err);
  });
```

### V5 API Usage (Recommended)

The V5 API provides a unified interface for all trading categories. It's the latest and most feature-complete API from Bybit.

```typescript
const { RestClientV5, WebSocketClientV5 } = require('bybit-api');

// Initialize V5 REST client
const client = new RestClientV5({
  key: 'your_api_key',
  secret: 'your_api_secret',
  testnet: true, // Set to false for mainnet
  enable_time_sync: true,
});

// Public API examples
async function v5Examples() {
  // Get server time
  const serverTime = await client.getServerTime();
  console.log('Server time:', serverTime);

  // Get instruments info for spot trading
  const instruments = await client.getInstrumentsInfo({
    category: 'spot',
    limit: 10,
  });
  console.log('Spot instruments:', instruments);

  // Get orderbook
  const orderbook = await client.getOrderbook({
    category: 'spot',
    symbol: 'BTCUSDT',
    limit: 25,
  });
  console.log('BTCUSDT orderbook:', orderbook);

  // Get kline data
  const klines = await client.getKline({
    category: 'linear',
    symbol: 'BTCUSDT',
    interval: '1h',
    limit: 50,
  });
  console.log('Klines:', klines);

  // Private API examples (requires API credentials)
  
  // Get wallet balance
  const balance = await client.getWalletBalance({
    accountType: 'UNIFIED',
  });
  console.log('Wallet balance:', balance);

  // Place an order
  const order = await client.placeOrder({
    category: 'spot',
    symbol: 'BTCUSDT',
    side: 'Buy',
    orderType: 'Limit',
    qty: '0.001',
    price: '30000',
    timeInForce: 'GTC',
  });
  console.log('Order placed:', order);

  // Get positions (for derivatives)
  const positions = await client.getPositionInfo({
    category: 'linear',
    symbol: 'BTCUSDT',
  });
  console.log('Positions:', positions);
}

// V5 WebSocket usage
const wsClient = new WebSocketClientV5({
  key: 'your_api_key',
  secret: 'your_api_secret',
  testnet: true,
});

// Set up event listeners
wsClient.on('update', (data) => {
  console.log('Market data update:', data);
});

wsClient.on('open', (data) => {
  console.log(`Connected to ${data.category} WebSocket`);
});

async function v5WebSocketExamples() {
  // Connect to different categories
  await wsClient.connect('spot');
  await wsClient.connect('linear');
  
  // Subscribe to market data
  wsClient.subscribeOrderbook('spot', 'BTCUSDT', 1);
  wsClient.subscribeTrades('spot', 'BTCUSDT');
  wsClient.subscribeTicker('linear', 'BTCUSDT');
  wsClient.subscribeKline('linear', 'BTCUSDT', '1m');

  // Subscribe to private data (requires authentication)
  if (wsClient['options'].key && wsClient['options'].secret) {
    await wsClient.connect('private');
    wsClient.subscribeOrders();
    wsClient.subscribePositions();
    wsClient.subscribeExecutions();
    wsClient.subscribeWallet();
  }
}
```

## WebSockets
All API groups can be used via a shared `WebsocketClient`. However, to listen to multiple API groups at once, you will need to make one WebsocketClient instance per API group.

The WebsocketClient can be configured to a specific API group using the market parameter. These are the currently available API groups:
|         API Category         	|        Market       	| Description                                                                                                                                                                                            	|
|:----------------------------:	|:-------------------:	|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------	|
| Unified Margin - Options   | `market: 'unifiedOption'`| The [derivatives v3](https://bybit-exchange.github.io/docs/derivativesV3/unified_margin/#t-websocket) category for unified margin. Note: public topics only support options topics. If you need USDC/USDT perps, use `unifiedPerp` instead. |
| Unified Margin - Perps    	| `market: 'unifiedPerp'` | The [derivatives v3](https://bybit-exchange.github.io/docs/derivativesV3/unified_margin/#t-websocket) category for unified margin. Note: public topics only support USDT/USDC perpetual topics - use `unifiedOption` if you need public options topics. |
| Futures v2 - Inverse Perps   	| `market: 'inverse'` 	| The [inverse v2 perps](https://bybit-exchange.github.io/docs/futuresV2/inverse/#t-websocket) category.                                                                                                 	|
| Futures v2 - USDT Perps      	| `market: 'linear'`  	| The [USDT/linear v2 perps](https://bybit-exchange.github.io/docs/futuresV2/linear/#t-websocket) category.                                                                                              	|
| Futures v2 - Inverse Futures 	| `market: 'inverse'` 	| The [inverse futures v2](https://bybit-exchange.github.io/docs/futuresV2/inverse_futures/#t-websocket) category uses the same market as inverse perps.                                                 	|
| Spot v3                      	| `market: 'spotv3'`  	| The [spot v3](https://bybit-exchange.github.io/docs/spot/v3/#t-websocket) category.                                                                                                                    	|
| Spot v1                      	| `market: 'spot'`    	| The older [spot v1](https://bybit-exchange.github.io/docs/spot/v1/#t-websocket) category. Use the `spotv3` market if possible, as the v1 category does not have automatic re-subscribe if reconnected. 	|
| Copy Trading                 	| `market: 'linear'`  	| The [copy trading](https://bybit-exchange.github.io/docs/copy_trading/#t-websocket) category. Use the linear market to listen to all copy trading topics.                                               |
| USDC Perps                   	| `market: 'usdcPerp`   | The [USDC perps](https://bybit-exchange.github.io/docs/usdc/perpetual/#t-websocket) category.                                   	                                                                      |
| USDC Options                 	| `market: 'usdcOption'`| The [USDC options](https://bybit-exchange.github.io/docs/usdc/option/#t-websocket) category.                            	                                                                              |
| Contract v3 USDT              | `market: 'contractUSDT'`| The [Contract V3](https://bybit-exchange.github.io/docs/derivativesV3/contract/#t-websocket) category (USDT perps)    |
| Contract v3 Inverse           | `market: 'contractInverse'`| The [Contract V3](https://bybit-exchange.github.io/docs/derivativesV3/contract/#t-websocket) category (inverse perps)    |

```javascript
const { WebsocketClient } = require('bybit-api');

const API_KEY = 'xxx';
const PRIVATE_KEY = 'yyy';

const wsConfig = {
  key: API_KEY,
  secret: PRIVATE_KEY,

  /*
    The following parameters are optional:
  */

  // defaults to true == livenet
  // testnet: false

  // NOTE: to listen to multiple markets (spot vs inverse vs linear vs linearfutures) at once, make one WebsocketClient instance per market

  market: 'linear',
  // market: 'inverse',
  // market: 'spot',
  // market: 'spotv3',
  // market: 'usdcOption',
  // market: 'usdcPerp',
  // market: 'unifiedPerp',
  // market: 'unifiedOption',

  // how long to wait (in ms) before deciding the connection should be terminated & reconnected
  // pongTimeout: 1000,

  // how often to check (in ms) that WS connection is still alive
  // pingInterval: 10000,

  // how long to wait before attempting to reconnect (in ms) after connection is closed
  // reconnectTimeout: 500,

  // config options sent to RestClient (used for time sync). See RestClient docs.
  // restOptions: { },

  // config for axios used for HTTP requests. E.g for proxy support
  // requestOptions: { }

  // override which URL to use for websocket connections
  // wsUrl: 'wss://stream.bytick.com/realtime'
};

const ws = new WebsocketClient(wsConfig);

// subscribe to multiple topics at once
ws.subscribe(['position', 'execution', 'trade']);

// and/or subscribe to individual topics on demand
ws.subscribe('kline.BTCUSD.1m');

// Listen to events coming from websockets. This is the primary data source
ws.on('update', data => {
  console.log('update', data);
});

// Optional: Listen to websocket connection open event (automatic after subscribing to one or more topics)
ws.on('open', ({ wsKey, event }) => {
  console.log('connection open for websocket with ID: ' + wsKey);
});

// Optional: Listen to responses to websocket queries (e.g. the response after subscribing to a topic)
ws.on('response', response => {
  console.log('response', response);
});

// Optional: Listen to connection close event. Unexpected connection closes are automatically reconnected.
ws.on('close', () => {
  console.log('connection closed');
});

// Optional: Listen to raw error events. Recommended.
ws.on('error', err => {
  console.error('error', err);
});
```

See [websocket-client.ts](./src/websocket-client.ts) for further information.

---

## Customise Logging
Pass a custom logger which supports the log methods `silly`, `debug`, `notice`, `info`, `warning` and `error`, or override methods from the default logger as desired.

```javascript
const { WebsocketClient, DefaultLogger } = require('bybit-api');

// Disable all logging on the silly level
const customLogger = {
  ...DefaultLogger,
  silly: () => {},
};

const ws = new WebsocketClient(
  { key: 'xxx', secret: 'yyy' },
  customLogger
);
```

## Browser Usage
Build a bundle using webpack:
- `npm install`
- `npm build`
- `npm pack`

The bundle can be found in `dist/`. Altough usage should be largely consistent, smaller differences will exist. Documentation is still TODO.

However, note that browser usage will lead to CORS errors due Bybit. See [issue #79](#79) for more information & alternative suggestions.

---

## Contributions & Thanks
### Donations
#### tiagosiebler
If you found this project interesting or useful, create accounts with my referral links:
- [Bybit](https://www.bybit.com/en-US/register?affiliate_id=9410&language=en-US&group_id=0&group_type=1)
- [Binance](https://www.binance.com/en/register?ref=20983262)

Or buy me a coffee using any of these:
- BTC: `1C6GWZL1XW3jrjpPTS863XtZiXL1aTK7Jk`
- ETH (ERC20): `0xd773d8e6a50758e1ada699bb6c4f98bb4abf82da`

#### pixtron
An early generation of this library was started by @pixtron. If this library helps you to trade better on bybit, feel free to donate a coffee to @pixtron:
- BTC `1Fh1158pXXudfM6ZrPJJMR7Y5SgZUz4EdF`
- ETH `0x21aEdeC53ab7593b77C9558942f0c9E78131e8d7`
- LTC `LNdHSVtG6UWsriMYLJR3qLdfVNKwJ6GSLF`

### Contributions & Pull Requests
Contributions are encouraged, I will review any incoming pull requests. See the issues tab for todo items.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=tiagosiebler/ftx-api,tiagosiebler/bybit-api,tiagosiebler/binance,tiagosiebler/orderbooks,tiagosiebler/okx-api,tiagosiebler/awesome-crypto-examples&type=Date)](https://star-history.com/#tiagosiebler/ftx-api&tiagosiebler/bybit-api&tiagosiebler/binance&tiagosiebler/orderbooks&tiagosiebler/okx-api&tiagosiebler/awesome-crypto-examples&Date)
