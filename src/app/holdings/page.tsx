'use client';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { API_BASE_URL } from '../../utils/apiBase';
import Header from '../components/nav';
import { useSearchParams, useRouter } from 'next/navigation';
import { Box, Typography, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, FormControl, Button } from '@mui/material';
import theme from '../theme';
import Loading from '../components/loading';
import Link from 'next/link';


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
    purchase_price: string;
    book_value: string;
    PnL_CAD: string;
    PnL_Pct: string;
}

interface SortConfig {
    key: string | null;
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

// New interfaces for PnL and Purchase Price data
interface PnLData {
    ticker: string;
    name: string;
    type: string;
    geography: string;
    sector: string;
    fund: string;
    currency: string;
    shares_held: number;
    market_value: number;
    total_purchase_cost: number;
    total_shares_purchased: number;
    number_of_purchases: number;
    average_purchase_price: number;
    book_value: number;
    pnl: number;
    pnl_percentage: number;
}

interface PnLApiResponse {
    data: PnLData[];
    success: boolean;
}

interface LatestDateApiResponse {
    trading_date: string;
}

function HoldingsContent() {

    // Getting parameters from url
    const searchParams = useSearchParams();
    const router = useRouter();
    const urlDate = searchParams.get('date');
    const urlPortfolio = searchParams.get('portfolio');

    const [holdingsData, setHoldingsData] = useState<HoldingData[]>([]);
    const [selectedPortfolio, setSelectedPortfolio] = useState(urlPortfolio || 'core');
    const [selectedDate, setSelectedDate] = useState(urlDate || '');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [exchangeRatesData, setExchangeRatesData] = useState<ExchangeRates | null>(null);
    const [pnlData, setPnLData] = useState<PnLData[]>([]);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
    const [authLoading, setAuthLoading] = useState(true); // New loading state for auth check

    // setting default prev to asc 
    const STARTING_VALUE = 101644.99;

    // Authentication check useEffect
    useEffect(() => {
        const token = localStorage.getItem('auth');
        if (!token) {
            router.push('/login?redirect=%2Fholdings'); 
        } else {
            setAuthLoading(false); // Authentication check complete
        }
    }, [router]);

    // Update url when selection changes
    const updateURL = useCallback((date: string, portfolio: string) => {
        const params = new URLSearchParams();
        params.set('date', date);
        params.set('portfolio', portfolio);
        router.push(`/holdings?${params.toString()}`, { scroll: false });
    }, [router]);


    // Updates url when there are missing params
    useEffect(() => {
        if (!authLoading && (!urlDate || !urlPortfolio) && selectedDate) {
            updateURL(selectedDate, selectedPortfolio);
        }
    }, [authLoading, urlDate, urlPortfolio, selectedDate, selectedPortfolio, updateURL]);
    
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

    const fetchPnLData = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/holdings/pnl?portfolio=${selectedPortfolio}&date=${selectedDate}`);
            const data: PnLApiResponse = await response.json();

            if (data.success && data.data) {
                setPnLData(data.data);
            } else {
                setPnLData([]);
            }
        } catch (error) {
            console.error('Error fetching PnL data:', error);
            setPnLData([]);
        }
    }, [selectedDate, selectedPortfolio]);

    // Fetch latest date
    const fetchLatestDate = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/latest-date`);
            const data: LatestDateApiResponse = await response.json();
            
            // Convert the date string to YYYY-MM-DD format
            const date = new Date(data.trading_date);
            date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
            const formattedDate = date.toLocaleDateString('en-CA');
            
