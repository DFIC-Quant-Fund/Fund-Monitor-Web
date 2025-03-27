"use client"; // Ensure this is a Client Component

import { useRouter } from "next/navigation";
import { Box, Typography, Button, ThemeProvider } from '@mui/material';
import theme from './theme';

export default function Home() {
    const router = useRouter();
        return (
            <ThemeProvider theme={theme}>
            <Box className="min-h-screen bg-white flex flex-col items-center justify-center">
            <Typography variant="h1" sx={{ color: "#800000", fontSize: "3.75rem", fontWeight: 700, marginBottom:2 }}>
                DFIC
            </Typography>
            <Box className="flex flex-col" sx={{ gap: 2 }}>
                <Button onClick={() => router.push("/holdings")}>
                    Holdings
                </Button>
                <Button onClick={() => router.push("/performance")}>
                    Performance
                </Button>
                <Button disabled>
                    Transactions (Coming Soon)
                </Button>
            </Box>
        </Box>
        </ThemeProvider>
    );
}
