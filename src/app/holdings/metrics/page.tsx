'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/nav';
import {Box, Paper, Typography, Button, FormControl, Select, MenuItem,} 
from '@mui/material';
import { Download } from '@mui/icons-material';
import Loading from '../../components/loading';
import StackedAreaChart from '../weightsChart';
import { API_BASE_URL } from '../../../utils/apiBase';

function HoldingsMetricsContent() {
  const router = useRouter();
  const params = useSearchParams();

  const urlStart = params.get('start_date');
  const urlEnd   = params.get('end_date');
  const urlPort  = params.get('portfolio');

  const INCEPTION_DATE = '2022-05-02';

  const [startDate, setStartDate]     = useState(urlStart || INCEPTION_DATE);
  const [endDate, setEndDate]         = useState(urlEnd   || '');
  const [portfolio, setPortfolio]     = useState(urlPort  || 'core');
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

  const fetchLatestDate = useCallback(async () => {
    const res = await fetch(`${API_BASE_URL}/api/latest-date`);
    const json = await res.json();
    if (json.trading_date) {
      const d = new Date(json.trading_date);
      d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
      setEndDate(d.toISOString().slice(0, 10));
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !urlEnd) {
      fetchLatestDate();
    }
  }, [authLoading, urlEnd, fetchLatestDate]);

  // Sync URL on any change
  const syncUrl = useCallback(() => {
    const q = new URLSearchParams();
    q.set('start_date', startDate);
    q.set('end_date', endDate);
    q.set('portfolio', portfolio);
    router.replace(`/holdings/metrics?${q.toString()}`, { scroll: false });
  }, [router, startDate, endDate, portfolio]);

  useEffect(() => {
    if (!authLoading && endDate) {
      syncUrl();
    }
  }, [authLoading, syncUrl, endDate]);

  const exportMetrics = () => {
    console.log('export metrics for', { startDate, endDate, portfolio });
  };

  if (authLoading) return <Loading />;

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
        {/* header bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' }, 
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            pl: { xs: 2, sm: 10 },
            pr: { xs: 2, sm: 10 },
            pt: 3,
            mb: 4,
          }}
        >
          <Typography variant="h4" fontWeight={800} sx={{ color: '#800000', mb: { xs: 2, sm: 0 } }}>
            Holdings Metrics
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'stretch',
              gap: 2,
              flexWrap: 'wrap', 
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            {/* start date */}
            <Box
              component="input"
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              sx={{
                width: { xs: '100%', sm: 160 },
                height: 40,
                border: '1px solid #ccc',
                borderRadius: 1,
                px: 1,
              }}
            />

            {/* end date */}
            <Box
              component="input"
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              sx={{
                width: { xs: '100%', sm: 160 },
                height: 40,
                border: '1px solid #ccc',
                borderRadius: 1,
                px: 1,
              }}
            />

            {/* portfolio selector */}
            <FormControl
              size="small"
              sx={{ width: { xs: '100%', sm: 160 } }}
            >
              <Select
                value={portfolio}
                onChange={e => setPortfolio(e.target.value)}
                sx={{ height: 40, borderRadius: 1 }}
              >
                <MenuItem value="core">Core Portfolio</MenuItem>
                <MenuItem value="benchmark">Benchmark Portfolio</MenuItem>
              </Select>
            </FormControl>

            {/* export button  */}
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={exportMetrics}
              sx={{
                width: { xs: '100%', sm: 160 },
                height: 40,
                borderRadius: 1,
                backgroundColor: '#800000',
                '&:hover': { backgroundColor: '#660000' },
                textTransform: 'uppercase',
                color: 'white',
              }}
            >
              Export
            </Button>

            {/* view holdings */}
            <Link
              href={`/holdings?date=${endDate}&portfolio=${portfolio}`}
              passHref
              style={{ textDecoration: 'none' }}
            >
              <Button
                fullWidth={false}
                variant="contained"
                sx={{
                  width: { xs: '100%', sm: 160 },
                  height: 40,
                  borderRadius: 1,
                  backgroundColor: '#800000',
                  '&:hover': { backgroundColor: '#660000' },
                  textTransform: 'uppercase',
                  color: 'white',
                }}
              >
                Holdings
              </Button>
            </Link>
          </Box>
        </Box>

        {/* charts */}
        <Box
          sx={{
            pl: { xs: 2, sm: 10 },
            pr: { xs: 2, sm: 10 },
            pb: 5,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <StackedAreaChart
            title="Geography Weights Over Time"
            apiUrl={`${API_BASE_URL}/api/holdings/sector-weights-geography?portfolio=${portfolio}&start_date=${startDate}&end_date=${endDate}`}
            categoryKey="geography"
          />
          <StackedAreaChart
            title="Sector Weights Over Time"
            apiUrl={`${API_BASE_URL}/api/holdings/sector-weights-sector?portfolio=${portfolio}&start_date=${startDate}&end_date=${endDate}`}
            categoryKey="sector"
          />
          <StackedAreaChart
            title="Fund Weights Over Time"
            apiUrl={`${API_BASE_URL}/api/holdings/sector-weights-fund?portfolio=${portfolio}&start_date=${startDate}&end_date=${endDate}`}
            categoryKey="fund"
          />
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
