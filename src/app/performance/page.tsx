'use client';
import { useState, useEffect } from 'react';
import { MdOutlineArrowBackIos, MdOutlineArrowForwardIos} from "react-icons/md";

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
    const pageSize = 50;

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

    const formatReturn = (value: string | null) => {
        if (value === null || value === undefined) return <span className="text-black">–</span>;
        const numberValue = parseFloat(value);
        return (
            <span className={numberValue > 0 ? 'text-green-600' : numberValue < 0 ? 'text-red-600' : 'text-black'}>
                {numberValue}%
            </span>
        );
    };

    const validateDate = (date: string) => {
        const year = parseInt(date.split('-')[0], 10);
        if (year < 1900 || year > 2100) {
            alert("Please enter a valid year between 1900 and 2100.");
            return '';
        }
        return date;
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
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-[#800000] text-4xl font-bold">Performance Data</h1>
                    <div className="flex items-center gap-4">
                        <input 
                            type="date" 
                            value={selectedDate} 
                            onChange={(e) => {
                                setSelectedDate(validateDate(e.target.value));
                                setPage(1);
                            }}
                            min="1900-01-01" 
                            max="2100-12-31"
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

                <div className="overflow-x-auto max-h-[735px]">
                    <table className="w-full border-collapse">
                        <thead className="sticky top-0 bg-white shadow-md z-10">
                            <tr>
                                <th className="border-b-2 border-[#800000] p-3 text-left text-[#800000] bg-white">Date</th>
                                <th className="border-b-2 border-[#800000] p-3 text-left text-[#800000] bg-white">Inception Return</th>
                                <th className="border-b-2 border-[#800000] p-3 text-left text-[#800000] bg-white">1 Day Return</th>
                                <th className="border-b-2 border-[#800000] p-3 text-left text-[#800000] bg-white">1 Week Return</th>
                                <th className="border-b-2 border-[#800000] p-3 text-left text-[#800000] bg-white">1 Month Return</th>
                                <th className="border-b-2 border-[#800000] p-3 text-left text-[#800000] bg-white">1 Year Return</th>
                                <th className="border-b-2 border-[#800000] p-3 text-left text-[#800000] bg-white">YTD Return</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="p-3 text-gray-600 text-center">Loading data...</td></tr>
                            ) : error ? (
                                <tr><td colSpan={7} className="p-3 text-gray-600 text-center">{error}</td></tr>
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

                <div className="flex justify-between items-center mt-4">
                    <button onClick={() => setPage(page - 1)} disabled={page === 1} className="text-[#800000] disabled:opacity-50">
                        <MdOutlineArrowBackIos size={25}/>
                    </button>
                    <span className="text-gray-700">Page {page} of {totalPages}</span>
                    <button onClick={() => setPage(page + 1)} disabled={page === totalPages} className="text-[#800000] disabled:opacity-50">
                        <MdOutlineArrowForwardIos size={25}/>
                    </button>
                </div>
            </div>
        </div>
    );
}
