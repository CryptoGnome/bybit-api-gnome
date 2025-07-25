import { WebSocketClientV5 } from '../src';

// Example usage of the V5 WebSocket client
async function v5WebSocketExample() {
  console.log('=== V5 WebSocket Examples ===');

  // Initialize the V5 WebSocket client
  const wsClient = new WebSocketClientV5({
    key: 'your_api_key',
    secret: 'your_api_secret',
    testnet: true, // Set to false for mainnet
    pingInterval: 20000,
    pongTimeout: 10000,
    reconnectTimeout: 500,
    restoreSubscriptionsOnReconnect: true,
  });

  // Set up event listeners
  wsClient.on('open', (data) => {
    console.log(`WebSocket ${data.category} connected successfully`);
  });

  wsClient.on('update', (data) => {
    console.log(`Update from ${data.category}:`, {
      topic: data.topic,
      type: data.type,
      dataLength: Array.isArray(data.data) ? data.data.length : 1,
    });
  });

  wsClient.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  wsClient.on('close', (data) => {
    console.log(`WebSocket ${data.category} closed`);
  });

  try {
    // Connect to different categories
    console.log('\n--- Connecting to WebSocket categories ---');
    
    // Connect to spot WebSocket
    await wsClient.connect('spot');
    console.log('Connected to spot WebSocket');

    // Connect to linear WebSocket
    await wsClient.connect('linear');
    console.log('Connected to linear WebSocket');

    // Subscribe to public market data
    console.log('\n--- Subscribing to public topics ---');

    // Subscribe to spot orderbook
    wsClient.subscribeOrderbook('spot', 'BTCUSDT', 1);
    console.log('Subscribed to BTCUSDT spot orderbook');

    // Subscribe to spot trades
    wsClient.subscribeTrades('spot', 'BTCUSDT');
    console.log('Subscribed to BTCUSDT spot trades');

    // Subscribe to spot ticker
    wsClient.subscribeTicker('spot', 'BTCUSDT');
    console.log('Subscribed to BTCUSDT spot ticker');

    // Subscribe to linear klines
    wsClient.subscribeKline('linear', 'BTCUSDT', '1m');
    console.log('Subscribed to BTCUSDT linear 1m klines');

    // Subscribe to linear orderbook
    wsClient.subscribeOrderbook('linear', 'BTCUSDT', 25);
    console.log('Subscribed to BTCUSDT linear orderbook');

    // If you have API credentials, connect to private WebSocket
    if (wsClient['options'].key && wsClient['options'].secret) {
      console.log('\n--- Connecting to private WebSocket ---');
      await wsClient.connect('private');
      console.log('Connected to private WebSocket');

      // Subscribe to private topics
      console.log('\n--- Subscribing to private topics ---');
      wsClient.subscribeOrders();
      console.log('Subscribed to order updates');

      wsClient.subscribePositions();
      console.log('Subscribed to position updates');

      wsClient.subscribeExecutions();
      console.log('Subscribed to execution updates');

      wsClient.subscribeWallet();
      console.log('Subscribed to wallet updates');
    }

    // Let it run for a while to see data
    console.log('\n--- Running for 30 seconds to receive data ---');
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Unsubscribe from some topics
    console.log('\n--- Unsubscribing from some topics ---');
    wsClient.unsubscribe('spot', ['orderbook.1.BTCUSDT']);
    console.log('Unsubscribed from BTCUSDT spot orderbook');

    // Wait a bit more
    await new Promise(resolve => setTimeout(resolve, 5000));

  } catch (error) {
    console.error('WebSocket example error:', error);
  } finally {
    // Clean up
    console.log('\n--- Closing connections ---');
    wsClient.closeAll();
    console.log('All WebSocket connections closed');
  }
}

// Advanced WebSocket examples
async function v5WebSocketAdvancedExamples() {
  console.log('\n=== V5 WebSocket Advanced Examples ===');

  const wsClient = new WebSocketClientV5({
    testnet: true,
    pingInterval: 20000,
    reconnectTimeout: 1000,
    restoreSubscriptionsOnReconnect: true,
  });

  // Advanced event handling
  wsClient.on('update', (data) => {
    switch (data.topic) {
      case 'orderbook.1.BTCUSDT':
        handleOrderbookUpdate(data);
        break;
      case 'publicTrade.BTCUSDT':
        handleTradeUpdate(data);
        break;
      case 'tickers.BTCUSDT':
        handleTickerUpdate(data);
        break;
      default:
        console.log(`Unhandled topic: ${data.topic}`);
    }
  });

  try {
    // Connect to multiple categories
    await Promise.all([
      wsClient.connect('spot'),
      wsClient.connect('linear'),
      wsClient.connect('inverse'),
    ]);

    console.log('Connected to multiple WebSocket categories');

    // Subscribe to multiple symbols
    const symbols = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT'];
    
    for (const symbol of symbols) {
      // Subscribe to different data for each symbol
      wsClient.subscribeOrderbook('spot', symbol, 1);
      wsClient.subscribeTrades('spot', symbol);
      wsClient.subscribeTicker('linear', symbol);
    }

    console.log(`Subscribed to data for ${symbols.length} symbols`);

    // Run for a while
    await new Promise(resolve => setTimeout(resolve, 20000));

  } catch (error) {
    console.error('Advanced WebSocket example error:', error);
  } finally {
    wsClient.closeAll();
  }
}

