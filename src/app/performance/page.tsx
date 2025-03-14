'use client';
import { useState, useEffect } from 'react';
import { MdOutlineArrowBackIos, MdOutlineArrowForwardIos} from "react-icons/md"

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
    page: number;
    totalPages: number;
    totalRecords: number;
}

export default function Performance() {
    const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 50; // Display 50 rows per page

    useEffect(() => {
        fetchData();
    }, [selectedDate, page]);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const url = selectedDate
                ? `https://api.degrootefinance.com/api/performance?date=${selectedDate}&page=${page}&limit=${pageSize}`
                : `https://api.degrootefinance.com/api/performance?page=${page}&limit=${pageSize}`;

            const response = await fetch(url);
            const data: ApiResponse = await response.json();

            if (data.success) {
                setPerformanceData(data.data);
                setTotalPages(data.totalPages);
            } else {
                setPerformanceData([]);
                setError('No data available for the selected date.');
            }
        } catch (error) {
            console.error('Error fetching performance data:', error);
            setError('Failed to fetch data. Please try again.');
        }
        setLoading(false);
    };

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
        a.download = `performance_data_${selectedDate || 'all'}.csv`;
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
                    <div className="flex items-center gap-4">
                        <input 
                            type="date" 
                            value={selectedDate} 
                            onChange={(e) => {
                                setSelectedDate(e.target.value);
                                setPage(1); // Reset to first page when date changes
                            }}
                            className={`border px-3 py-2 rounded shadow ${selectedDate ? 'text-black' : 'text-gray-500'}`}
                        />
                        <button
                            onClick={downloadCSV}
                            className="bg-[#800000] text-white px-4 py-2 rounded hover:bg-[#600000] transition-colors"
                        >
                            Download CSV
                        </button>
                    </div>
                </div>

                {loading && <p className="p-3 text-gray-600">Loading data...</p>}
                {error && <p className="p-3 text-gray-600">{error}</p>}

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
                            {performanceData.length > 0 ? (
                                performanceData.map((row, index) => (
                                    <tr key={row.date} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                        <td className="border-b border-gray-200 p-3 text-gray-900">{row.date}</td>
                                        <td className="border-b border-gray-200 p-3 text-gray-900">{row.inception_return}%</td>
                                        <td className="border-b border-gray-200 p-3 text-gray-900">{row.one_day_return}%</td>
                                        <td className="border-b border-gray-200 p-3 text-gray-900">{row.one_week_return}%</td>
                                        <td className="border-b border-gray-200 p-3 text-gray-900">{row.one_month_return}%</td>
                                        <td className="border-b border-gray-200 p-3 text-gray-900">{row.one_year_return}%</td>
                                        <td className="border-b border-gray-200 p-3 text-gray-900">{row.ytd_return}%</td>
                                    </tr>
                                ))
                            ) : (
                                !loading && <tr><td colSpan={7} className="p-3 text-gray-600">No data available.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-4">
                    <button 
                        onClick={() => setPage(page - 1)} 
                        disabled={page === 1}
                        className="text-[#800000] disabled:opacity-50"
                    >
                        <MdOutlineArrowBackIos size={25}/>
                    </button>
                    <span className="text-gray-700">Page {page} of {totalPages}</span>
                    <button 
                        onClick={() => setPage(page + 1)} 
                        disabled={page === totalPages}
                        className="text-[#800000] disabled:opacity-50"
                    >
                        <MdOutlineArrowForwardIos size={25}/>
                    </button>
                </div>
            </div>
        </div>
    );
}
