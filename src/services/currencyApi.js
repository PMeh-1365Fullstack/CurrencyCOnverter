// Currency API service using Frankfurter API
const BASE_URL = 'https://api.frankfurter.app';

// Fetch all available currencies
export const fetchCurrencies = async () => {
  try {
    const response = await fetch(`${BASE_URL}/currencies`);
    if (!response.ok) {
      throw new Error('Failed to fetch currencies');
    }
    const data = await response.json();
    
    return Object.entries(data).map(([code, name]) => ({
      code,
      name,
    }));
  } catch (error) {
    console.error('Error fetching currencies:', error);
    // Return fallback currencies if API fails
    return [
      { code: 'USD', name: 'US Dollar' },
      { code: 'EUR', name: 'Euro' },
      { code: 'GBP', name: 'British Pound Sterling' },
      { code: 'JPY', name: 'Japanese Yen' },
      { code: 'CAD', name: 'Canadian Dollar' },
      { code: 'AUD', name: 'Australian Dollar' },
      { code: 'CHF', name: 'Swiss Franc' },
      { code: 'CNY', name: 'Chinese Yuan' },
      { code: 'INR', name: 'Indian Rupee' },
    ];
  }
};

// Convert currency
export const convertCurrency = async (amount, from, to) => {
  try {
    const response = await fetch(
      `${BASE_URL}/latest?amount=${amount}&from=${from}&to=${to}`
    );
    if (!response.ok) {
      throw new Error('Failed to convert currency');
    }
    return await response.json();
  } catch (error) {
    console.error('Error converting currency:', error);
    throw error;
  }
};

// Get latest rates for a base currency
export const getLatestRates = async (base = 'USD') => {
  try {
    const response = await fetch(`${BASE_URL}/latest?from=${base}`);
    if (!response.ok) {
      throw new Error('Failed to fetch latest rates');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching latest rates:', error);
    throw error;
  }
};

// Get historical data for charts
export const getHistoricalRates = async (
  startDate,
  endDate,
  base = 'USD',
  symbols = ['EUR', 'GBP', 'JPY']
) => {
  try {
    const symbolsParam = symbols.join(',');
    const response = await fetch(
      `${BASE_URL}/${startDate}..${endDate}?from=${base}&to=${symbolsParam}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch historical rates');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching historical rates:', error);
    throw error;
  }
};

// Get popular currency pairs with current rates
export const getPopularPairs = async () => {
  try {
    const pairs = [
      { from: 'USD', to: 'EUR' },
      { from: 'USD', to: 'GBP' },
      { from: 'USD', to: 'JPY' },
      { from: 'EUR', to: 'GBP' },
    ];

    const results = await Promise.all(
      pairs.map(async (pair) => {
        const conversion = await convertCurrency(1, pair.from, pair.to);
        const rate = conversion.rates[pair.to];
        
        // Calculate mock change percentage (in real app, you'd compare with previous day)
        const change = (Math.random() - 0.5) * 4; // Random change between -2% and +2%
        
        return {
          from: pair.from,
          to: pair.to,
          rate: parseFloat(rate.toFixed(4)),
          change: parseFloat(change.toFixed(2)),
        };
      })
    );

    return results;
  } catch (error) {
    console.error('Error fetching popular pairs:', error);
    // Return fallback data
    return [
      { from: 'USD', to: 'EUR', rate: 0.89, change: 2.5 },
      { from: 'USD', to: 'GBP', rate: 0.77, change: -1.2 },
      { from: 'USD', to: 'JPY', rate: 118.5, change: 0.8 },
      { from: 'EUR', to: 'GBP', rate: 0.86, change: -0.3 },
    ];
  }
};