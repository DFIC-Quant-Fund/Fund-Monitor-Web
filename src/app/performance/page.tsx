'use client';
import {useState, useEffect, useCallback, Suspense} from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,Button,CircularProgress, TextField, TablePagination,
} from '@mui/material';
import { Download } from '@mui/icons-material';
import { API_BASE_URL } from '../../utils/apiBase';
import Header from '../components/heading';
import theme from '../theme.js';

interface PerformanceData {
    date: string;
    inception_return: string | null;
    one_day_return: string | null;
    one_month_return: string | null;
    one_week_return: string | null;
    one_year_return: string | null;
    ytd_return: string | null;
}

interface ApiResponse {
    data: PerformanceData[];
    success: boolean;
}

function Performance() {

    const searchParams = useSearchParams();
    const router = useRouter();
    const urlDate = searchParams.get('date')
    const baseDate = new Date().toLocaleDateString('en-CA')

    const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
    const [selectedDate, setSelectedDate] = useState(urlDate || baseDate);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Update url when selection changes
    const updateURL = useCallback((date: string) => {
        const params = new URLSearchParams();
        params.set('date', date);
        router.push(`/performance?${params.toString()}`, { scroll: false });
    }, [router]);

    // Updates url when no params are present
    useEffect(() => {
        if (!urlDate) {
          updateURL(selectedDate);
        }
    }, [urlDate, selectedDate, updateURL]);

    // Update on change to date
    const onDateChange = (newDate: string) => {
        setSelectedDate(newDate);
        updateURL(newDate);
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const url = `${API_BASE_URL}/api/performance?date=${selectedDate}`;
            const response = await fetch(url);
            const data: ApiResponse = await response.json();

            if (data.success) {
                setPerformanceData(data.data);
            } else {
                setPerformanceData([]);
                setError('No data available for the selected date.');
            }
        } catch (error) {
            console.error('Error fetching performance data:', error);
            setError('Failed to fetch data. Please try again.');
        }
        setLoading(false);
    }, [selectedDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatReturn = (value: string | null) => {
        if (value === null) return <Typography variant="body2" sx={{ fontSize: '1rem' }}>–</Typography>;
        
        const numberValue = parseFloat(value);
        const color = numberValue > 0 ? theme.palette.success.main : 
                     numberValue < 0 ? theme.palette.error.main : 
                     theme.palette.text.secondary;
        
        return (
          <Typography variant="body2" sx={{ fontSize: '1.1rem' }} color={color}>
            {numberValue.toFixed(4)}%
          </Typography>
        );
      };

    const downloadCSV = () => {
        if (performanceData.length === 0) return;

        const headers = Object.keys(performanceData[0]);
        const csvContent = [
            headers.join(','),
            ...performanceData.map(row =>
                headers.map(header => row[header as keyof PerformanceData] ?? '-').join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance_data_${selectedDate || 'all'}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const [page, setPage] = useState(0);
    const rowsPerPage = 50; // Number of rows per page

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    return (
        <>
        <Header />
            <Paper sx={{ maxWidth: 'xl', mx: 'auto', p: 3, borderRadius: 2, boxShadow: theme.shadows[3] }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h3" fontWeight={800} sx={{ color: theme.palette.primary.main }}>
                        Performance
                    </Typography>
                <Box>
                <TextField
                    type="date"
                    value={selectedDate}
                    onChange={(e) => onDateChange(e.target.value)}
                    size="small"
                    sx={{
                        width: 180,
                        height: 40,
                        '& .MuiInputBase-root': { height: '100%' }, // Ensures input field fills height
                    }}
                    InputLabelProps={{ shrink: true }}
                />                    
                    <Button variant="contained" color="primary" startIcon={<Download />} onClick={downloadCSV} sx={{ backgroundColor: theme.palette.primary.main, marginLeft: 2,  width: 180, height: 38 }}>
                        Export
                    </Button>
                </Box>
                </Box>
                <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: theme.shadows[2], overflow: 'hidden' }}>
                    <Table stickyHeader sx={{ tableLayout: 'fixed', width: '100%' }}>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: theme.palette.grey[200], borderBottom: `2px solid ${theme.palette.primary.main}` }}>
                                {['Date', 'Inception Return', '1 Day Return', '1 Week Return', '1 Month Return', '1 Year Return', 'YTD Return'].map(header => (
                                    <TableCell key={header} align="center" sx={{ fontWeight: 'bold', color: theme.palette.primary.main, borderBottom: `2px solid ${theme.palette.primary.main}`, fontSize: '1.1rem' }}>
                                        {header}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={7} align="center"><CircularProgress color="primary" /></TableCell></TableRow>
                            ) : error ? (
                                <TableRow><TableCell colSpan={7} align="center"><Typography color="error">{error}</Typography></TableCell></TableRow>
                            ) : performanceData.length > 0 ? (
                                performanceData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                    <TableRow key={row.date} sx={{ backgroundColor: index % 2 === 0 ? theme.palette.action.hover : 'inherit' }}>
                                        <TableCell align="center" sx={{ fontSize: '1.1rem' }}>{row.date}</TableCell>
                                        {[row.inception_return, row.one_day_return, row.one_week_return, row.one_month_return, row.one_year_return, row.ytd_return].map((val, idx) => (
                                            <TableCell key={idx} align="center" sx={{ fontSize: '1.1rem' }}>{formatReturn(val)}</TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={7} align="center"><Typography>No data available</Typography></TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                    <TablePagination
                    rowsPerPageOptions={[50]} 
                    component="div"
                    count={performanceData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    />
                </TableContainer>
            </Paper>
    </>
    );
}

export default function PerformancePage(){
    return(
        <Suspense fallback={<div>Loading...</div>}>
            <Performance />
        </Suspense>
    )
}