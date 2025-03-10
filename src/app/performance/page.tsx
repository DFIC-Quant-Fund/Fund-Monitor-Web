'use client';
import { useState, useEffect } from 'react';

interface PerformanceData {
    date: string;
    inception_return: string;
    one_day_return: string;
    one_month_return: string;
    one_week_return: string;
    one_year_return: string;
    ytd_return: string;
}

interface ApiResponse {
    data: PerformanceData[];
    success: boolean;
}

export default function Performance() {
    const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://api.degrootefinance.com/api/performance');
                const data: ApiResponse = await response.json();
                if (data.success) {
                    setPerformanceData(data.data);
                }
            } catch (error) {
                console.error('Error fetching performance data:', error);
            }
        };

        fetchData();
    }, []);

    const downloadCSV = () => {
        if (performanceData.length === 0) return;

        const headers = Object.keys(performanceData[0]);
        const csvContent = [
            headers.join(','),
            ...performanceData.map(row =>
                headers.map(header => row[header as keyof PerformanceData]).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'performance_data.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-[#800000] text-4xl font-bold">Performance Data</h1>
                    <button
                        onClick={downloadCSV}
                        className="bg-[#800000] text-white px-4 py-2 rounded hover:bg-[#600000] transition-colors"
                    >
                        Download CSV
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
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
                            {performanceData.map((row, index) => (
                                <tr key={row.date} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                    <td className="border-b border-gray-200 p-3 text-gray-900">{row.date}</td>
                                    <td className="border-b border-gray-200 p-3 text-gray-900">{row.inception_return}%</td>
                                    <td className="border-b border-gray-200 p-3 text-gray-900">{row.one_day_return}%</td>
                                    <td className="border-b border-gray-200 p-3 text-gray-900">{row.one_week_return}%</td>
                                    <td className="border-b border-gray-200 p-3 text-gray-900">{row.one_month_return}%</td>
                                    <td className="border-b border-gray-200 p-3 text-gray-900">{row.one_year_return}%</td>
                                    <td className="border-b border-gray-200 p-3 text-gray-900">{row.ytd_return}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}