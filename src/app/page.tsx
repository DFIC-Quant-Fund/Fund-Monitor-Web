"use client";

import { useRouter } from "next/navigation";
import { Box, Typography, Button, ThemeProvider } from '@mui/material';
import { useEffect, useState } from "react";
import theme from './theme';
import Loading from './components/loading';

export default function Home() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // Start with null to represent loading
    

    useEffect(() => {
        const auth = localStorage.getItem("auth");
        if (!auth) {
            router.push("/login");
        } else {
            setIsAuthenticated(true);
        }
    }, [router]);

    if (!isAuthenticated) {
        return (
            <>
                <Loading /> 
            </>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <Box className="min-h-screen bg-white flex flex-col items-center justify-center">
                <Typography variant="h1" sx={{ color: "#800000", fontSize: "3.75rem", fontWeight: 700, marginBottom: 2 }}>
                    DFIC
                </Typography>
                <Box className="flex flex-col" sx={{ gap: 2 }}>
                    <Button onClick={() => router.push("/holdings")}>
                        Holdings
                    </Button>
                    <Button onClick={() => router.push("/performance")}>
                        Performance
                    </Button>
                    <Button onClick={() => router.push("/transactions")}>
                        Transactions
                    </Button>
                    <Button onClick={() => {
                        localStorage.removeItem("auth");
                        router.push("/login");
                    }}
                            sx={{ minWidth: '250px' }}
                    >
                        Logout
                    </Button>
                </Box>
            </Box>
        </ThemeProvider>
    );
}
