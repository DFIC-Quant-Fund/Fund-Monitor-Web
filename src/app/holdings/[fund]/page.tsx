'use client';
import { useParams } from 'next/navigation';
import Header from '../../components/nav';  // Note: path updated
import { Paper, Typography, Box } from '@mui/material';
import theme from '../../theme';  // Note: path updated

function FundContent() {
    const params = useParams<{ fund: string }>();

    const fundName = params?.fund

    return (
        <>
            <Header />
            <Paper sx={{ width: '100vw', height: '100vh', backgroundColor: 'white', boxShadow: 'none', padding: 0, overflow: 'auto', borderRadius: 0 }}>
                <Box sx={{
                    display: 'flex', flexDirection: 'column',
                    pl: { xs: 2, sm: 10 },
                    pr: { xs: 2, sm: 10 },
                    pt: 3
                }}>
                    <Typography variant="h4" fontWeight={800} sx={{ color: theme.palette.primary.main, mb: 4 }}>
                        {decodeURIComponent(fundName || 'broken')}
                    </Typography>
                    Anything else goes here somewhere (^ name should be dynamic for any fund. pipe this string to a db query directly)
                </Box>
            </Paper>
        </>
    );
}

export default function FundPage() {
    return <FundContent />;
}