'use client';
import { useParams } from 'next/navigation';
import Header from '../../components/nav';
import { Paper, Typography, Box, Grid, CardContent, Card, TableBody, Table, TableCell, TableContainer, TableRow, Button, CircularProgress } from '@mui/material';
import theme from '../../theme';
import { useState, useEffect, useCallback} from 'react';
import { API_BASE_URL } from '@/utils/apiBase';
import { LineChart, CartesianGrid, XAxis, YAxis, Line, Cell, Pie, PieChart, Legend } from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface FundThesis {
    name: string;
    thesis: string;
}

interface PortfolioData {
    market_value: string; 
    trading_date: string;
}

interface HoldingsOverview {
    ticker: string;
    ticker_holdings: string; 
}

interface FundHighlights {
    total_trades: string; 
    assets: string; 
    investments: string; 
    sectors: string; 
}

interface PortfolioApiResponse {
    data: PortfolioData[];
    success: boolean;
}

interface HoldingsOverviewApiResponse {
    data: HoldingsOverview[];
    success: boolean;
}

interface FundHighlightsApiResponse {
    data: FundHighlights; 
    success: boolean;
}

interface FundThesisApiResponse {
    data: FundThesis[];
    success: boolean;
}

// helper 
const calculateDate = (period: 'week' | 'month' | '3months' | 'year') => {
    const today = new Date();
    let calculatedDate;
    
    switch (period) {
        case 'week':
            calculatedDate = new Date(today.setDate(today.getDate() - 7));
            break;
        case 'month':
            calculatedDate = new Date(today.setMonth(today.getMonth() - 1));
            break;
        case '3months':
            calculatedDate = new Date(today.setMonth(today.getMonth() - 3));
            break;
        case 'year':
            calculatedDate = new Date(today.setFullYear(today.getFullYear() - 1));
            break;
        default:
            calculatedDate = new Date();
    }
    
    // Ensure the date is a weekday (Monday-Friday)
    while (calculatedDate.getDay() === 0 || calculatedDate.getDay() === 6) {
        calculatedDate.setDate(calculatedDate.getDate() - 1); // Move back to the previous weekday
    }
    
    return calculatedDate.toLocaleDateString('en-CA');
};

