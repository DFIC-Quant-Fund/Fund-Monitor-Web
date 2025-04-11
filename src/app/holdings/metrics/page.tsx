'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/nav';
import { Box, Paper, Typography, Button } from '@mui/material';
import Loading from '../../components/loading';
import StackedAreaChart from '../weightsChart'; 
import { API_BASE_URL } from '../../../utils/apiBase';

function HoldingsMetricsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlPortfolio = searchParams.get('portfolio');
  const urlDate = searchParams.get('date');

  // Use URL parameters if available; otherwise, default values.
  const [selectedPortfolio] = useState(urlPortfolio || 'core');
  const [selectedDate, setSelectedDate] = useState(urlDate || '');
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

  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  if (authLoading) {
    return <Loading />;
  }

  return (
    <>
      <Header />
      <Paper
        sx={{
          width: '100vw',
          minHeight: '100vh',
          backgroundColor: 'white',
          boxShadow: 'none',
          padding: 0,
          overflow: 'auto',
          borderRadius: 0,
        }}
      >
        <Box sx={{ pl: { xs: 2, sm: 10 }, pr: { xs: 2, sm: 10 }, pt: 3, pb: 5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 4,
            }}
          >
            <Typography variant="h4" fontWeight={800}>
              Holdings Metrics
            </Typography>
            {/* Link to default Holdings page, passing the date and portfolio parameters */}
            <Link
              href={`/holdings?date=${selectedDate}&portfolio=${selectedPortfolio}`}
              style={{ textDecoration: 'none' }}
            >
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#800000',
                  borderColor: '#800000',
                  color: 'white',
                  '&:hover': { backgroundColor: '#660000' },
                }}
              >
                View Holdings
              </Button>
            </Link>
          </Box>

          {/* Date Switcher */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: 4,
            }}
          >
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              style={{
                width: '180px',
                height: '40px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '8px',
                outline: 'none',
              }}
            />
          </Box>

          {/* Metrics Charts Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Box sx={{ flex: 1 }}>
              <StackedAreaChart
                title="Geography Weights Over Time"
                apiUrl={`${API_BASE_URL}/api/holdings/sector-weights-geography?portfolio=${selectedPortfolio}&date=${selectedDate}`}
                categoryKey="geography"
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <StackedAreaChart
                title="Sector Weights Over Time"
                apiUrl={`${API_BASE_URL}/api/holdings/sector-weights-sector?portfolio=${selectedPortfolio}&date=${selectedDate}`}
                categoryKey="sector"
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <StackedAreaChart
                title="Fund Weights Over Time"
                apiUrl={`${API_BASE_URL}/api/holdings/sector-weights-fund?portfolio=${selectedPortfolio}&date=${selectedDate}`}
                categoryKey="fund"
              />
            </Box>
          </Box>
        </Box>
      </Paper>
    </>
  );
}

export default function HoldingsMetricsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <HoldingsMetricsContent />
    </Suspense>
  );
}
