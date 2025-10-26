import { useMemo, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { FileUpload } from './components/FileUpload';
import { DataTable } from './components/DataTable';
import { DownloadIcon, ProcessIcon, ResetIcon, TableIcon, TrendingUpIcon } from './components/icons';

const API_URL = 'http://127.0.0.1:5000';

type TableRow = Record<string, any>;

interface Stats {
    rowsProcessed: number;
    originalColumns: number;
    columnsRemoved: number;
    finalColumns: number;
}

interface PositionStats {
  top1: number;
  top3: number;
  top5: number;
  top10: number;
  top50: number;
}

const App: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [stats, setStats] = useState<Stats | null>(null);
    const [processedData, setProcessedData] = useState<TableRow[]>([]);
    const dataPreview = useMemo(() => processedData.slice(0, 100), [processedData]);
    const [processedHeaders, setProcessedHeaders] = useState<string[]>([]);
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [downloadToken, setDownloadToken] = useState<string | null>(null);
    const [positionStats, setPositionStats] = useState<PositionStats | null>(null);

    const isProcessed = processedData.length > 0;

    const handleFileSelect = (selectedFile: File | null) => {
        if (selectedFile) {
            if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || selectedFile.name.endsWith('.xlsx')) {
                setFile(selectedFile);
                setError(null);
            } else {
                setError('Invalid file type. Please upload a .xlsx file.');
                setFile(null);
            }
        }
    };

    const processFile = useCallback(async () => {
        if (!file) return;
        setIsLoading(true);
        setError(null);
        handleReset(false);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(`${API_URL}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const { stats, processed_data, available_dates, download_token } = response.data;
            setProcessedData(processed_data);
            setAvailableDates(available_dates);
            setDownloadToken(download_token);
            setStats(stats);

            if (processed_data.length > 0) {
                setProcessedHeaders(Object.keys(processed_data[0]));
            }

            if (available_dates.length > 0) {
                setSelectedDate(available_dates[0]);
            }

        } catch (err: any) {
            const errorMessage = err.response?.data?.error || err.message || 'An unknown error occurred.';
            setError(`Failed to process file: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, [file]);

    const downloadFile = useCallback(() => {
        if (!downloadToken) {
            setError('No download link available.');
            return;
        }
        window.location.href = `${API_URL}/download/${downloadToken}`;
    }, [downloadToken]);

    useEffect(() => {
        if (!selectedDate || processedData.length === 0) {
            setPositionStats(null); return;
        }
        const positionColumn = `${selectedDate}_position`;

        const stats: PositionStats = { top1: 0, top3: 0, top5: 0, top10: 0, top50: 0 };

        processedData.forEach(row => {
            const positionValue = row[positionColumn];
            if (typeof positionValue === 'number' && !isNaN(positionValue) && positionValue > 0) {
                if (positionValue <= 1) stats.top1++;
                if (positionValue <= 3) stats.top3++;
                if (positionValue <= 5) stats.top5++;
                if (positionValue <= 10) stats.top10++;
                if (positionValue <= 50) stats.top50++;
            }
        });

        setPositionStats(stats);

    }, [selectedDate, processedData]);

    const handleReset = (resetFile = true) => {
        if (resetFile) setFile(null);
        setProcessedData([]);
        setStats(null);
        setError(null);
        setIsLoading(false);
        setDownloadToken(null);
        setAvailableDates([]);
        setSelectedDate('');
        setPositionStats(null);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-4 sm:p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
                        Yandex.Webmaster Excel Cleaner
                    </h1>
                    <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
                        Upload your Yandex.Webmaster export file to automatically remove unnecessary columns and download the cleaned version.
                    </p>
                </header>

                <main className="bg-slate-800/50 rounded-2xl shadow-2xl shadow-slate-950/50 ring-1 ring-slate-700 p-6 md:p-8">
                    {!isProcessed ? (
                        <div className="flex flex-col items-center gap-6">
                            <FileUpload onFileSelect={handleFileSelect} file={file} />
                            {error && <p className="text-red-400 mt-2">{error}</p>}
                            <button
                                onClick={processFile}
                                disabled={!file || isLoading}
                                className="inline-flex items-center gap-2 px-8 py-3 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <ProcessIcon />
                                        Process File
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div className="bg-slate-900/60 rounded-lg p-4 mb-6 ring-1 ring-slate-700 flex flex-wrap justify-between items-center gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex-shrink-0 bg-sky-500/10 text-sky-400 rounded-full p-2">
                                    <TableIcon />
                                  </div>
                                  <div>
                                    <h2 className="text-xl font-bold text-white">Processing Complete</h2>
                                    <p className="text-slate-400 text-sm">Preview of your cleaned data below.</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={downloadFile} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400">
                                        <DownloadIcon />
                                        Download Cleaned File
                                    </button>
                                    <button onClick={() => handleReset(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-slate-400">
                                        <ResetIcon />
                                        Start Over
                                    </button>
                                </div>
                            </div>

                            {stats && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <div className="bg-slate-800 p-4 rounded-lg text-center ring-1 ring-slate-700"><p className="text-2xl font-bold text-sky-400">{stats.rowsProcessed}</p><p className="text-sm text-slate-400">Rows Processed</p></div>
                                    <div className="bg-slate-800 p-4 rounded-lg text-center ring-1 ring-slate-700"><p className="text-2xl font-bold text-sky-400">{stats.originalColumns}</p><p className="text-sm text-slate-400">Original Columns</p></div>
                                    <div className="bg-slate-800 p-4 rounded-lg text-center ring-1 ring-slate-700"><p className="text-2xl font-bold text-red-400">{stats.columnsRemoved}</p><p className="text-sm text-slate-400">Columns Removed</p></div>
                                    <div className="bg-slate-800 p-4 rounded-lg text-center ring-1 ring-slate-700"><p className="text-2xl font-bold text-emerald-400">{stats.finalColumns}</p><p className="text-sm text-slate-400">Final Columns</p></div>
                                </div>
                            )}

                            {positionStats && (
                                <div className="mb-6">
                                    <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0 bg-purple-500/10 text-purple-400 rounded-full p-2">
                                                <TrendingUpIcon />
                                            </div>
                                            <h3 className="text-xl font-bold text-white">Keyword Position Analysis</h3>
                                        </div>
                                        {availableDates.length > 1 && (
                                            <div className="flex items-center gap-2">
                                                <label htmlFor="date-select" className="text-sm text-slate-400 shrink-0">Analysis Date:</label>
                                                <select
                                                    id="date-select"
                                                    value={selectedDate || ''}
                                                    onChange={(e) => setSelectedDate(e.target.value)}
                                                    className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full p-2.5"
                                                    aria-label="Select date for position analysis"
                                                >
                                                    {availableDates.map(date => (
                                                        <option key={date} value={date}>
                                                            {date}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                        <div className="bg-slate-800 p-4 rounded-lg text-center ring-1 ring-slate-700"><p className="text-2xl font-bold text-purple-400">{positionStats.top1}</p><p className="text-sm text-slate-400">TOP 1</p></div>
                                        <div className="bg-slate-800 p-4 rounded-lg text-center ring-1 ring-slate-700"><p className="text-2xl font-bold text-purple-400">{positionStats.top3}</p><p className="text-sm text-slate-400">TOP 3</p></div>
                                        <div className="bg-slate-800 p-4 rounded-lg text-center ring-1 ring-slate-700"><p className="text-2xl font-bold text-purple-400">{positionStats.top5}</p><p className="text-sm text-slate-400">TOP 5</p></div>
                                        <div className="bg-slate-800 p-4 rounded-lg text-center ring-1 ring-slate-700"><p className="text-2xl font-bold text-purple-400">{positionStats.top10}</p><p className="text-sm text-slate-400">TOP 10</p></div>
                                        <div className="bg-slate-800 p-4 rounded-lg text-center ring-1 ring-slate-700"><p className="text-2xl font-bold text-purple-400">{positionStats.top50}</p><p className="text-sm text-slate-400">TOP 50</p></div>
                                    </div>
                                </div>
                            )}

                            <DataTable headers={processedHeaders} data={dataPreview} />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default App;