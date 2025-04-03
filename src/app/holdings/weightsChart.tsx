import React, { useCallback, useEffect, useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Box, CircularProgress, Typography } from '@mui/material';

interface RawWeightData {
    trading_date: string;
    [key: string]: string; // dynamic field: geography/sector/fund, plus market_value_in_CAD
}

interface PivotedWeightData {
    trading_date: string;
    [category: string]: string | number;
}

interface StackedAreaChartProps {
    title: string;
    apiUrl: string;
    categoryKey: string; // e.g., 'geography', 'sector', 'fund'
}

const StackedAreaChart: React.FC<StackedAreaChartProps> = ({ title, apiUrl, categoryKey }) => {
    const [data, setData] = useState<PivotedWeightData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const round2 = (n: number) => Math.round(n * 100) / 100;

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(apiUrl);
            const json = await res.json();
            const rawData: RawWeightData[] = json.data;

            const grouped: Record<string, PivotedWeightData> = {};

            rawData.forEach(item => {
                const date = new Date(item.trading_date).toISOString().split("T")[0];
                const key = item[categoryKey];
                const value = parseFloat(item.market_value_in_CAD);

                if (!grouped[date]) grouped[date] = { trading_date: date };
                grouped[date][key] = (grouped[date][key] as number || 0) + value;
            });

            const transformedData = Object.values(grouped).map(entry => {
                const total = Object.entries(entry)
                    .filter(([k]) => k !== 'trading_date')
                    .reduce((sum, [, val]) => sum + (val as number), 0);

                const roundedEntry: PivotedWeightData = {
                    trading_date: entry.trading_date,
                };

                let roundedTotal = 0;
                let maxKey = '';
                let maxValue = -Infinity;

                // Step 1: round each and track max
                for (const [key, value] of Object.entries(entry)) {
                    if (key === 'trading_date') continue;
                    const weight = round2((value as number / total) * 100);
                    roundedEntry[key] = weight;
                    roundedTotal += weight;

                    if (weight > maxValue) {
                        maxValue = weight;
                        maxKey = key;
                    }
                }

                // Step 2: adjust max key if there's a small diff
                const diff = round2(roundedTotal - 100);
                if (Math.abs(diff) > 0.001 && maxKey) {
                    roundedEntry[maxKey] = round2((roundedEntry[maxKey] as number) - diff);
                }

                return roundedEntry;
            });

            transformedData.sort((a, b) =>
                new Date(a.trading_date).getTime() - new Date(b.trading_date).getTime()
            );

            setData(transformedData);
        } catch (err) {
            console.error('Error fetching chart data:', err);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [apiUrl, categoryKey]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const allKeys = Array.from(
        new Set(
            data.flatMap(d =>
                Object.keys(d).filter(k => k !== "trading_date")
            )
        )
    );

    return (
        <Box sx={{
            borderRadius: 2,
            boxShadow: 2,
            overflow: 'hidden',
            padding: 2,
            backgroundColor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            mb: 2,
        }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                {title}
            </Typography>
            <Box sx={{ width: '100%', height: 400 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                    </Box>
                ) : data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="trading_date"
                                tickFormatter={(date) => new Date(date).toLocaleDateString()}
                            />
                            <YAxis 
                                domain={[0, 100]} 
                                tickFormatter={(v) => `${v}%`}
                                allowDataOverflow={true}
                            />
                            <Tooltip
                                // formatter={(v: number) => [`${v.toFixed(2)}%`, 'Weight']}
                                formatter={(value: number, name: string) => [`${value.toFixed(2)}%`, name]}
                                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                            />
                            <Legend />
                            {allKeys.map((key, index) => (
                                <Area
                                    key={key}
                                    type="monotone"
                                    dataKey={key}
                                    name={key}
                                    stackId="1"
                                    stroke={`hsl(${(index * 360) / allKeys.length}, 70%, 50%)`}
                                    fill={`hsl(${(index * 360) / allKeys.length}, 70%, 50%)`}
                                />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <Typography variant="body1" sx={{ textAlign: 'center', mt: 2 }}>
                        No data available.
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default StackedAreaChart;