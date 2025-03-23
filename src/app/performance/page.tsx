'use client';
import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../../utils/apiBase';

interface PerformanceData {
    date: string;
    inception_return: string | null;
    one_day_return: string | null;
    one_month_return: string | null;
    one_week_return: string | null;
    one_year_return: string | null;
    ytd_return: string | null;
}

interface ApiResponse {
    data: PerformanceData[];
    success: boolean;
}

export default function Performance() {
    const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const url = `${API_BASE_URL}/api/performance?date=${selectedDate}`
            const response = await fetch(url);
            const data: ApiResponse = await response.json();

            if (data.success) {
                setPerformanceData(data.data);
            } else {
                setPerformanceData([]);
                setError('No data available for the selected date.');
            }
        } catch (error) {
            console.error('Error fetching performance data:', error);
            setError('Failed to fetch data. Please try again.');
        }
        setLoading(false);
    }, [selectedDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatReturn = (value: string | null) => {
        if (value === null || value === undefined) return <span className="text-black">–</span>;
        const numberValue = parseFloat(value);
        return (
            <span className={numberValue > 0 ? 'text-green-600' : numberValue < 0 ? 'text-red-600' : 'text-black'}>
                {numberValue.toFixed(4)}%
            </span>
        );
    };

    const downloadCSV = () => {
        if (performanceData.length === 0) return;

        const headers = Object.keys(performanceData[0]);
        const csvContent = [
            headers.join(','),
            ...performanceData.map(row =>
                headers.map(header => row[header as keyof PerformanceData] ?? '-').join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance_data_${selectedDate || 'all'}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-white p-8 flex flex-col">
            <div className="max-w-7xl mx-auto w-full flex flex-col flex-grow">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                    <h1 className="text-[#800000] text-4xl font-bold">Performance</h1>
                    <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0">
                        <input 
                            type="date" 
                            value={selectedDate} 
                            onChange={(e) => setSelectedDate(e.target.value)}
                            min="1900-01-01" 
                            max="2100-12-31"
                            className="border px-3 py-2 rounded shadow text-black"
                        />
                        <button
                            onClick={downloadCSV}
                            className="bg-[#800000] text-white px-4 py-2 rounded hover:bg-[#600000] transition-colors"
                        >
                            Download CSV
                        </button>
                    </div>
                </div>
                <div className="w-full border rounded-lg overflow-x-auto mb-6">
                    <table className="w-full border-collapse ">
                        <thead className="sticky top-0 bg-white shadow-md z-10">
                            <tr>
                                <th className="border-b-2 border-[#800000] p-3 text-left text-[#800000]">Date</th>
                                <th className="border-b-2 border-[#800000] p-3 text-left text-[#800000]">Inception Return</th>
                                <th className="border-b-2 border-[#800000] p-3 text-left text-[#800000]">1 Day Return</th>
                                <th className="border-b-2 border-[#800000] p-3 text-left text-[#800000]">1 Week Return</th>
                                <th className="border-b-2 border-[#800000] p-3 text-left text-[#800000]">1 Month Return</th>
                                <th className="border-b-2 border-[#800000] p-3 text-left text-[#800000]">1 Year Return</th>
                                <th className="border-b-2 border-[#800000] p-3 text-left text-[#800000]">YTD Return</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="p-3 text-gray-600 text-center">Loading data...</td></tr>
                            ) : error ? (
                                <tr><td colSpan={7} className="p-3 text-gray-600 text-center text-red-600">{error}</td></tr>
                            ) : performanceData.length > 0 ? (
                                performanceData.map((row, index) => (
                                    <tr key={row.date} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                        <td className="border-b border-gray-200 p-3 text-gray-900">{row.date}</td>
                                        <td className="border-b border-gray-200 p-3">{formatReturn(row.inception_return)}</td>
                                        <td className="border-b border-gray-200 p-3">{formatReturn(row.one_day_return)}</td>
                                        <td className="border-b border-gray-200 p-3">{formatReturn(row.one_week_return)}</td>
                                        <td className="border-b border-gray-200 p-3">{formatReturn(row.one_month_return)}</td>
                                        <td className="border-b border-gray-200 p-3">{formatReturn(row.one_year_return)}</td>
                                        <td className="border-b border-gray-200 p-3">{formatReturn(row.ytd_return)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={7} className="p-3 text-gray-600 text-center">No data available.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