function FundContent() {
    const params = useParams<{ fund: string }>();
    const fundName = params?.fund;

    // const searchParams = useSearchParams();
    // const urlDate = searchParams.get('date');
    const defaultDate = calculateDate('3months');
    const [selectedDate, setSelectedDate] = useState(defaultDate);

    const [fundThesis, setFundThesis] = useState<FundThesis[]>([]);
    const [selectedFund] = useState(fundName);
    const [loading, setLoading] = useState(true);
    const [portfolioData, setPortfolioData] = useState<PortfolioData[]>([]);
    const [holdingsOverview, setHoldingsOverview] = useState<HoldingsOverview[]>([]);
    const [fundHighlights, setFundHighlights] = useState<FundHighlights | null>(null); 

    // const baseDate = new Date(Date.now() - 31536000000).toLocaleDateString('en-CA'); // 31536000000 milliseconds = 1 year


    const fetchFundThesis = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/fund-thesis`);
            const data: FundThesisApiResponse = await response.json();

            if (data.success && data.data) {
                setFundThesis(data.data);
            } else {
                setFundThesis([]);
                if (data.success === false) {
                    console.error('Fund thesis API returned unsuccessful response');
                }
            }
        } catch (error) {
            console.error('Error fetching fund thesis:', error);
            setFundThesis([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchFundPortfolio = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/fund-market?fund=${selectedFund}&date=${selectedDate}`);
            const data: PortfolioApiResponse = await response.json();

            if (data.success && data.data) {
                setPortfolioData(data.data);
            } else {
                setPortfolioData([]);
                if (data.success === false) {
                    console.error('Fund market API returned unsuccessful response');
                }
            }
        } catch (error) {
            console.error('Error fetching fund portfolio:', error);
            setPortfolioData([]);
        } finally {
            setLoading(false);
        }
    }, [selectedDate, selectedFund]);

    const fetchFundHoldings = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/fund-holdings?fund=${selectedFund}&date=${selectedDate}`);
            const data: HoldingsOverviewApiResponse = await response.json();

            if (data.success && data.data) {
                setHoldingsOverview(data.data);
            } else {
                setHoldingsOverview([]);
                if (data.success === false) {
                    console.error('Fund holdings API returned unsuccessful response');
                }
            }
        } catch (error) {
            console.error('Error fetching fund holdings:', error);
            setHoldingsOverview([]);
        } finally {
            setLoading(false);
        }
    }, [selectedDate, selectedFund]);

    const fetchFundHighlights = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/fund-highlights?fund=${selectedFund}&date=${selectedDate}`);
            const data: FundHighlightsApiResponse = await response.json();

            if (data.success && data.data) {
                setFundHighlights(data.data);
            } else {
                setFundHighlights(null); // Changed to null
                if (data.success === false) {
                    console.error('Fund highlights API returned unsuccessful response');
                }
            }
        } catch (error) {
            console.error('Error fetching fund highlights:', error);
            setFundHighlights(null);
        } finally {
            setLoading(false);
        }
    }, [selectedDate, selectedFund]);

    useEffect(() => {
        fetchFundThesis();
    }, [fetchFundThesis]);

    useEffect(() => {
        if (selectedDate && selectedFund) {
            fetchFundPortfolio();
            fetchFundHoldings();
            fetchFundHighlights();
        }
    }, [selectedDate, selectedFund, fetchFundPortfolio, fetchFundHoldings, fetchFundHighlights]);
    
    const formattedPortfolioData = portfolioData
    .map(item => ({
        ...item,
        market_value: parseFloat(item.market_value),
        formattedDate: new Date(item.trading_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }))
    .sort((a, b) => new Date(a.trading_date).getTime() - new Date(b.trading_date).getTime());
    
    const processedHoldings = (holdingsOverview.map(item => ({
        ticker: item.ticker,  
        value: parseFloat(item.ticker_holdings)
    }))).filter(item => item.value > 0);

    const handleDateChange = (newValue: Date | null): void => {
        if (newValue) {
            setSelectedDate(newValue.toISOString().split("T")[0]); // Convert Date to YYYY-MM-DD string
        }
    };

    const isWeekend = (date: Date) => {
        const day = date.getDay();
        return day === 0 || day === 6;
    };
    
    return (
        <>
            <Header />
            <Paper sx={{ width: '100vw', height: '100vh', backgroundColor: 'white', boxShadow: 'none', padding: 0, overflow: 'auto', borderRadius: 0 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', pl: { xs: 2, sm: 10 }, pr: { xs: 2, sm: 10 }, pt: 3 }}>
                    <Typography variant="h4" fontWeight={800} sx={{ color: theme.palette.primary.main, mb: 4 }}>
                        {decodeURIComponent(fundName || 'broken')}
                    </Typography>
                    {fundThesis
                        .filter((thesis) => thesis.name === decodeURIComponent(fundName || ''))
                        .map((thesis) => (
                            <Card key={thesis.name} sx={{ marginBottom: 4, boxShadow: 3, borderRadius: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" component="div" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                                        Fund Overview
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                                        {thesis.thesis}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    <Card sx={{ marginBottom: 2, boxShadow: 3, borderRadius: 2 }} >
                        <CardContent>
                            <Box sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, mb: 4,
                                pl: { xs: 1 },
                                pr: { xs: 0, sm: 'auto' },
                                pt: 3,
                                gap: 2
                            }}>
                                <Typography variant="h6" component="div" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                                    Fund Performance
                                </Typography>
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    gap: 1,
                                    width: { xs: '100%', sm: 'auto' },
                                }}>

                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        gap: 1,
                                        width: { xs: '100%', sm: 'auto' },
                                    }}>
                                        {[
                                            { label: '1W', period: 'week' },
                                            { label: '1M', period: 'month' },
                                            { label: '3M', period: '3months' },
                                            { label: '1Y', period: 'year' }
                                        ].map(({ label, period }) => (
                                            <Button
                                                key={period}
                                                variant="outlined"
                                                size="small"
                                                onClick={() => setSelectedDate(calculateDate(period as 'week' | 'month' | '3months' | 'year'))}
                                                sx={{
                                                    minWidth: '60px',
                                                    height: '40px',
                                                    borderRadius: "8px",
                                                    borderColor: selectedDate === calculateDate(period as 'week' | 'month' | '3months' | 'year')
                                                        ? theme.palette.primary.main
                                                        : '#ccc',
                                                    color: selectedDate === calculateDate(period as 'week' | 'month' | '3months' | 'year')
                                                        ? theme.palette.primary.main
                                                        : 'inherit',
                                                    '&:hover': {
                                                        borderColor: theme.palette.primary.main,
                                                    }
                                                }}
                                            >
                                                {label}
                                            </Button>
                                        ))}
                                    </Box>

                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label="Select a Date"
                                    value={selectedDate ? new Date(selectedDate) : null} // Convert string to Date
                                    onChange={handleDateChange}
                                    shouldDisableDate={isWeekend} // Disables weekends
                                    minDate={new Date(2000, 0, 1)} 
                                    maxDate={new Date(2050, 0, 1)} 
                                    slotProps={{
                                        textField: {
                                            variant: "outlined",
                                            sx: {
                                                flexDirection: { xs: 'column', sm: 'row' },
                                                gap: 1,
                                                width: { xs: '100%', sm: 'auto' },
                                                height: 40, 
                                                borderRadius: "12px", 
                                                
                                            }
                                        }
                                    }}
                                />
                            </LocalizationProvider>

                            </Box>
                            </Box>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper elevation={2} sx={{ padding: 2, border: '1px solid #e0e0e0' }}>
                                        <Typography variant="h6">Fund Value</Typography>
                                        <LineChart
                                            width={500}
                                            height={300}
                                            data={formattedPortfolioData}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="formattedDate"
                                            />
                                            <YAxis />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="market_value"
                                                stroke="#800000"
                                                dot={false}
                                            />
                                        </LineChart>
                                    </Paper>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper elevation={2} sx={{ padding: 2, border: '1px solid #e0e0e0' }}>
                                        <Typography variant="h6">Holdings Overview</Typography>
                                        {processedHoldings.length > 0 ? (
                                            <PieChart width={500} height={300}>
                                                <Pie
                                                    data={processedHoldings}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={true}
                                                    label={({ ticker, percent }) => `${ticker} (${(percent * 100).toFixed(1)}%)`}
                                                    outerRadius={80}
                                                    dataKey="value"
                                                >
                                                    {processedHoldings.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={`hsl(0, ${70 + (index % 3) * 10}%, ${50 - (index % 4) * 5}%`}
                                                        />
                                                    ))}
                                                </Pie>
                                            </PieChart>
                                        ) : (
                                            <Typography>No holdings data available</Typography>
                                        )}
                                    </Paper>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <Paper elevation={2} sx={{ padding: 2, border: '1px solid #e0e0e0' }}>
                                        <Typography variant="h6" sx={{ mb: 2 }}>Highlights</Typography>
                                        {loading ? (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                                                <CircularProgress sx={{ color: theme.palette.primary.main }} />
                                            </Box>
                                        ) : fundHighlights ? (
                                            <TableContainer component={Paper}>
                                                <Table>
                                                    <TableBody>
                                                        <TableRow>
                                                            <TableCell sx={{ fontWeight: 'bold' }}>Total Trades</TableCell>
                                                            <TableCell align="left">{fundHighlights.total_trades}</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell sx={{ fontWeight: 'bold' }}>Assets</TableCell>
                                                            <TableCell align="left">{fundHighlights.assets}</TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell sx={{ fontWeight: 'bold' }}>Investments</TableCell>
                                                            <TableCell align="left">
                                                                ${fundHighlights.investments ? parseFloat(fundHighlights.investments).toFixed(2).toLocaleString() : '0.00'}
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell sx={{ fontWeight: 'bold' }}>Sectors</TableCell>
                                                            <TableCell align="left">{fundHighlights.sectors}</TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        ) : (
                                            <Typography>No highlights data available</Typography>
                                        )}
                                    </Paper>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Box>
            </Paper>
        </>
    );
}

export default function FundPage() {
    return <FundContent />;
}