// Helper functions for handling different types of updates
function handleOrderbookUpdate(data: any) {
  console.log('Orderbook update:', {
    symbol: data.topic.split('.')[2],
    bids: data.data?.b?.length || 0,
    asks: data.data?.a?.length || 0,
    timestamp: data.data?.ts,
  });
}

function handleTradeUpdate(data: any) {
  if (data.data && Array.isArray(data.data)) {
    data.data.forEach((trade: any) => {
      console.log('Trade update:', {
        symbol: trade.s,
        price: trade.p,
        quantity: trade.v,
        side: trade.S,
        timestamp: trade.T,
      });
    });
  }
}

function handleTickerUpdate(data: any) {
  console.log('Ticker update:', {
    symbol: data.data?.symbol,
    lastPrice: data.data?.lastPrice,
    bid1Price: data.data?.bid1Price,
    ask1Price: data.data?.ask1Price,
    volume24h: data.data?.volume24h,
    priceChangePercent: data.data?.price24hPcnt,
  });
}

// Error handling and reconnection examples
async function v5WebSocketErrorHandlingExamples() {
  console.log('\n=== V5 WebSocket Error Handling Examples ===');

  const wsClient = new WebSocketClientV5({
    testnet: true,
    reconnectTimeout: 1000,
    restoreSubscriptionsOnReconnect: true,
  });

  // Set up comprehensive error handling
  wsClient.on('error', (error) => {
    console.error('WebSocket error occurred:', error);
  });

  wsClient.on('close', (data) => {
    console.log(`WebSocket ${data.category} closed:`, data.event?.code, data.event?.reason);
  });

  wsClient.on('open', (data) => {
    console.log(`WebSocket ${data.category} reopened (possibly after reconnection)`);
  });

  try {
    // Connect and subscribe
    await wsClient.connect('spot');
    wsClient.subscribeOrderbook('spot', 'BTCUSDT', 1);
    wsClient.subscribeTicker('spot', 'BTCUSDT');

    console.log('Connected and subscribed to spot data');

    // Simulate running for a while
    console.log('Running for 15 seconds...');
    await new Promise(resolve => setTimeout(resolve, 15000));

    // Force close to test reconnection
    console.log('Force closing connection to test reconnection...');
    wsClient.close('spot');

    // Wait to see reconnection
    await new Promise(resolve => setTimeout(resolve, 10000));

  } catch (error) {
    console.error('Error handling example error:', error);
  } finally {
    wsClient.closeAll();
  }
}

// Private WebSocket examples (requires API credentials)
async function v5PrivateWebSocketExamples() {
  console.log('\n=== V5 Private WebSocket Examples ===');

  const wsClient = new WebSocketClientV5({
    key: 'your_api_key',
    secret: 'your_api_secret',
    testnet: true,
  });

  // Handle private data updates
  wsClient.on('update', (data) => {
    if (data.category === 'private') {
      switch (data.topic) {
        case 'order':
          console.log('Order update:', data.data);
          break;
        case 'position':
          console.log('Position update:', data.data);
          break;
        case 'execution':
          console.log('Execution update:', data.data);
          break;
        case 'wallet':
          console.log('Wallet update:', data.data);
          break;
        default:
          console.log('Private update:', data.topic, data.data);
      }
    }
  });

  try {
    // Connect to private WebSocket
    await wsClient.connect('private');
    console.log('Connected to private WebSocket');

    // Subscribe to all private topics
    wsClient.subscribeOrders();
    wsClient.subscribePositions();
    wsClient.subscribeExecutions();
    wsClient.subscribeWallet();

    console.log('Subscribed to all private topics');

    // Run for a while to receive any updates
    console.log('Listening for private updates for 30 seconds...');
    await new Promise(resolve => setTimeout(resolve, 30000));

  } catch (error) {
    console.error('Private WebSocket example error:', error);
    if (error.message?.includes('API key')) {
      console.log('Note: This example requires valid API credentials to work');
    }
  } finally {
    wsClient.closeAll();
  }
}

// Run examples
if (require.main === module) {
  v5WebSocketExample()
    .then(() => v5WebSocketAdvancedExamples())
    .then(() => v5WebSocketErrorHandlingExamples())
    .then(() => {
      console.log('\nNote: Private WebSocket examples require valid API credentials');
      console.log('Uncomment the line below to run private examples:');
      console.log('// return v5PrivateWebSocketExamples();');
    })
    .catch(console.error);
}

export { 
  v5WebSocketExample, 
  v5WebSocketAdvancedExamples, 
  v5WebSocketErrorHandlingExamples,
  v5PrivateWebSocketExamples 
};
