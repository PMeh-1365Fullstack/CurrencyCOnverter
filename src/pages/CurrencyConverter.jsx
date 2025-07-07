import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, TrendingUp, Clock, Star, Loader2, RefreshCw } from 'lucide-react';
import { useCurrencies, useCurrencyConverter } from '../hooks/useCurrency';

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [result, setResult] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  const { currencies, loading: currenciesLoading } = useCurrencies();
  const { convert, loading: convertLoading, error: convertError } = useCurrencyConverter();

  const handleConvert = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    const conversionResult = await convert(parseFloat(amount), fromCurrency, toCurrency);
    if (conversionResult) {
      const convertedAmount = conversionResult.rates[toCurrency];
      setResult(convertedAmount.toFixed(4));
      setLastUpdated(new Date().toLocaleTimeString());
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult('');
  };

  // Auto-convert when currencies or amount change
  useEffect(() => {
    if (amount && fromCurrency && toCurrency && fromCurrency !== toCurrency) {
      const timeoutId = setTimeout(() => {
        handleConvert();
      }, 500); // Debounce API calls

      return () => clearTimeout(timeoutId);
    }
  }, [amount, fromCurrency, toCurrency]);

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

  const popularConversions = [
    { from: 'USD', to: 'EUR' },
    { from: 'USD', to: 'GBP' },
    { from: 'EUR', to: 'GBP' },
    { from: 'USD', to: 'JPY' },
    { from: 'USD', to: 'INR' },
    { from: 'EUR', to: 'USD' },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-blue-100">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Currency Converter</h2>
            <p className="text-gray-600">Convert between different currencies with real-time rates</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* From Currency */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">From</label>
              <div className="relative">
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  disabled={currenciesLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
                  {currenciesLoading ? (
                    <option>Loading currencies...</option>
                  ) : (
                    currencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {getCurrencyFlag(currency.code)} {currency.code} - {currency.name}
                      </option>
                    ))
                  )}
                </select>
                {currenciesLoading && (
                  <Loader2 className="absolute right-3 top-3.5 h-5 w-5 animate-spin text-gray-400" />
                )}
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* To Currency */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">To</label>
              <div className="relative">
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  disabled={currenciesLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
                  {currenciesLoading ? (
                    <option>Loading currencies...</option>
                  ) : (
                    currencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {getCurrencyFlag(currency.code)} {currency.code} - {currency.name}
                      </option>
                    ))
                  )}
                </select>
                {currenciesLoading && (
                  <Loader2 className="absolute right-3 top-3.5 h-5 w-5 animate-spin text-gray-400" />
                )}
              </div>
              <div className="relative w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-lg font-semibold text-gray-900 min-h-[52px] flex items-center">
                {convertLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Converting...
                  </div>
                ) : result ? (
                  result
                ) : (
                  <span className="text-gray-500">Result will appear here</span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={handleConvert}
              disabled={convertLoading || !amount || parseFloat(amount) <= 0}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {convertLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <TrendingUp className="w-5 h-5 mr-2" />
              )}
              Convert
            </button>
            <button
              onClick={swapCurrencies}
              disabled={convertLoading}
              className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeftRight className="w-5 h-5 mr-2" />
              Swap
            </button>
          </div>

          {/* Error Message */}
          {convertError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{convertError}</p>
            </div>
          )}

          {/* Conversion Result */}
          {result && (
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 text-center mb-8">
              <p className="text-lg text-gray-700 mb-2">
                {amount} {fromCurrency} equals
              </p>
              <p className="text-3xl font-bold text-blue-600 mb-2">
                {result} {toCurrency}
              </p>
              {lastUpdated && (
                <p className="text-sm text-gray-600 flex items-center justify-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Last updated: {lastUpdated}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Quick Access */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-500" />
            Popular Conversions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularConversions.map((conversion, index) => (
              <button
                key={index}
                onClick={() => {
                  setFromCurrency(conversion.from);
                  setToCurrency(conversion.to);
                  setAmount('1');
                }}
                className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {getCurrencyFlag(conversion.from)} {conversion.from}
                  </p>
                  <ArrowLeftRight className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                  <p className="text-sm font-medium text-gray-600">
                    {getCurrencyFlag(conversion.to)} {conversion.to}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}