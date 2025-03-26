'use client';
import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../../utils/apiBase';
import { useSearchParams, useRouter } from 'next/navigation';
import { Box, Typography, Select, MenuItem, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, FormControl, InputLabel } from '@mui/material';
import theme from '../theme.js';

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

export default function HoldingsContent() {
    // Getting parameters from url
    const searchParams = useSearchParams();
    const router = useRouter();
    const urlDate = searchParams.get('date');
    const urlPortfolio = searchParams.get('portfolio');

    const baseDate = new Date(Date.now() - 86400000).toLocaleDateString('en-CA');
    const [holdingsData, setHoldingsData] = useState<HoldingData[]>([]);
    const [selectedPortfolio, setSelectedPortfolio] = useState(urlPortfolio || 'core');
    const [selectedDate, setSelectedDate] = useState(urlDate || baseDate);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [exchangeRatesData, setExchangeRatesData] = useState<ExchangeRates | null>(null);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'fund', direction: 'desc' });

    const STARTING_VALUE = 101644.99;

    // Update url when selection changes
    const updateURL = useCallback((date: string, portfolio: string) => {
        const params = new URLSearchParams();
        params.set('date', date);
        params.set('portfolio', portfolio);
        router.push(`/holdings?${params.toString()}`, { scroll: false });
    }, [router]);

    // Updates url when there are missing params
    useEffect(() => {
        if (!urlDate || !urlPortfolio) {
          updateURL(selectedDate, selectedPortfolio);
        }
    }, [urlDate, urlPortfolio, selectedDate, selectedPortfolio, updateURL]);

    // Update on change to portfolio
    const onPortfolioChange = (newPortfolio: string) => {
        setSelectedPortfolio(newPortfolio);
        updateURL(selectedDate, newPortfolio);
    };

    // Update on change to date
    const onDateChange = (newDate: string) => {
        setSelectedDate(newDate);
        updateURL(newDate, selectedPortfolio);
    };

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
    }, [urlDate, urlPortfolio, fetchExchangeRates, fetchData]);

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

        <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default, p: 4 }}>
        <Paper sx={{ maxWidth: 'xl', mx: 'auto', p: 3, borderRadius: 2, boxShadow: theme.shadows[3] }}>
        
        {/* Holdings Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" fontWeight={800} sx={{ color: theme.palette.primary.main }}>
                Holdings
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl size="small">
                    <InputLabel>Portfolio</InputLabel>
                    <Select
                        value={selectedPortfolio}
                        onChange={(e) => onPortfolioChange(e.target.value)}
                        sx={{ minWidth: 180 }}
                    >
                        <MenuItem value="core">Core Portfolio</MenuItem>
                        <MenuItem value="benchmark">Benchmark Portfolio</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    type="date"
                    value={selectedDate}
                    onChange={(e) => onDateChange(e.target.value)}
                    size="small"
                    sx={{ width: 180 }}
                    InputLabelProps={{ shrink: true }}
                />
            </Box>
        </Box>

        {/* Table */}
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: theme.shadows[2], overflow: 'hidden', border: '2px solid black', mb: 4 }}>
            <Table stickyHeader>
                <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.grey[200], borderBottom: `2px solid ${theme.palette.primary.main}` }}>
                        {[
                            { label: 'Name', key: 'name' },
                            { label: 'Ticker', key: 'ticker' },
                            { label: 'Shares', key: 'shares_held' },
                            { label: 'Price (CAD)', key: 'price' },
                            { label: 'Market Value (CAD)', key: 'market_value' },
                            { label: 'Fund', key: 'fund' }
                        ].map(({ label, key }) => (
                            <TableCell 
                                key={key} 
                                onClick={() => handleSort(key)} 
                                align="center"
                                sx={{ 
                                    fontWeight: 'bold', 
                                    color: theme.palette.primary.main, 
                                    borderBottom: `2px solid ${theme.palette.primary.main}`,
                                    cursor: 'pointer'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {label}
                                    {sortConfig.key === key && (
                                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </Box>
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow><TableCell colSpan={6} align="center"><CircularProgress color="primary" /></TableCell></TableRow>
                    ) : error ? (
                        <TableRow><TableCell colSpan={6} align="center"><Typography color="error">{error}</Typography></TableCell></TableRow>
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
                                <TableRow key={row.ticker} sx={{ backgroundColor: index % 2 === 0 ? theme.palette.action.hover : 'inherit' }}>
                                    <TableCell align="center">{row.name}</TableCell>
                                    <TableCell align="center">{row.ticker}</TableCell>
                                    <TableCell align="center">{row.shares_held}</TableCell>
                                    <TableCell align="center">{convertedPrice.toFixed(2)}</TableCell>
                                    <TableCell align="center">{convertedMarketValue.toFixed(2)}</TableCell>
                                    <TableCell align="center">{row.fund}</TableCell>
                                </TableRow>
                            );
                        })
                    ) : (
                        <TableRow><TableCell colSpan={6} align="center"><Typography>No data available</Typography></TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>

                    <Box sx={{
                width: '100%', 
                maxWidth: 'xl',
                padding: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2, // Gap between the boxes
            }}>
                <Box sx={{
                    padding: 2,
                    borderRadius: 2,
                    backgroundColor: theme.palette.background.paper,
                    border: '1px solid black', // Basic black border
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start', // Left align content
                }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        <strong>USD to CAD:</strong> ${exchangeRatesData?.USD ? parseFloat(exchangeRatesData.USD).toFixed(6) : '0.000000'}
                    </Typography>
                </Box>

                <Box sx={{
                    padding: 2,
                    borderRadius: 2,
                    backgroundColor: theme.palette.background.paper,
                    border: '1px solid black', // Basic black border
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start', // Left align content
                }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        <strong>Total Portfolio Value:</strong> ${totalPortfolioValue.toFixed(2)}
                    </Typography>

                    <Typography variant="body2" sx={{ 
                        mb: 2,
                        fontSize: '0.9em',
                        color: '#666666'
                    }}>
                        (Excluding dividends)
                    </Typography>

                    <Typography variant="body1" sx={{ mb: 2 }}>
                        <strong>Inception Return:</strong> {inceptionReturn.toFixed(2)}%
                    </Typography>

                    <Typography variant="body2" sx={{ 
                        fontSize: '0.9em',
                        color: '#666666'
                    }}>
                        (Since 2022-05-05)
                    </Typography>
                </Box>
            </Box>

        </Paper>
    </Box>

    );
}
