import { RestClientV5 } from '../src';

// Example usage of the V5 REST API client
async function v5RestExample() {
  // Initialize the V5 REST client
  const client = new RestClientV5({
    key: 'your_api_key',
    secret: 'your_api_secret',
    testnet: true, // Set to false for mainnet
    enable_time_sync: true,
  });

  try {
    // Public API examples
    console.log('=== V5 Public API Examples ===');

    // Get server time
    const serverTime = await client.getServerTime();
    console.log('Server time:', serverTime);

    // Get instruments info for spot
    const spotInstruments = await client.getInstrumentsInfo({
      category: 'spot',
      limit: 10,
    });
    console.log('Spot instruments:', spotInstruments);

    // Get orderbook for BTCUSDT
    const orderbook = await client.getOrderbook({
      category: 'spot',
      symbol: 'BTCUSDT',
      limit: 25,
    });
    console.log('BTCUSDT orderbook:', orderbook);

    // Get tickers
    const tickers = await client.getTickers({
      category: 'linear',
      symbol: 'BTCUSDT',
    });
    console.log('Linear tickers:', tickers);

    // Get kline data
    const klines = await client.getKline({
      category: 'spot',
      symbol: 'BTCUSDT',
      interval: '1h',
      limit: 50,
    });
    console.log('Klines:', klines);

    // Private API examples (requires API credentials)
    console.log('\n=== V5 Private API Examples ===');

    // Get wallet balance
    const walletBalance = await client.getWalletBalance({
      accountType: 'UNIFIED',
    });
    console.log('Wallet balance:', walletBalance);

    // Get fee rates
    const feeRates = await client.getFeeRate({
      category: 'spot',
      symbol: 'BTCUSDT',
    });
    console.log('Fee rates:', feeRates);

    // Place a limit order (spot)
    const orderResult = await client.placeOrder({
      category: 'spot',
      symbol: 'BTCUSDT',
      side: 'Buy',
      orderType: 'Limit',
      qty: '0.001',
      price: '30000',
      timeInForce: 'GTC',
      orderLinkId: `test_order_${Date.now()}`,
    });
    console.log('Order placed:', orderResult);

    // Get open orders
    const openOrders = await client.getOrders({
      category: 'spot',
      symbol: 'BTCUSDT',
      openOnly: 1,
    });
    console.log('Open orders:', openOrders);

    // Get position info (for derivatives)
    const positions = await client.getPositionInfo({
      category: 'linear',
      symbol: 'BTCUSDT',
    });
    console.log('Positions:', positions);

    // Set leverage (for derivatives)
    const leverageResult = await client.setLeverage({
      category: 'linear',
      symbol: 'BTCUSDT',
      buyLeverage: '10',
      sellLeverage: '10',
    });
    console.log('Leverage set:', leverageResult);

    // Cancel order example (if you have an order to cancel)
    // const cancelResult = await client.cancelOrder({
    //   category: 'spot',
    //   symbol: 'BTCUSDT',
    //   orderId: 'your_order_id',
    // });
    // console.log('Order cancelled:', cancelResult);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Advanced examples
async function v5AdvancedExamples() {
  const client = new RestClientV5({
    key: 'your_api_key',
    secret: 'your_api_secret',
    testnet: true,
    enable_time_sync: true,
  });

  try {
    console.log('\n=== V5 Advanced Examples ===');

    // Multi-category trading example
    const categories: Array<'spot' | 'linear' | 'inverse'> = ['spot', 'linear'];
    
    for (const category of categories) {
      console.log(`\n--- ${category.toUpperCase()} Trading ---`);
      
      // Get instruments for each category
      const instruments = await client.getInstrumentsInfo({
        category,
        limit: 5,
      });
      console.log(`${category} instruments:`, instruments.result?.list?.slice(0, 3));

      // Get tickers for each category
      const categoryTickers = await client.getTickers({
        category,
      });
      console.log(`${category} tickers count:`, categoryTickers.result?.list?.length);
    }

    // Portfolio management example
    console.log('\n--- Portfolio Management ---');
    
    // Get all coin balances
    const allBalances = await client.getAllCoinBalance({
      accountType: 'UNIFIED',
    });
    console.log('All coin balances:', allBalances);

    // Get order history with pagination
    const orderHistory = await client.getOrderHistory({
      category: 'spot',
      limit: 50,
      // You can add cursor for pagination
    });
    console.log('Order history:', orderHistory);

  } catch (error) {
    console.error('Advanced examples error:', error);
  }
}

// Error handling examples
async function v5ErrorHandlingExamples() {
  const client = new RestClientV5({
    // Intentionally missing credentials for demonstration
    testnet: true,
  });

  try {
    console.log('\n=== V5 Error Handling Examples ===');

    // This should work (public API)
    const serverTime = await client.getServerTime();
    console.log('Server time (public):', serverTime);

    // This should fail (private API without credentials)
    try {
      const walletBalance = await client.getWalletBalance({
        accountType: 'UNIFIED',
      });
      console.log('Wallet balance:', walletBalance);
    } catch (error) {
      console.log('Expected error for missing credentials:', error.message);
    }

    // Example of handling API errors
    try {
      const invalidSymbol = await client.getOrderbook({
        category: 'spot',
        symbol: 'INVALID_SYMBOL',
      });
      console.log('Invalid symbol result:', invalidSymbol);
    } catch (error) {
      console.log('API error for invalid symbol:', error);
    }

  } catch (error) {
    console.error('Error handling examples error:', error);
  }
}

// Run examples
if (require.main === module) {
  v5RestExample()
    .then(() => v5AdvancedExamples())
    .then(() => v5ErrorHandlingExamples())
    .catch(console.error);
}

export { v5RestExample, v5AdvancedExamples, v5ErrorHandlingExamples };
