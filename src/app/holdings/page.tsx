'use client';
import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../../utils/apiBase';

// Interface for Holdings Data
interface HoldingData {
    fund: string;
    geography: string;
    market_value: string;
    name: string;
    price: string;
    sector: string;
    security_currency: string;
    shares_held: string;
    ticker: string;
    trading_date: string;
    type: string;
}

interface SortConfig {
    key: string;
    direction: 'asc' | 'desc';
}

// Interface for Currency Exchange Data
interface ExchangeRates {
    CAD: string;
    EUR: string;
    USD: string;
    date: string;
}

interface ExchangeRatesApiResponse {
    data: ExchangeRates;
    success: boolean;
}

interface HoldingsApiResponse {
    data: HoldingData[];
    success: boolean;
}

export default function Holdings() {
    const [holdingsData, setHoldingsData] = useState<HoldingData[]>([]);
    const [selectedPortfolio, setSelectedPortfolio] = useState('core');
    const [selectedDate, setSelectedDate] = useState(new Date(Date.now() - 86400000).toLocaleDateString('en-CA'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [exchangeRatesData, setExchangeRatesData] = useState<ExchangeRates | null>(null);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'fund', direction: 'desc' });

    const STARTING_VALUE = 101644.99;

    // Fetch exchange rates
    const fetchExchangeRates = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/exchange-rates?date=${selectedDate}`);
            const data: ExchangeRatesApiResponse = await response.json();

            if (data.success && data.data) {
                setExchangeRatesData(data.data);
            } else {
                setExchangeRatesData(null);
                if (data.success === false) {
                    console.error("Exchange rates API returned unsuccessful response");
                }
            }
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            setExchangeRatesData(null);
        }
    }, [selectedDate]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/holdings?portfolio=${selectedPortfolio}&date=${selectedDate}`);
            const data: HoldingsApiResponse = await response.json();

            if (data.success) {
                setHoldingsData(data.data);
            } else {
                setHoldingsData([]);
                setError('No data available for the selected date.');
            }
        } catch (error) {
            console.error('Error fetching holdings data:', error);
            setError('Failed to fetch data. Please try again.');
        }
        setLoading(false);
    }, [selectedDate, selectedPortfolio]);

    useEffect(() => {
        fetchExchangeRates();
        fetchData();
    }, [fetchExchangeRates, fetchData]);

    // Convert holdings market values and price to CAD
    const totalPortfolioValue = holdingsData.reduce((acc, row) => {
        const marketValue = parseFloat(row.market_value);
        if (exchangeRatesData) {
            if (row.security_currency === "USD") {
                return acc + (marketValue / parseFloat(exchangeRatesData.USD));
            } else if (row.security_currency === "EUR") {
                return acc + (marketValue / parseFloat(exchangeRatesData.EUR));
            }
        }
        return acc + marketValue; // CAD remains unchanged
    }, 0);

    const sortData = (data: HoldingData[]) => {
        if (!sortConfig.key) return data;

        return [...data].sort((a, b) => {
            let aValue: string | number = a[sortConfig.key as keyof HoldingData];
            let bValue: string | number = b[sortConfig.key as keyof HoldingData];

            // Convert to numbers for numerical columns
            if (sortConfig.key === 'shares_held' || sortConfig.key === 'price' || sortConfig.key === 'market_value') {
                aValue = parseFloat(aValue as string) || 0;
                bValue = parseFloat(bValue as string) || 0;
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const handleSort = (key: string) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Calculate Inception Return
    const inceptionReturn = ((totalPortfolioValue - STARTING_VALUE) / STARTING_VALUE) * 100;

    return (
        <div className="min-h-screen bg-white p-8 flex flex-col">
            <div className="max-w-7xl mx-auto w-full flex flex-col flex-grow">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                    <h1 className="text-[#800000] text-4xl font-bold">Holdings</h1>
                    <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0">
                        <select
                            value={selectedPortfolio}
                            onChange={(e) => setSelectedPortfolio(e.target.value)}
                            className="border px-3 py-2 rounded shadow text-black"
                        >
                            <option value="core">Core Portfolio</option>
                            <option value="benchmark">Benchmark Portfolio</option>
                        </select>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            min="1900-01-01"
                            max="2100-12-31"
                            className="border px-3 py-2 rounded shadow text-black"
                        />
                    </div>
                </div>

                <div className="w-full border rounded-lg overflow-x-auto mb-6">
                    <table className="w-full border-collapse ">
                        <thead className="sticky top-0 bg-white shadow-md z-10">
                            <tr>
                                {[
                                    { label: 'Name', key: 'name' },
                                    { label: 'Ticker', key: 'ticker' },
                                    { label: 'Shares', key: 'shares_held' },
                                    { label: 'Price (CAD)', key: 'price' },
                                    { label: 'Market Value (CAD)', key: 'market_value' },
                                    { label: 'Fund', key: 'fund' }
                                ].map(({ label, key }) => (
                                    <th
                                        key={key}
                                        onClick={() => handleSort(key)}
                                        className="border-b-2 border-[#800000] p-3 text-left text-[#800000] cursor-pointer hover:bg-gray-50"
                                    >
                                        <div className="flex items-center gap-1">
                                            {label}
                                            {sortConfig.key === key && (
                                                <span className="ml-1">
                                                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="p-3 text-gray-600 text-center">Loading data...</td></tr>
                            ) : error ? (
                                <tr><td colSpan={7} className="p-3 text-red-600 text-center ">{error}</td></tr>
                            ) : holdingsData.length > 0 ? (
                                sortData(holdingsData).map((row, index) => {
                                    const marketValue = parseFloat(row.market_value);
                                    const price = parseFloat(row.price);
                                    let convertedMarketValue = marketValue;
                                    let convertedPrice = price;

                                    if (exchangeRatesData) {
                                        if (row.security_currency === "USD") {
                                            convertedMarketValue = marketValue / parseFloat(exchangeRatesData.USD);
                                            convertedPrice = price / parseFloat(exchangeRatesData.USD);
                                        } else if (row.security_currency === "EUR") {
                                            convertedMarketValue = marketValue / parseFloat(exchangeRatesData.EUR);
                                            convertedPrice = price / parseFloat(exchangeRatesData.EUR);
                                        }
                                    }

                                    return (
                                        <tr key={row.ticker} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                            <td className="border-b border-gray-200 p-3 text-black">{row.name}</td>
                                            <td className="border-b border-gray-200 p-3 text-black">{row.ticker}</td>
                                            <td className="border-b border-gray-200 p-3 text-black">{row.shares_held}</td>
                                            <td className="border-b border-gray-200 p-3 text-black">${convertedPrice.toFixed(2)}</td>
                                            <td className="border-b border-gray-200 p-3 text-black">${convertedMarketValue.toFixed(2)}</td>
                                            <td className="border-b border-gray-200 p-3 text-black">{row.fund}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-3 text-black text-center">No data available.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="border rounded-lg p-6 bg-gray-100 shadow mt-6 mb-6">
                    {exchangeRatesData ? (
                        <div className="flex flex-col space-y-4">
                            <p className="text-black text-lg">
                                <span className="font-semibold">USD to CAD:</span> ${parseFloat(exchangeRatesData.USD).toFixed(6)}
                            </p>
                            {/* <p className="text-black text-lg">
                                <span className="font-semibold">EUR to CAD:</span> ${parseFloat(exchangeRatesData.EUR).toFixed(6)}
                            </p> */}
                        </div>
                    ) : (
                        <p className="text-black text-center">Fetching exchange rates...</p>
                    )}
                </div>

                {/* <div className="w-full bg-white shadow-md p-4 flex flex-col text-black text-lg"> */}
                <div className="border rounded-lg p-6 bg-gray-100 shadow mt-6 mb-6 ">
                    <div className="font-bold text-black">Total Portfolio Value: ${totalPortfolioValue.toFixed(2)}</div>
                    <p className="text-sm text-gray-600">(Excluding dividends)</p>
                    <div className="font-bold mt-2 text-black">Inception Return: {inceptionReturn.toFixed(2)}%</div>
                    <p className="text-sm text-gray-600">(Since 2022-05-05)</p>
                </div>
            </div>
        </div>
    );
}
