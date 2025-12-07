import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import BouncingDotsLoader from './BouncingDotsLoader';

interface LogEntry {
  _id: string;
  timestamp: string;
  method: string;
  path: string;
  statusCode: number;
  mockId: string;
  mockName?: string;
}

const SidebarRequestLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://mockflow-backend.onrender.com/logs/paginated?page=${page}&limit=${limit}`
      );

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
        setTotalPages(data.totalPages);
      } else {
        toast.error('Failed to fetch logs');
      }
    } catch (error) {
      toast.error('Error fetching logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, limit]);

  const formatTimestamp = (ts: string) => new Date(ts).toLocaleString();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-4">
        <BouncingDotsLoader size="lg" color="text-indigo-400" />
        <p className="text-gray-400 mt-2">Loading logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-inter">

      <div className="flex justify-between items-center">
        

        <select
          value={limit}
          onChange={e => {
            setPage(1);
            setLimit(Number(e.target.value));
          }}
          className="bg-gray-800 text-white text-sm px-2 py-1 rounded"
        >
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>

      {logs.length === 0 ? (
        <p className="text-gray-400 text-center py-6">No logs found.</p>
      ) : (
        logs.map(log => (
          <div
            key={log._id}
            className="p-3 bg-white/5 rounded border border-white/10 hover:bg-white/10 transition font-inter space-y-3"
          >
            <div className="flex items-center space-x-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                log.method === 'GET'
                  ? 'bg-green-500/20 text-green-400'
                  : log.method === 'POST'
                  ? 'bg-blue-500/20 text-blue-400'
                  : log.method === 'PUT'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : log.method === 'DELETE'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-purple-500/20 text-purple-400'
              }`}>
                {log.method}
              </span>

              <span className={`text-xs ${
                log.statusCode < 300 ? 'text-green-400'
                : log.statusCode < 500 ? 'text-yellow-400'
                : 'text-red-400'
              }`}>
                {log.statusCode}
              </span>
            </div>

            <p className="text-gray-200 text-sm font-inter truncate">{log.path}</p>

            <p className="text-gray-400 text-xs mt-1">{formatTimestamp(log.timestamp)}</p>
          </div>
        ))
      )}

    
      <div className="flex justify-center items-center space-x-2 pt-3">

        <button
          disabled={page === 1}
          onClick={() => setPage(prev => prev - 1)}
          className="px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-40"
        >
          Prev
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 rounded text-sm ${
              page === i + 1
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={page === totalPages}
          onClick={() => setPage(prev => prev + 1)}
          className="px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-40"
        >
          Next
        </button>

      </div>

    </div>
  );
};

export default SidebarRequestLogs;
