"use client"; // Ensure this is a Client Component

import { useRouter } from "next/navigation";
import { Box, Typography, Button } from '@mui/material';

export default function Home() {
    const router = useRouter();
        return (
            <Box className="min-h-screen bg-white flex flex-col items-center justify-center">
            <Typography variant="h1" sx={{ color: "#800000", fontSize: "6rem", fontWeight: 700, marginBottom: 6 }}>
                DFIC
            </Typography>

            <Box className="flex flex-col" sx={{ gap: 2 }}> {/* Using theme spacing here */}
                <Button
                    onClick={() => router.push("/holdings")}
                    sx={{
                        backgroundColor: "#800000",
                        color: "#ffffff",
                        paddingX: 6,
                        paddingY: 3,
                        borderRadius: 2,
                        fontSize: "1rem",
                        fontWeight: 600,
                        '&:hover': {
                            backgroundColor: "#600000",
                        },
                        transition: "background-color 0.3s",
                    }}
                >
                    Holdings
                </Button>
                <Button
                    onClick={() => router.push("/performance")}
                    sx={{
                        backgroundColor: "#800000",
                        color: "#ffffff",
                        paddingX: 6,
                        paddingY: 3,
                        borderRadius: 2,
                        fontSize: "1rem",
                        fontWeight: 600,
                        '&:hover': {
                            backgroundColor: "#600000",
                        },
                        transition: "background-color 0.3s",
                    }}
                >
                    Performance
                </Button>
                <Button
                    disabled
                    sx={{
                        backgroundColor: "#d3d3d3",
                        color: "#ffffff",
                        paddingX: 6,
                        paddingY: 3,
                        borderRadius: 2,
                        fontSize: "1rem",
                        fontWeight: 600,
                        cursor: "not-allowed",
                    }}
                >
                    Transactions (Coming Soon)
                </Button>
            </Box>
        </Box>
    );
}
