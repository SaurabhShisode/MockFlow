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

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://mockflow-backend.onrender.com/logs/recent?limit=20');
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      } else {
        toast.error('Failed to fetch recent logs');
      }
    } catch (error) {
      toast.error('Error fetching logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatTimestamp = (ts: string) => {
    return new Date(ts).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-4">
        <BouncingDotsLoader size="lg" color="text-indigo-400" />
        <p className="text-gray-400 mt-2">Loading logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">

      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold text-white">Recent Logs</h2>
        <button
          onClick={fetchLogs}
          className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition"
        >
          Refresh
        </button>
      </div>

      {logs.length === 0 ? (
        <p className="text-gray-400 text-center py-6">No logs yet.</p>
      ) : (
        logs.map(log => (
          <div
            key={log._id}
            className="p-3 bg-white/5 rounded border border-white/10 hover:bg-white/10 transition cursor-pointer"
          >
            <div className="flex items-center space-x-2 mb-1">
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${
                  log.method === 'GET'
                    ? 'bg-green-500/20 text-green-400'
                    : log.method === 'POST'
                    ? 'bg-blue-500/20 text-blue-400'
                    : log.method === 'PUT'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : log.method === 'DELETE'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-purple-500/20 text-purple-400'
                }`}
              >
                {log.method}
              </span>

              <span
                className={`text-xs ${
                  log.statusCode >= 200 && log.statusCode < 300
                    ? 'text-green-400'
                    : log.statusCode >= 400 && log.statusCode < 500
                    ? 'text-yellow-400'
                    : 'text-red-400'
                }`}
              >
                {log.statusCode}
              </span>
            </div>

            <p className="text-gray-200 text-sm font-mono truncate">{log.path}</p>

            <p className="text-gray-400 text-xs mt-1">
              {log.mockName || 'Unknown Mock'}
            </p>

            <p className="text-gray-500 text-xs mt-1">
              {formatTimestamp(log.timestamp)}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default SidebarRequestLogs;
