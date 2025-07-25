# Migration Guide: Upgrading to Bybit V5 API

This guide will help you migrate from the older Bybit APIs to the new V5 API, which provides a unified interface for all trading categories.

## Overview

The V5 API offers several advantages:
- **Unified Interface**: One REST client and WebSocket client for all trading categories (spot, linear, inverse, options)
- **Latest Features**: Access to all the newest Bybit features and improvements
- **Better Performance**: Optimized endpoints and improved rate limits
- **Future-Proof**: V5 is the current and actively maintained API version

## Quick Migration

### Before (Multiple Clients)
```typescript
import { 
  SpotClientV3, 
  LinearClient, 
  InverseClient, 
  WebsocketClient 
} from 'bybit-api';

// Multiple clients for different trading categories
const spotClient = new SpotClientV3({ key: 'xxx', secret: 'yyy' });
const linearClient = new LinearClient({ key: 'xxx', secret: 'yyy' });
const inverseClient = new InverseClient({ key: 'xxx', secret: 'yyy' });

// Multiple WebSocket clients for different markets
const linearWs = new WebsocketClient({ market: 'linear', key: 'xxx', secret: 'yyy' });
const spotWs = new WebsocketClient({ market: 'spotv3', key: 'xxx', secret: 'yyy' });
```

### After (V5 Unified)
```typescript
import { RestClientV5, WebSocketClientV5 } from 'bybit-api';

// Single REST client for all trading categories
const client = new RestClientV5({
  key: 'xxx',
  secret: 'yyy',
  testnet: false,
  enable_time_sync: true,
});

// Single WebSocket client for all categories
const wsClient = new WebSocketClientV5({
  key: 'xxx',
  secret: 'yyy',
  testnet: false,
});
```

## API Method Mapping

### REST API Methods

| Old API | Old Method | V5 Method | Notes |
|---------|------------|-----------|--------|
| SpotClientV3 | `getSymbols()` | `getInstrumentsInfo({ category: 'spot' })` | More detailed instrument info |
| SpotClientV3 | `getOrderBook()` | `getOrderbook({ category: 'spot', symbol: 'BTCUSDT' })` | Unified orderbook format |
| LinearClient | `getTickers()` | `getTickers({ category: 'linear' })` | Unified ticker format |
| LinearClient | `getKline()` | `getKline({ category: 'linear', symbol: 'BTCUSDT', interval: '1h' })` | More interval options |
| All Clients | `getWalletBalance()` | `getWalletBalance({ accountType: 'UNIFIED' })` | Unified account types |
| All Clients | `placeOrder()` | `placeOrder({ category: 'spot', symbol: 'BTCUSDT', ... })` | Category-based routing |

### WebSocket Subscriptions

| Old WebSocket | Old Subscription | V5 Subscription | Notes |
|---------------|------------------|-----------------|--------|
| `market: 'spotv3'` | `ws.subscribe('orderbook.1.BTCUSDT')` | `ws.subscribeOrderbook('spot', 'BTCUSDT', 1)` | Method-based subscriptions |
| `market: 'linear'` | `ws.subscribe('trade.BTCUSDT')` | `ws.subscribeTrades('linear', 'BTCUSDT')` | Category-specific subscriptions |
| `market: 'linear'` | `ws.subscribe('kline.BTCUSDT.1m')` | `ws.subscribeKline('linear', 'BTCUSDT', '1m')` | Cleaner syntax |

## Step-by-Step Migration

### 1. Update Dependencies

Make sure you have the latest version of the bybit-api package:

```bash
npm update bybit-api
```

### 2. Replace Client Imports

```typescript
// OLD
import { 
  SpotClientV3, 
  LinearClient, 
  InverseClient,
  WebsocketClient 
} from 'bybit-api';

// NEW
import { RestClientV5, WebSocketClientV5 } from 'bybit-api';
```

### 3. Update Client Initialization

```typescript
// OLD - Multiple clients
const spotClient = new SpotClientV3(options);
const linearClient = new LinearClient(options);

// NEW - Single client
const client = new RestClientV5(options);
```

### 4. Update API Calls

Add the `category` parameter to specify the trading category:

```typescript
// OLD
const spotTickers = await spotClient.getTickers();
const linearPositions = await linearClient.getPositions();

// NEW
const spotTickers = await client.getTickers({ category: 'spot' });
const linearPositions = await client.getPositionInfo({ category: 'linear' });
```

