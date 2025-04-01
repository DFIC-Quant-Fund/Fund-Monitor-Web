'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Button, CircularProgress,
    TablePagination, Select, MenuItem, FormControl
} from '@mui/material';
import { Download } from '@mui/icons-material';
import { API_BASE_URL } from '../../utils/apiBase';
import Header from '../components/nav';
import Loading from "../components/loading";
import theme from '../theme';

interface TransactionData {
    transaction_id: number;
    name: string;
    date: string;
    ticker: string;
    type: string;
    action: string;
    shares: number;
    price: number;
    currency: string;
    portfolio: string;
    fund: string;
}

interface ApiResponse {
    data: TransactionData[];
    success: boolean;
}

interface SortConfig {
    key: string | null;
    direction: 'asc' | 'desc';
}

function Transactions() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const urlPortfolio = searchParams.get('portfolio') || 'core';

    const [transactionsData, setTransactionsData] = useState<TransactionData[]>([]);
    const [selectedPortfolio, setSelectedPortfolio] = useState(urlPortfolio);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [authLoading, setAuthLoading] = useState(true);
    const [page, setPage] = useState(0);
    const rowsPerPage = 50;
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

    // Authentication check
    useEffect(() => {
        const token = localStorage.getItem('auth');
        if (!token) {
            router.push('/login?redirect=%2Ftransactions');
        } else {
            setAuthLoading(false);
        }
    }, [router]);

    useEffect(() => {
        if (!authLoading && !searchParams.get('portfolio')) {
            router.push('/transactions?portfolio=core', { scroll: false });
        }
    }, [router, searchParams]);

    const updateURL = useCallback((portfolio: string) => {
        const params = new URLSearchParams();
        params.set('portfolio', portfolio);
        router.push(`/transactions?${params.toString()}`, { scroll: false });
    }, [router]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const url = `${API_BASE_URL}/api/transactions?portfolio=${selectedPortfolio}`;
            const response = await fetch(url);
            const data: ApiResponse = await response.json();

            if (data.success) {
                setTransactionsData(data.data);
            } else {
                setTransactionsData([]);
                setError('No transaction data available.');
            }
        } catch (error) {
            console.error('Error fetching transaction data:', error);
            setError('Failed to fetch data. Please try again.');
        }
        setLoading(false);
    }, [selectedPortfolio]);

    // Fetch data when component is loaded and auth check is done
    useEffect(() => {
        if (!authLoading) {
            fetchData();
        }
    }, [authLoading, fetchData]);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const onPortfolioChange = (newPortfolio: string) => {
        setSelectedPortfolio(newPortfolio);
        updateURL(newPortfolio);
    };

    const downloadCSV = () => {
        if (transactionsData.length === 0) return;

        const headers = Object.keys(transactionsData[0]);
        const csvContent = [
            headers.join(','),
            ...transactionsData.map(row =>
                headers.map(header => row[header as keyof TransactionData] ?? '-').join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transaction_data_${selectedPortfolio || 'all'}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    if (authLoading) {
        return (
            <>
                <Loading />
            </>
        );
    }

    const formatDate = (dateStr: string) => {
        const dateObj = new Date(dateStr);
        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const year = dateObj.getFullYear();
        return `${year}-${month}-${day}`;
    };

    const sortData = (data: TransactionData[]) => {
        // If no key, return the data unsorted
        if (!sortConfig || !sortConfig.key) return data;
        if (!sortConfig.key) return data;

        return [...data].sort((a, b) => {
            let aValue: string | number = a[sortConfig.key as keyof TransactionData];
            let bValue: string | number = b[sortConfig.key as keyof TransactionData];

            // Convert to numbers for numerical columns
            if (sortConfig.key === 'shares' || sortConfig.key === 'price') {
                aValue = parseFloat(aValue as string) || 0;
                bValue = parseFloat(bValue as string) || 0;
            }

            if (sortConfig.key === 'date') {
                aValue = new Date(aValue as string).getTime();
                bValue = new Date(bValue as string).getTime();
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

    const sortedData = sortData(transactionsData);

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
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, mb: 4,
                    pl: { xs: 2, sm: 10 },
                    pr: { xs: 2, sm: 10 },
                    pt: 3
                }}>
                    <Typography variant="h4" fontWeight={800} sx={{ color: theme.palette.primary.main, mb: { xs: 2, sm: 0 } }}>
                        Transactions
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, width: { xs: '100%', sm: 'auto' } }}>

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
                        <Button variant="contained" color="primary" startIcon={<Download />} onClick={downloadCSV} sx={{
                            backgroundColor: theme.palette.primary.main, width: { xs: '100%', sm: 180 }, height: 40, borderRadius: "8px",
                            padding: "8px", outline: "none"
                        }}>
                            Export
                        </Button>
                    </Box>
                </Box>

                <Box sx={{ pl: { xs: 2, sm: 10 }, pr: { xs: 2, sm: 10 }, pb: 5 }}>
                    <TableContainer component={Paper} sx={{ overflow: 'auto', maxWidth: '100%' }}>
                        <Table stickyHeader sx={{ tableLayout: 'fixed', width: '100%', minWidth: '800px' }}>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: theme.palette.grey[200], borderBottom: `2px solid ${theme.palette.primary.main}` }}>
                                    {[
                                        { label: 'Date', key: 'date' },
                                        { label: 'Ticker', key: 'ticker' },
                                        { label: 'Security Name', key: 'name' },
                                        { label: 'Type', key: 'type' },
                                        { label: 'Action', key: 'action' },
                                        { label: 'Shares', key: 'shares' },
                                        { label: 'Price', key: 'price' },
                                        { label: 'Currency', key: 'currency' },
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
                                    <TableRow>
                                        <TableCell colSpan={10} align="center">
                                            <CircularProgress color="primary" />
                                        </TableCell>
                                    </TableRow>
                                ) : error ? (
                                    <TableRow>
                                        <TableCell colSpan={10} align="center">
                                            <Typography color="error">{error}</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : sortedData.length > 0 ? (
                                    sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                        <TableRow key={row.transaction_id} sx={{ backgroundColor: index % 2 === 0 ? theme.palette.action.hover : 'inherit' }}>
                                            <TableCell align="center" sx={{ fontSize: '1rem' }}>{formatDate(row.date)}</TableCell>
                                            <TableCell align="center" sx={{ fontSize: '1rem' }}>{row.ticker}</TableCell>
                                            <TableCell align="center" sx={{ fontSize: '1rem' }}>{row.name}</TableCell>
                                            <TableCell align="center" sx={{ fontSize: '1rem' }}>{row.type}</TableCell>
                                            <TableCell align="center" sx={{
                                                fontSize: '1rem',
                                                color: row.action === 'BUY' ? theme.palette.success.main :
                                                    row.action === 'SELL' ? theme.palette.error.main : 'inherit'
                                            }}>{row.action}</TableCell>
                                            <TableCell align="center" sx={{ fontSize: '1rem' }}>{row.shares.toLocaleString()}</TableCell>
                                            <TableCell align="center" sx={{ fontSize: '1rem' }}>{Number(row.price).toFixed(2)}</TableCell>
                                            <TableCell align="center" sx={{ fontSize: '1rem' }}>{row.currency}</TableCell>
                                            <TableCell align="center" sx={{ fontSize: '1rem' }}>{row.fund}</TableCell>
                                        </TableRow>
                                    ))

                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={10} align="center">
                                            <Typography>No transaction data available</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <TablePagination
                            rowsPerPageOptions={[50]}
                            component="div"
                            count={transactionsData.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            sx={{
                                width: { xs: '100%', sm: 'auto' }
                            }}
                        />
                    </TableContainer>
                </Box>
            </Paper>
        </>
    );
}

export default function TransactionsPage() {
    return (
        <Suspense fallback={<Loading />}>
            <Transactions />
        </Suspense>
    );
}