'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/nav';
import { Box, Paper, Typography } from '@mui/material';
import Loading from '../../components/loading';

function HoldingsMetricsContent() {
    const router = useRouter();
    const [authLoading, setAuthLoading] = useState(true);

    // Authentication check
    useEffect(() => {
        const token = localStorage.getItem('auth');
        if (!token) {
            router.push('/login?redirect=%2Fholdings%2Fmetrics');
        } else {
            setAuthLoading(false);
        }
    }, [router]);

    if (authLoading) {
        return <Loading />;
    }

    return (
        <>
            <Header />
            <Paper sx={{
                width: '100vw',
                height: '100vh',
                backgroundColor: 'white',
                boxShadow: 'none',
                padding: 0,
                overflow: 'auto',
                borderRadius: 0
            }}>
                <Box sx={{
                    pl: { xs: 2, sm: 10 },
                    pr: { xs: 2, sm: 10 },
                    pt: 3
                }}>
                    <Typography variant="h4" fontWeight={800} sx={{ mb: 4 }}>
                        Holdings Metrics
                    </Typography>
                    
                    {/* Add your metrics content here */}
                    <Typography variant="body1">
                        Coming soon...
                    </Typography>
                </Box>
            </Paper>
        </>
    );
}

export default function HoldingsMetricsPage() {
    return <HoldingsMetricsContent />;
}