import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext(null);

const detectDefaultCurrency = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz.includes('India') || tz.includes('Calcutta') || tz.includes('Kolkata')) return 'INR';
    if (tz.includes('Europe') && !tz.includes('London')) return 'EUR';
    if (tz.includes('London')) return 'GBP';
    return 'USD';
  } catch(e) {
    return 'USD';
  }
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('app_currency') || detectDefaultCurrency();
  });

  useEffect(() => {
    localStorage.setItem('app_currency', currency);
  }, [currency]);

  const changeCurrency = (code) => {
    setCurrency(code);
  };

  const getSymbol = () => {
    switch (currency) {
      case 'INR': return '₹';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'USD': default: return '$';
    }
  };

  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  const formatAmountNoFractions = (amount) => {
    if (amount === undefined || amount === null) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, getSymbol, formatAmount, formatAmountNoFractions }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
