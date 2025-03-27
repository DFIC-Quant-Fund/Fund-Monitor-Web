'use client';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { API_BASE_URL } from '../../utils/apiBase';
import Header from '../components/heading';
import { useSearchParams, useRouter } from 'next/navigation';
import { Box, Typography, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, FormControl } from '@mui/material';
import theme from '../theme';



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
    key:  string | null;
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

function HoldingsContent() {

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
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
// setting default prev to asc 
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

    // Group data by fund
    const groupedByFund = holdingsData.reduce((groups, row) => {
        const fund = row.fund;
        if (!groups[fund]) {
            groups[fund] = [];
        }
        groups[fund].push(row);
        return groups;
    }, {} as { [key: string]: HoldingData[] });

    const sortData = (data: HoldingData[]) => {
        // If no key, return the data unsorted
        if (!sortConfig || !sortConfig.key) return data;
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
        <>
            <Header />
            <Paper sx={{
                width: '100vw',
                height: '100vh',
                backgroundColor: 'white',
                boxShadow: 'none', padding: 0, overflow: 'auto', borderRadius: 0
            }}>

                {/* Holdings Section */}
                <Box sx={{ display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between', alignItems: 'center', mb: 4, 
                    pl: { xs: 2, sm: 10 }, 
                    pr: { xs: 2, sm: 10 }, 
                    gap: 2,
                    pt: 3 }}>
                    <Typography variant="h4" fontWeight={800} sx={{ color: theme.palette.primary.main, mb: { xs: 2, sm: 0 } }}>
                        Holdings
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, width: { xs: '100%', sm: 'auto' } }}>
                        <Box
                            component="input"
                            type="date"
                            value={selectedDate || ""}
                            onChange={(e) => onDateChange(e.target.value)}
                            min="1900-01-01"
                            max="2100-12-31"
                            sx={{
                                width: { xs: '100%', sm: 180 },
                                height: 40,
                                border: "1px solid #ccc",
                                borderRadius: "8px",
                                padding: "8px",
                                outline: "none",
                                "&:focus": {
                                    borderColor: "primary.main",
                                },
                            }}
                        />
                        <FormControl size="small" > 
                            <Select
                                value={selectedPortfolio}
                                onChange={(e) => onPortfolioChange(e.target.value)}
                                sx={{
                                    width: { xs: '100%', sm: 180 },
                                    height: 40,
                                    borderRadius: "8px",
                                }}
                            >
                                <MenuItem value="core">Core Portfolio</MenuItem>
                                <MenuItem value="benchmark">Benchmark Portfolio</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Box>

                {/* Table */}
                {Object.keys(groupedByFund).map((fund) => (
                    <Box key={fund} sx={{ mb: 4, pl: { xs: 2, sm: 10 }, pr: { xs: 2, sm: 10 } }}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 'bold',
                                mb: 2,
                                cursor: 'pointer',
                                padding: '4px 8px', // Adds padding for a button-like feel
                                borderRadius: '4px', // Rounded corners
                                backgroundColor: '#800000', // Light background color (button-like)
                                color: '#ffffff', // White text on hover
                                transition: 'all 0.3s ease-in-out',
                                display: 'flex',
                                alignItems: 'center',
                                gap: .1,
                                '&:hover': {
                                    backgroundColor: '#f2f2f2', // Button-like background on hover
                                    color: '#000000', // White text on hover
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)', // Adds shadow for depth
                                    '& svg': {
                                        color: '#000000', // White text on hover
                                    },
                                },
                            }}
                        >
                            <QueryStatsIcon sx={{
                                color: '#ffffff',
                                transition: 'color 0.3s ease-in-out',
                                mr: 1
                            }} />
                            {fund}
                        </Typography>
                        <TableContainer component={Paper} sx={{ overflowX: 'auto', maxWidth: '100%' }}>
                            <Table stickyHeader sx={{ tableLayout: 'fixed', width: '100%', minWidth: '800px' }}>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: theme.palette.grey[200], borderBottom: `2px solid ${theme.palette.primary.main}` }}>
                                        {[
                                            { label: 'Name', key: 'name' },
                                            { label: 'Ticker', key: 'ticker' },
                                            { label: 'Shares', key: 'shares_held' },
                                            { label: 'Price (CAD)', key: 'price' },
                                            { label: 'Market Value (CAD)', key: 'market_value' }
                                        ].map(({ label, key }) => (
                                            <TableCell
                                                key={key}
                                                onClick={() => handleSort(key)}
                                                align="center"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    color: theme.palette.primary.main,
                                                    borderBottom: `2px solid ${theme.palette.primary.main}`,
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
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
                                    ) : groupedByFund[fund].length > 0 ? (
                                        sortData(groupedByFund[fund]).map((row, index) => {
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
                                                    <TableCell align="center" sx={{ fontSize: '1rem' }}>{row.name}</TableCell>
                                                    <TableCell align="center" sx={{ fontSize: '1rem' }}>{row.ticker}</TableCell>
                                                    <TableCell align="center" sx={{ fontSize: '1rem' }}>{row.shares_held}</TableCell>
                                                    <TableCell align="center" sx={{ fontSize: '1rem' }}>$ {convertedPrice.toFixed(2)}</TableCell>
                                                    <TableCell align="center" sx={{ fontSize: '1rem' }}>$ {convertedMarketValue.toFixed(2)}</TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow><TableCell colSpan={6} align="center"><Typography>No data available</Typography></TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                ))}

                <Box sx={{
                    width: '100%',
                    maxWidth: 'xl',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2, // Gap between the boxes
                    pl: { xs: 2, sm: 10 }, pr: { xs: 2, sm: 10 }, pb: 5
                }}>
                    <Box sx={{
                        borderRadius: 2, boxShadow: theme.shadows[2], overflow: 'hidden',
                        padding: 2,
                        backgroundColor: theme.palette.background.paper,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                    }}>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            <strong>USD to CAD:</strong> ${exchangeRatesData?.USD ? parseFloat(exchangeRatesData.USD).toFixed(6) : '0.000000'}
                        </Typography>
                    </Box>

                    <Box sx={{
                        borderRadius: 2, boxShadow: theme.shadows[2], overflow: 'hidden',
                        padding: 2,
                        backgroundColor: theme.palette.background.paper,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
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
        </>
    );
}

export default function HoldingsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HoldingsContent />
        </Suspense>
    );
}