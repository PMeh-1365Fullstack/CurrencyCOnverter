import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Euro, 
  PoundSterling,
  Banknote,
  Activity,
  Globe,
  Loader2,
  ChevronDown,
  ArrowRightLeft
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { usePopularPairs, useExchangeRates, useCurrencies } from '../hooks/useCurrency';

// Mock volume data
const volumeData = [
  { name: 'Mon', volume: 2400 },
  { name: 'Tue', volume: 1398 },
  { name: 'Wed', volume: 9800 },
  { name: 'Thu', volume: 3908 },
  { name: 'Fri', volume: 4800 },
  { name: 'Sat', volume: 3800 },
  { name: 'Sun', volume: 4300 },
];

// Currency pair selector component
function CurrencyPairSelector({ currencies, baseCurrency, targetCurrency, onBaseCurrencyChange, onTargetCurrencyChange, loading }) {
  const [isBaseOpen, setIsBaseOpen] = useState(false);
  const [isTargetOpen, setIsTargetOpen] = useState(false);

  const getCurrencyFlag = (currencyCode) => {
    const flags = {
      USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵',
      CAD: '🇨🇦', AUD: '🇦🇺', CHF: '🇨🇭', CNY: '🇨🇳',
      INR: '🇮🇳', KRW: '🇰🇷', SGD: '🇸🇬', HKD: '🇭🇰',
      NOK: '🇳🇴', SEK: '🇸🇪', DKK: '🇩🇰', PLN: '🇵🇱',
      CZK: '🇨🇿', HUF: '🇭🇺', RUB: '🇷🇺', BRL: '🇧🇷',
      MXN: '🇲🇽', ZAR: '🇿🇦', TRY: '🇹🇷', NZD: '🇳🇿',
    };
    return flags[currencyCode] || '🌍';
  };

  const swapCurrencies = () => {
    const temp = baseCurrency;
    onBaseCurrencyChange(targetCurrency);
    onTargetCurrencyChange(temp);
  };

  const CurrencyDropdown = ({ 
    isOpen, 
    setIsOpen, 
    selectedCurrency, 
    onCurrencySelect, 
    label,
    excludeCurrency 
  }) => (
    <div className="relative flex-1">
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getCurrencyFlag(selectedCurrency)}</span>
          <span className="text-sm font-medium text-gray-900">{selectedCurrency}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          <div className="p-2">
            {currencies
              .filter(currency => currency.code !== excludeCurrency)
              .map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => {
                    onCurrencySelect(currency.code);
                    setIsOpen(false);
                  }}
                  className={`flex items-center space-x-2 w-full p-2 rounded-md text-left transition-colors ${
                    currency.code === selectedCurrency
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="text-lg">{getCurrencyFlag(currency.code)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{currency.code}</p>
                    <p className="text-xs text-gray-500 truncate">{currency.name}</p>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex items-end space-x-2">
      <CurrencyDropdown
        isOpen={isBaseOpen}
        setIsOpen={setIsBaseOpen}
        selectedCurrency={baseCurrency}
        onCurrencySelect={onBaseCurrencyChange}
        label="Base Currency"
        excludeCurrency={targetCurrency}
      />
      
      <button
        onClick={swapCurrencies}
        disabled={loading}
        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-0.5"
        title="Swap currencies"
      >
        <ArrowRightLeft className="w-4 h-4 text-gray-600" />
      </button>
      
      <CurrencyDropdown
        isOpen={isTargetOpen}
        setIsOpen={setIsTargetOpen}
        selectedCurrency={targetCurrency}
        onCurrencySelect={onTargetCurrencyChange}
        label="Target Currency"
        excludeCurrency={baseCurrency}
      />
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [targetCurrency, setTargetCurrency] = useState('EUR');
  const { currencies, loading: currenciesLoading } = useCurrencies();
  const { pairs, loading: pairsLoading } = usePopularPairs();
  const { rates, loading: ratesLoading } = useExchangeRates('USD');

  // Historical data state
  const [historicalData, setHistoricalData] = useState([]);
  const [historicalLoading, setHistoricalLoading] = useState(true);
  const [currentRate, setCurrentRate] = useState(null);

  useEffect(() => {
    const loadHistoricalData = async () => {
      if (!baseCurrency || !targetCurrency || baseCurrency === targetCurrency) return;
      
      setHistoricalLoading(true);
      try {
        const { getHistoricalRates, convertCurrency } = await import('../services/currencyApi');
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString().split('T')[0];

        // Get historical data
        const data = await getHistoricalRates(startDate, endDate, baseCurrency, [targetCurrency]);
        
        // Get current rate
        const currentConversion = await convertCurrency(1, baseCurrency, targetCurrency);
        setCurrentRate(currentConversion.rates[targetCurrency]);
        
        // Transform data for charts
        const chartData = Object.entries(data.rates).map(([date, rates]) => ({
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          rate: rates[targetCurrency] || 0,
        }));

        setHistoricalData(chartData);
      } catch (error) {
        console.error('Error loading historical data:', error);
        // Fallback data
        setHistoricalData([]);
        setCurrentRate(null);
      } finally {
        setHistoricalLoading(false);
      }
    };

    loadHistoricalData();
  }, [baseCurrency, targetCurrency]);

  // Calculate rate change
  const rateChange = historicalData.length > 1 
    ? ((historicalData[historicalData.length - 1]?.rate - historicalData[0]?.rate) / historicalData[0]?.rate * 100)
    : 0;

  const getCurrencyFlag = (currencyCode) => {
    const flags = {
      USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵',
      CAD: '🇨🇦', AUD: '🇦🇺', CHF: '🇨🇭', CNY: '🇨🇳',
      INR: '🇮🇳', KRW: '🇰🇷', SGD: '🇸🇬', HKD: '🇭🇰',
      NOK: '🇳🇴', SEK: '🇸🇪', DKK: '🇩🇰', PLN: '🇵🇱',
      CZK: '🇨🇿', HUF: '🇭🇺', RUB: '🇷🇺', BRL: '🇧🇷',
      MXN: '🇲🇽', ZAR: '🇿🇦', TRY: '🇹🇷', NZD: '🇳🇿',
    };
    return flags[currencyCode] || '🌍';
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 bg-blue-100 rounded-lg py-5">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's your currency market overview for today
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">USD Rate</p>
              <p className="text-2xl font-semibold text-gray-900">1.00</p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Euro className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">EUR Rate</p>
              {ratesLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              ) : (
                <p className="text-2xl font-semibold text-gray-900">
                  {rates?.rates?.EUR ? rates.rates.EUR.toFixed(4) : '0.89'}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <PoundSterling className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">GBP Rate</p>
              {ratesLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              ) : (
                <p className="text-2xl font-semibold text-gray-900">
                  {rates?.rates?.GBP ? rates.rates.GBP.toFixed(4) : '0.77'}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Daily Volume</p>
              <p className="text-2xl font-semibold text-gray-900">8.2M</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Exchange Rate Chart with Currency Pair Selector */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-semibold text-gray-900">Exchange Rate Trends</h2>
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">Last 30 days</span>
                </div>
              </div>
            </div>
            
            {/* Currency Pair Selector */}
            <CurrencyPairSelector
              currencies={currencies}
              baseCurrency={baseCurrency}
              targetCurrency={targetCurrency}
              onBaseCurrencyChange={setBaseCurrency}
              onTargetCurrencyChange={setTargetCurrency}
              loading={currenciesLoading}
            />
          </div>

          {/* Current Rate Display */}
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getCurrencyFlag(baseCurrency)}</span>
                  <span className="text-lg font-semibold text-gray-900">{baseCurrency}</span>
                  <ArrowRightLeft className="w-4 h-4 text-gray-500" />
                  <span className="text-2xl">{getCurrencyFlag(targetCurrency)}</span>
                  <span className="text-lg font-semibold text-gray-900">{targetCurrency}</span>
                </div>
              </div>
              <div className="text-right">
                {historicalLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                ) : (
                  <>
                    <p className="text-2xl font-bold text-gray-900">
                      {currentRate ? currentRate.toFixed(4) : '--'}
                    </p>
                    {rateChange !== 0 && (
                      <div className="flex items-center justify-end space-x-1">
                        {rateChange > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${
                          rateChange > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {rateChange > 0 ? '+' : ''}{rateChange.toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="p-6">
            {historicalLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : historicalData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(value) => [
                      `${parseFloat(value).toFixed(4)}`,
                      `${baseCurrency}/${targetCurrency}`
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, stroke: '#3b82f6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <Globe className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No data available for this currency pair</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Volume Chart */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-blue-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Trading Volume</h2>
            <div className="flex items-center space-x-2">
              <Banknote className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">This week</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="#8b5cf6"
                fill="url(#colorVolume)"
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Popular Currency Pairs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-blue-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Popular Currency Pairs</h2>
        {pairsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {pairs.map((pair, index) => (
              <button
                key={index}
                onClick={() => {
                  setBaseCurrency(pair.from);
                  setTargetCurrency(pair.to);
                }}
                className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-lg border border-blue-100 hover:shadow-md transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    {pair.from}/{pair.to}
                  </span>
                  <span className="text-sm text-gray-500">1.2M</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">
                    {pair.rate}
                  </span>
                  <div className="flex items-center">
                    {pair.change > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        pair.change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {pair.change > 0 ? '+' : ''}{pair.change}%
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}