            // Only set selectedDate if there's no urlDate
            if (!urlDate) {
                setSelectedDate(formattedDate);
            }
        } catch (error) {
            console.error('Error fetching latest date:', error);
            const yesterday = new Date(Date.now() - 86400000);
            const fallbackDate = yesterday.toLocaleDateString('en-CA');
            if (!urlDate) {
                setSelectedDate(fallbackDate);
            }
        }
    }, [urlDate]);

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

    // First useEffect to fetch latest date when component mounts
    useEffect(() => {
        if (!authLoading) {
            fetchLatestDate();
        }
    }, [authLoading, fetchLatestDate]);

    useEffect(() => {
        if (!authLoading && selectedDate) {
            fetchExchangeRates();
            fetchData();
            fetchPnLData();
        }
    }, [authLoading, urlDate, urlPortfolio, selectedDate,fetchExchangeRates, fetchData, fetchPnLData]);

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

        return [...data].sort((a, b) => {
            let aValue: string | number;
            let bValue: string | number;

            // Handle special cases for calculated values
            if (sortConfig.key === 'purchase_price') {
                const aPnlData = getPnLData(a.ticker);
                const bPnlData = getPnLData(b.ticker);
                aValue = Number(aPnlData?.average_purchase_price ?? 0);
                bValue = Number(bPnlData?.average_purchase_price ?? 0);
            } else if (sortConfig.key === 'book_value') {
                const aPnlData = getPnLData(a.ticker);
                const bPnlData = getPnLData(b.ticker);
                aValue = Number(aPnlData?.book_value ?? 0);
                bValue = Number(bPnlData?.book_value ?? 0);
            } else if (sortConfig.key === 'PnL_CAD') {
                const aPnlData = getPnLData(a.ticker);
                const bPnlData = getPnLData(b.ticker);
                const aMarketValue = parseFloat(a.market_value);
                const bMarketValue = parseFloat(b.market_value);
                const aBookValue = Number(aPnlData?.book_value ?? 0);
                const bBookValue = Number(bPnlData?.book_value ?? 0);
                aValue = aMarketValue - aBookValue;
                bValue = bMarketValue - bBookValue;
            } else if (sortConfig.key === 'PnL_Pct') {
                const aPnlData = getPnLData(a.ticker);
                const bPnlData = getPnLData(b.ticker);
                const aMarketValue = parseFloat(a.market_value);
                const bMarketValue = parseFloat(b.market_value);
                const aBookValue = Number(aPnlData?.book_value ?? 0);
                const bBookValue = Number(bPnlData?.book_value ?? 0);
                aValue = aBookValue === 0 ? 0 : ((aMarketValue - aBookValue) / aBookValue) * 100;
                bValue = bBookValue === 0 ? 0 : ((bMarketValue - bBookValue) / bBookValue) * 100;
            } else {
                // Original logic for other columns
                aValue = a[sortConfig.key as keyof HoldingData];
                bValue = b[sortConfig.key as keyof HoldingData];
                
                // Convert to numbers for numerical columns
                if (sortConfig.key === 'shares_held' || sortConfig.key === 'price' || sortConfig.key === 'market_value') {
                    aValue = parseFloat(aValue as string) || 0;
                    bValue = parseFloat(bValue as string) || 0;
                }
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

    // Helper function to get PnL data for a ticker
    const getPnLData = useCallback((ticker: string) => {
        return pnlData.find(item => item.ticker === ticker);
    }, [pnlData]);

    if (authLoading) {
        return (
            <>
                <Loading /> 
            </>
        );
    }

    return (
        <>
          <Header />
          <Paper
            sx={{
              width: '100vw',
              height: '100vh',
              backgroundColor: 'white',
              boxShadow: 'none',
              padding: 0,
              overflow: 'auto',
              borderRadius: 0,
            }}
          >
      
            {/* Title + date/portfolio picker + metrics button */}
            <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pl: { xs: 2, sm: 10 },
                pr: { xs: 2, sm: 10 },
                pt: 3,
                mb: 4,
            }}
            >
            {/* Left: Page title */}
            <Typography variant="h4" fontWeight={800} sx={{ color: theme.palette.primary.main }}>
                Holdings
            </Typography>

            {/* Right: controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                component="input"
                type="date"
                value={selectedDate}
                onChange={e => onDateChange(e.target.value)}
                sx={{
                    width: 180,
                    height: 40,
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    p: '8px',
                    '&:focus': { borderColor: 'primary.main' },
                }}
                />
                <FormControl size="small" sx={{ minWidth: 180 }}>
                <Select
                    value={selectedPortfolio}
                    onChange={e => onPortfolioChange(e.target.value)}
                    sx={{ height: 40, borderRadius: '8px' }}
                >
                    <MenuItem value="core">Core Portfolio</MenuItem>
                    <MenuItem value="benchmark">Benchmark Portfolio</MenuItem>
                </Select>
                </FormControl>
                <Link href={`/holdings/metrics?date=${selectedDate}&portfolio=${selectedPortfolio}`} passHref>
                <Button
                    variant="contained"
                    sx={{
                    backgroundColor: '#800000',
                    '&:hover': { backgroundColor: '#660000' },
                    color: 'white',
                    }}
                >
                    Metrics
                </Button>
                </Link>
            </Box>
            </Box>
      
            {/* Summary cards */}
            <Box
              sx={{
                pl: { xs: 2, sm: 10 },
                pr: { xs: 2, sm: 10 },
                pb: 5,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
              }}
            >
              <Paper sx={{ p: 2, flex: 1 }}>
                <Typography>
                  <strong>USD to CAD:</strong>{' '}
                  {exchangeRatesData?.USD
                    ? `$${parseFloat(exchangeRatesData.USD).toFixed(6)}`
                    : '—'}
                </Typography>
              </Paper>
              <Paper sx={{ p: 2, flex: 1 }}>
                <Typography>
                  <strong>Total Portfolio Value:</strong>{' '}
                  ${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  (Excluding dividends)
                </Typography>
                <Typography sx={{ mt: 1 }}>
                  <strong>Inception Return:</strong> {inceptionReturn.toFixed(2)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  (Since 2022-05-05)
                </Typography>
              </Paper>
            </Box>
      
            {/* Table */}
            {Object.keys(groupedByFund).map((fund) => (
              <Box key={fund} sx={{ mb: 4, pl: { xs: 2, sm: 10 }, pr: { xs: 2, sm: 10 } }}>
                <Typography
                  variant="h6"
                  onClick={() => router.push(`/holdings/${encodeURIComponent(fund)}`)}
                  sx={{
                    fontWeight: 'bold',
                    mb: 2,
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: '#800000',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: .5,
                    '&:hover': {
                      backgroundColor: '#f2f2f2',
                      color: '#000000',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                      '& svg': { color: '#000000' },
                    },
                  }}
                >
                  <QueryStatsIcon sx={{ color: '#ffffff', mr: 1 }} />
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
                          { label: 'Purchase Price (CAD)', key: 'purchase_price' },
                          { label: 'Book Value (CAD)', key: 'book_value' },
                          { label: 'Market Value (CAD)', key: 'market_value' },
                          { label: 'PnL (CAD)', key: 'PnL_CAD' },
                          { label: 'PnL %', key: 'PnL_Pct' }
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
                              {sortConfig.key === key && <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>}
                            </Box>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow><TableCell colSpan={9} align="center"><CircularProgress color="primary" /></TableCell></TableRow>
                      ) : error ? (
                        <TableRow><TableCell colSpan={9} align="center"><Typography color="error">{error}</Typography></TableCell></TableRow>
                      ) : groupedByFund[fund].length > 0 ? (
                        sortData(groupedByFund[fund]).map((row, index) => {
                          const marketValue = parseFloat(row.market_value);
                          const price = parseFloat(row.price);
                          let convertedMarketValue = marketValue;
                          let convertedPrice = price;
                          const p = getPnLData(row.ticker);
                          const purchasePrice = Number(p?.average_purchase_price ?? 0);
                          const bookValue = Number(p?.book_value ?? 0);
                          const pnlValue = marketValue - bookValue;
                          const pnlPct = bookValue ? (pnlValue / bookValue) * 100 : 0;
                          let cPurchase = purchasePrice;
                          let cBook = bookValue;
                          let cPnl = pnlValue;
                          if (exchangeRatesData) {
                            if (row.security_currency === 'USD') {
                              convertedMarketValue = marketValue / parseFloat(exchangeRatesData.USD);
                              convertedPrice = price / parseFloat(exchangeRatesData.USD);
                              cPurchase = purchasePrice / parseFloat(exchangeRatesData.USD);
                              cBook = bookValue / parseFloat(exchangeRatesData.USD);
                              cPnl = pnlValue / parseFloat(exchangeRatesData.USD);
                            } else if (row.security_currency === 'EUR') {
                              convertedMarketValue = marketValue / parseFloat(exchangeRatesData.EUR);
                              convertedPrice = price / parseFloat(exchangeRatesData.EUR);
                              cPurchase = purchasePrice / parseFloat(exchangeRatesData.EUR);
                              cBook = bookValue / parseFloat(exchangeRatesData.EUR);
                              cPnl = pnlValue / parseFloat(exchangeRatesData.EUR);
                            }
                          }
                          return (
                            <TableRow key={row.ticker} sx={{ backgroundColor: index % 2 === 0 ? theme.palette.action.hover : 'inherit' }}>
                              <TableCell align="center">{row.name}</TableCell>
                              <TableCell align="center">{row.ticker}</TableCell>
                              <TableCell align="center">{row.shares_held}</TableCell>
                              <TableCell align="center">${convertedPrice.toFixed(2)}</TableCell>
                              <TableCell align="center">${cPurchase.toFixed(2)}</TableCell>
                              <TableCell align="center">${cBook.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                              <TableCell align="center">${convertedMarketValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                              <TableCell align="center" sx={{ color: cPnl >= 0 ? 'success.main' : 'error.main' }}>${cPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                              <TableCell align="center" sx={{ color: pnlPct >= 0 ? 'success.main' : 'error.main' }}>{pnlPct.toFixed(2)}%</TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow><TableCell colSpan={9} align="center"><Typography>No data available</Typography></TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))}
      
          </Paper>
        </>
    );
}

export default function HoldingsPage() {
    return (
        <Suspense fallback={<Loading />}>
            <HoldingsContent />
        </Suspense>
    );
}