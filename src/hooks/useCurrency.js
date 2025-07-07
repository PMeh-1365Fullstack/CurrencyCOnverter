import { useState, useEffect } from 'react';
import { 
  fetchCurrencies, 
  convertCurrency, 
  getLatestRates,
  getHistoricalRates,
  getPopularPairs
} from '../services/currencyApi';

// Hook for managing currencies
export const useCurrencies = () => {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        setLoading(true);
        const data = await fetchCurrencies();
        setCurrencies(data);
        setError(null);
      } catch (err) {
        setError('Failed to load currencies');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCurrencies();
  }, []);

  return { currencies, loading, error };
};

// Hook for currency conversion
export const useCurrencyConverter = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const convert = async (amount, from, to) => {
    try {
      setLoading(true);
      setError(null);
      const result = await convertCurrency(amount, from, to);
      return result;
    } catch (err) {
      setError('Failed to convert currency');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { convert, loading, error };
};

// Hook for latest exchange rates
export const useExchangeRates = (baseCurrency = 'USD') => {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRates = async () => {
      try {
        setLoading(true);
        const data = await getLatestRates(baseCurrency);
        setRates(data);
        setError(null);
      } catch (err) {
        setError('Failed to load exchange rates');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadRates();
  }, [baseCurrency]);

  return { rates, loading, error, refetch: () => setRates(null) };
};

// Hook for historical data
export const useHistoricalRates = (days = 30) => {
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadHistoricalData = async () => {
      try {
        setLoading(true);
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
          .toISOString().split('T')[0];

        const data = await getHistoricalRates(startDate, endDate, 'USD', ['EUR', 'GBP', 'JPY']);
        
        // Transform data for charts
        const chartData = Object.entries(data.rates).map(([date, rates]) => ({
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          EUR: rates.EUR,
          GBP: rates.GBP,
          JPY: rates.JPY / 100, // Scale JPY for better visualization
        }));

        setHistoricalData(chartData);
        setError(null);
      } catch (err) {
        setError('Failed to load historical data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadHistoricalData();
  }, [days]);

  return { historicalData, loading, error };
};

// Hook for popular currency pairs
export const usePopularPairs = () => {
  const [pairs, setPairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPairs = async () => {
      try {
        setLoading(true);
        const data = await getPopularPairs();
        setPairs(data);
        setError(null);
      } catch (err) {
        setError('Failed to load popular pairs');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPairs();
  }, []);

  return { pairs, loading, error };
};