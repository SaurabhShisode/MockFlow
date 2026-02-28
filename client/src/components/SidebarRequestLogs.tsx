import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import BouncingDotsLoader from './BouncingDotsLoader';
import { useAuth } from '../context/AuthContext';

interface LogEntry {
  _id: string;
  timestamp: string;
  method: string;
  path: string;
  statusCode: number;
  responseTime?: number;
  clientIP?: string;
  requestBody?: any;
  responseBody?: any;
  headers?: any;
}

const SidebarRequestLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const { token, user } = useAuth();

  const fetchLogs = async () => {
    if (!user || !token) {
      setLogs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://mockflow-backend.onrender.com/logs/paginated?page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
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
  }, [page, limit, token, user]);

  const formatTimestamp = (ts: string) => new Date(ts).toLocaleString();

  const [openDetails, setOpenDetails] = useState<string | null>(null);

  const toggleDetails = (id: string) => {
    setOpenDetails(openDetails === id ? null : id);
  };

  if (!user) {
    return (
      <div className="text-center py-10 text-gray-400 font-inter">
        Sign in to see your mock request logs.
      </div>
    );
  }

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
        <div className="text-center py-16 space-y-5">
          <svg className="w-20 h-20 mx-auto text-gray-600" fill="none" viewBox="0 0 80 80" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 24h40M20 34h30M20 44h35M20 54h25" strokeLinecap="round" strokeDasharray="4 3" />
            <rect x="12" y="14" width="56" height="52" rx="6" />
          </svg>
          <p className="text-gray-400 text-base md:text-lg">No request logs recorded yet.</p>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">Logs will appear here once your mock endpoints receive requests.</p>
        </div>
      ) : (
        logs.map(log => (
          <div
            key={log._id}
            className="p-3 bg-white/5 rounded border border-white/10 hover:bg-white/10 transition space-y-3 cursor-pointer"
            onClick={() => toggleDetails(log._id)}
          >
            <div className="flex items-center space-x-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${log.method === 'GET' ? 'bg-green-500/20 text-green-400'
                  : log.method === 'POST' ? 'bg-blue-500/20 text-blue-400'
                    : log.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400'
                      : log.method === 'DELETE' ? 'bg-red-500/20 text-red-400'
                        : 'bg-purple-500/20 text-purple-400'
                }`}>
                {log.method}
              </span>

              <span className={`text-xs ${log.statusCode < 300 ? 'text-green-400'
                  : log.statusCode < 500 ? 'text-yellow-400'
                    : 'text-red-400'
                }`}>
                {log.statusCode}
              </span>

              {log.clientIP && (
                <span className="text-gray-400 text-xs ml-2">
                  IP {log.clientIP}
                </span>
              )}


            </div>

            <p className="text-gray-200 text-sm truncate">{log.path}</p>
            <p className="text-gray-400 text-xs">{formatTimestamp(log.timestamp)}</p>

            {openDetails === log._id && (
              <div className="mt-3 space-y-2 bg-black/20 p-3 font-inter rounded animate-fadeIn">

                {log.requestBody && (
                  <div>
                    <p className="text-indigo-300 text-xs">Request body</p>
                    <pre className="text-gray-300 text-xs bg-black/30 p-2 rounded overflow-auto">
                      {JSON.stringify(log.requestBody, null, 2)}
                    </pre>
                  </div>
                )}

                {log.responseBody && (
                  <div>
                    <p className="text-indigo-300 text-xs mb-2">Response body</p>
                    <pre className="text-gray-300 text-xs bg-black/30 p-2 rounded overflow-auto font-inter">
                      {JSON.stringify(log.responseBody, null, 2)}
                    </pre>
                  </div>
                )}



              </div>
            )}
          </div>
        ))
      )}

      <div className="flex flex-wrap justify-center items-center gap-2 pt-3 px-2">


        <button
          disabled={page === 1}
          onClick={() => setPage(prev => prev - 1)}
          className="px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-40 text-xs md:text-sm"
        >
          Prev
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 rounded text-xs md:text-sm ${page === i + 1
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
          className="px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-40 text-xs md:text-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SidebarRequestLogs;
