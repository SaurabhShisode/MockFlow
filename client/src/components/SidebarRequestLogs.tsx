import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import BouncingDotsLoader from './BouncingDotsLoader';
import { useAuth } from '../context/AuthContext';
import { Search, BarChart3, AlertTriangle, GitBranch } from 'lucide-react';

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

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;
const STATUS_FILTERS = [
  { label: '2xx', min: 200, max: 299, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { label: '4xx', min: 400, max: 499, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { label: '5xx', min: 500, max: 599, color: 'bg-red-500/20 text-red-400 border-red-500/30' },
] as const;

const methodColor = (m: string) => {
  switch (m) {
    case 'GET': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'POST': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'PUT': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'DELETE': return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
  }
};

const SidebarRequestLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeMethodFilters, setActiveMethodFilters] = useState<Set<string>>(new Set());
  const [activeStatusFilters, setActiveStatusFilters] = useState<Set<string>>(new Set());

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
        setTotalLogs(data.totalLogs || data.logs.length);
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

  const toggleMethodFilter = (method: string) => {
    setActiveMethodFilters(prev => {
      const next = new Set(prev);
      if (next.has(method)) next.delete(method);
      else next.add(method);
      return next;
    });
  };

  const toggleStatusFilter = (label: string) => {
    setActiveStatusFilters(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = searchQuery === '' || log.path.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMethod = activeMethodFilters.size === 0 || activeMethodFilters.has(log.method);
      const matchesStatus = activeStatusFilters.size === 0 || STATUS_FILTERS.some(sf =>
        activeStatusFilters.has(sf.label) && log.statusCode >= sf.min && log.statusCode <= sf.max
      );
      return matchesSearch && matchesMethod && matchesStatus;
    });
  }, [logs, searchQuery, activeMethodFilters, activeStatusFilters]);

  const stats = useMemo(() => {
    const uniquePaths = new Set(logs.map(l => l.path)).size;
    const errorCount = logs.filter(l => l.statusCode >= 400).length;
    return { uniquePaths, errorCount };
  }, [logs]);

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

      <div className="flex flex-wrap gap-3 mb-2">
        <div className="glass-card flex items-center gap-2 px-3 py-1.5 rounded-full">
          <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-indigo-300 font-bold text-xs">{totalLogs}</span>
          <span className="text-gray-400 text-[10px]">total logs</span>
        </div>
        <div className="glass-card flex items-center gap-2 px-3 py-1.5 rounded-full">
          <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-indigo-300 font-bold text-xs">{stats.uniquePaths}</span>
          <span className="text-gray-400 text-[10px]">unique paths</span>
        </div>
        <div className="glass-card flex items-center gap-2 px-3 py-1.5 rounded-full">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          <span className="text-red-300 font-bold text-xs">{stats.errorCount}</span>
          <span className="text-gray-400 text-[10px]">errors (this page)</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by path..."
            className="w-full pl-9 pr-4 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {METHODS.map(m => (
            <button
              key={m}
              onClick={() => toggleMethodFilter(m)}
              className={`px-2 py-1 rounded-md text-xs font-mono font-medium border transition-all cursor-pointer ${activeMethodFilters.has(m)
                  ? methodColor(m)
                  : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                }`}
            >
              {m}
            </button>
          ))}

          <div className="w-px bg-white/10 mx-1" />

          {STATUS_FILTERS.map(sf => (
            <button
              key={sf.label}
              onClick={() => toggleStatusFilter(sf.label)}
              className={`px-2 py-1 rounded-md text-xs font-mono font-medium border transition-all cursor-pointer ${activeStatusFilters.has(sf.label)
                  ? sf.color
                  : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                }`}
            >
              {sf.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <select
          value={limit}
          onChange={e => {
            setPage(1);
            setLimit(Number(e.target.value));
          }}
          className="bg-gray-800 text-white text-sm px-2 py-1 rounded cursor-pointer"
        >
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>

        {(searchQuery || activeMethodFilters.size > 0 || activeStatusFilters.size > 0) && (
          <span className="text-gray-400 text-xs">
            Showing {filteredLogs.length} of {logs.length} logs
          </span>
        )}
      </div>

      {filteredLogs.length === 0 ? (
        <div className="text-center py-16 space-y-5">
          {logs.length === 0 ? (
            <>
              <svg className="w-20 h-20 mx-auto text-gray-600" fill="none" viewBox="0 0 80 80" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 24h40M20 34h30M20 44h35M20 54h25" strokeLinecap="round" strokeDasharray="4 3" />
                <rect x="12" y="14" width="56" height="52" rx="6" />
              </svg>
              <p className="text-gray-400 text-base md:text-lg">No request logs recorded yet.</p>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">Logs will appear here once your mock endpoints receive requests.</p>
            </>
          ) : (
            <>
              <Search className="w-16 h-16 mx-auto text-gray-600" />
              <p className="text-gray-400 text-base md:text-lg">No logs match your filters.</p>
              <p className="text-gray-500 text-sm">Try adjusting your search or filter criteria.</p>
            </>
          )}
        </div>
      ) : (
        filteredLogs.map(log => (
          <div
            key={log._id}
            className={`p-3 bg-white/5 rounded border border-white/10 hover:bg-white/10 transition space-y-3 cursor-pointer border-l-3 ${log.statusCode < 300 ? 'border-l-green-500' : log.statusCode < 500 ? 'border-l-yellow-500' : 'border-l-red-500'
              }`}
            onClick={() => toggleDetails(log._id)}
          >
            <div className="flex items-center space-x-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${methodColor(log.method)}`}>
                {log.method}
              </span>

              <span className={`text-xs font-semibold ${log.statusCode < 300 ? 'text-green-400'
                : log.statusCode < 500 ? 'text-yellow-400'
                  : 'text-red-400'
                }`}>
                {log.statusCode}
              </span>

              {log.responseTime !== undefined && (
                <span className="text-gray-500 text-xs">{log.responseTime}ms</span>
              )}

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

      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-2 pt-3 px-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(prev => prev - 1)}
            className="px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-40 text-xs md:text-sm cursor-pointer"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded text-xs md:text-sm cursor-pointer ${page === i + 1
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
            className="px-2 py-1 bg-gray-700 text-white rounded disabled:opacity-40 text-xs md:text-sm cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default SidebarRequestLogs;