### 5. Update WebSocket Subscriptions

```typescript
// OLD
const ws = new WebsocketClient({ market: 'linear' });
ws.subscribe('trade.BTCUSDT');

// NEW
const ws = new WebSocketClientV5();
await ws.connect('linear');
ws.subscribeTrades('linear', 'BTCUSDT');
```

## Complete Example Migration

### Before (Old API)
```typescript
import { SpotClientV3, LinearClient, WebsocketClient } from 'bybit-api';

// Multiple clients
const spotClient = new SpotClientV3({ key: 'xxx', secret: 'yyy' });
const linearClient = new LinearClient({ key: 'xxx', secret: 'yyy' });

async function oldApiExample() {
  // Get spot balance
  const spotBalance = await spotClient.getWalletBalance();
  
  // Get linear positions
  const positions = await linearClient.getPositions();
  
  // Place spot order
  const spotOrder = await spotClient.placeOrder({
    symbol: 'BTCUSDT',
    side: 'Buy',
    type: 'Limit',
    qty: '0.001',
    price: '30000',
  });
  
  // WebSocket for linear
  const linearWs = new WebsocketClient({ market: 'linear' });
  linearWs.subscribe('trade.BTCUSDT');
}
```

### After (V5 API)
```typescript
import { RestClientV5, WebSocketClientV5 } from 'bybit-api';

// Single client for all categories
const client = new RestClientV5({
  key: 'xxx',
  secret: 'yyy',
  testnet: false,
  enable_time_sync: true,
});

async function v5ApiExample() {
  // Get unified wallet balance
  const balance = await client.getWalletBalance({
    accountType: 'UNIFIED',
  });
  
  // Get linear positions
  const positions = await client.getPositionInfo({
    category: 'linear',
  });
  
  // Place spot order
  const spotOrder = await client.placeOrder({
    category: 'spot',
    symbol: 'BTCUSDT',
    side: 'Buy',
    orderType: 'Limit',
    qty: '0.001',
    price: '30000',
    timeInForce: 'GTC',
  });
  
  // WebSocket for multiple categories
  const ws = new WebSocketClientV5();
  await ws.connect('linear');
  await ws.connect('spot');
  
  ws.subscribeTrades('linear', 'BTCUSDT');
  ws.subscribeTrades('spot', 'BTCUSDT');
}
```

## Key Differences

### 1. Category-Based Routing
V5 uses a `category` parameter to specify the trading type:
- `spot` - Spot trading
- `linear` - USDT/USDC perpetuals
- `inverse` - Inverse perpetuals
- `option` - Options trading

### 2. Unified Account Types
V5 supports different account types:
- `UNIFIED` - Unified trading account (recommended)
- `CONTRACT` - Derivatives trading account

### 3. Enhanced WebSocket
- Multiple category connections from one client
- Method-based subscriptions instead of string topics
- Better connection management and reconnection

### 4. Improved Type Safety
V5 provides better TypeScript support with more accurate type definitions.

## Benefits of V5

1. **Simplified Architecture**: One client instead of multiple clients
2. **Better Performance**: Optimized for speed and reliability
3. **More Features**: Access to latest trading features
4. **Future Updates**: Active development and new feature rollouts
5. **Better Documentation**: Comprehensive examples and type definitions

## Troubleshooting

### Common Issues

1. **Missing Category Parameter**
   ```typescript
   // ❌ Missing category
   await client.getTickers();
   
   // ✅ Include category
   await client.getTickers({ category: 'spot' });
   ```

2. **Wrong Account Type**
   ```typescript
   // ❌ Old account type
   await client.getWalletBalance();
   
   // ✅ Specify account type
   await client.getWalletBalance({ accountType: 'UNIFIED' });
   ```

3. **WebSocket Connection**
   ```typescript
   // ❌ Forgetting to connect
   ws.subscribeTrades('spot', 'BTCUSDT');
   
   // ✅ Connect first
   await ws.connect('spot');
   ws.subscribeTrades('spot', 'BTCUSDT');
   ```

## Getting Help

- Check the [examples](./examples/) folder for working code samples
- Review the [README](./README.md) for comprehensive documentation
- Use the TypeScript definitions for method signatures and parameters
- Test with the provided example files: `examples/rest-v5-example.ts` and `examples/websocket-v5-example.ts`

The V5 API migration provides a much cleaner and more powerful interface for Bybit trading. While there are some syntax changes, the improved functionality and unified approach make it worth the upgrade.
