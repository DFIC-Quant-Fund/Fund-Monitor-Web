'use client';
import { useParams } from 'next/navigation';
import Header from '../../components/nav';
import { Paper, Typography, Box, TextField, Grid, CardContent, Card, Tooltip, TableBody, Table, TableCell, TableContainer, TableRow, Icon } from '@mui/material';
import theme from '../../theme';
import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/utils/apiBase';
import { LineChart, CartesianGrid, XAxis, YAxis, Line, Cell, Pie, PieChart, Legend } from 'recharts';

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

function FundContent() {
    const params = useParams<{ fund: string }>();
    const fundName = params?.fund;

    const [fundThesis, setFundThesis] = useState<FundThesis[]>([]);
    const [selectedFund] = useState(fundName);
    const [loading, setLoading] = useState(true);
    const [portfolioData, setPortfolioData] = useState<PortfolioData[]>([]);
    const [holdingsOverview, setHoldingsOverview] = useState<HoldingsOverview[]>([]);
    const [fundHighlights, setFundHighlights] = useState<FundHighlights | null>(null); 
    const baseDate = new Date(Date.now() - 31536000000).toLocaleDateString('en-CA'); // 31536000000 milliseconds = 1 year
    const [selectedDate, setSelectedDate] = useState(baseDate);

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
    }, [selectedDate]);

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
    }, [selectedDate]);

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
    }, [selectedDate]);

    useEffect(() => {
        fetchFundThesis();
    }, [fetchFundThesis]);

    useEffect(() => {
        if (selectedDate && selectedFund) {
            fetchFundPortfolio();
            fetchFundHoldings();
            fetchFundHighlights();
        }
    }, [selectedDate, fetchFundPortfolio, fetchFundHoldings, fetchFundHighlights]);
    
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
    
    const processedHoldings = holdingsOverview.map(item => ({
        ticker: item.ticker,  
        value: parseFloat(item.ticker_holdings)
    }));


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
                            pr: { xs: 2, sm: 10 },
                            pt: 3
                            }}>
                            <Typography variant="h6" component="div" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                                    Fund Performance
                                </Typography>
                                <Box
                            component="input"
                            type="date"
                            value={selectedDate || ""}
                            onChange={(e) => setSelectedDate(e.target.value)}
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
                            </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
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
                            <Grid item xs={12} md={6}>
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
                                            {/* color */}
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
                            <Grid item xs={12}>
                                <Paper elevation={2} sx={{ padding: 2, border: '1px solid #e0e0e0' }}>
                                    <Typography variant="h6" sx={{ mb: 2 }}>Highlights</Typography>
                                    {fundHighlights && (
                                        <Grid container spacing={2}> 
                                        <Grid item xs={12} sm={6} md={3}> 
                                            <Card sx={{ height: '100%' }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p:2, height: '100%'}}>
                                            <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 'bold' }}>
                                                Total Trades
                                                </Typography>
                                                <Typography variant="h6" sx={{ mt: 1 }}> 
                                                {fundHighlights.total_trades}
                                                </Typography>
                                            </Box>
                                            </Card>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Card>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p:2, height: '100%'}}>
                                            <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 'bold' }}>
                                                Assets
                                                </Typography>
                                                <Typography variant="h6" sx={{ mt: 1 }}>
                                                {fundHighlights.assets}
                                                </Typography>
                                            </Box>
                                            </Card>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Card>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p:2, height: '100%'}}>
                                            <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 'bold' }}>
                                            Investments
                                            </Typography>
                                            <Typography variant="h6" sx={{ mt: 1 }}>
                                            ${(fundHighlights.investments ? parseFloat(fundHighlights.investments).toFixed(2) : '0.00').toLocaleString()}
                                            </Typography>
                                            </Box>
                                            </Card>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Card>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p:2, height: '100%'}}>
                                            <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 'bold' }}>
                                                Sectors
                                                </Typography>
                                                <Typography variant="h6" sx={{ mt: 1 }}>
                                                {fundHighlights.sectors}
                                                </Typography>
                                            </Box>
                                            </Card>
                                        </Grid>
                                        </Grid>
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