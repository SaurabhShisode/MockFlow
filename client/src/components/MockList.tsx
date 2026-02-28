import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { toast } from 'react-toastify';
import BouncingDotsLoader from './BouncingDotsLoader';
import RequestHistory from './RequestHistory';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Copy,
  Check,
  Trash2,
  Pencil,
  ClipboardCopy,
  Download,
  Upload,
  Terminal
} from 'lucide-react';

interface Mock {
  _id: string;
  path: string;
  method: string;
  status: number;
  response: any;
  delay: number;
  createdAt: string;
  lastAccessed: string;
  accessCount: number;
  isDynamic?: boolean;
}

export interface MockListRef {
  fetchMocks: () => void;
}

interface MockListProps {
  onSelectMock?: (id: string | null) => void;
  onEditMock?: (mock: Mock) => void;
}

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;

const methodColor = (m: string) => {
  switch (m) {
    case 'GET': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'POST': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'PUT': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'DELETE': return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
  }
};

const MockList = forwardRef<MockListRef, MockListProps>((props, ref) => {
  const { onSelectMock, onEditMock } = props;
  const { token } = useAuth();

  const [mocks, setMocks] = useState<Mock[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [expandedMock, setExpandedMock] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeMethodFilters, setActiveMethodFilters] = useState<Set<string>>(new Set());

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchMocks = async () => {
    if (!token) {
      setMocks([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://mockflow-backend.onrender.com/mocks', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMocks(data);
      } else {
        toast.error('Failed to fetch mocks');
      }
    } catch (error) {
      toast.error('Error fetching mocks');
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    fetchMocks
  }));

  const deleteMock = async (id: string) => {
    if (!token) {
      toast.error('Please sign in');
      return;
    }

    setDeletingIds(prev => new Set(prev).add(id));
    try {
      const response = await fetch(`https://mockflow-backend.onrender.com/mocks/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Mock deleted successfully');
        fetchMocks();
      } else {
        toast.error('Failed to delete mock');
      }
    } catch (error) {
      toast.error('Error deleting mock');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const cloneMock = async (mock: Mock) => {
    if (!token) {
      toast.error('Please sign in');
      return;
    }
    try {
      const res = await fetch('https://mockflow-backend.onrender.com/start-mock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          path: mock.path + '-copy',
          method: mock.method,
          status: mock.status,
          response: mock.response,
          delay: mock.delay,
          isDynamic: mock.isDynamic || false
        })
      });
      if (res.ok) {
        toast.success('Mock cloned successfully');
        fetchMocks();
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || 'Failed to clone mock');
      }
    } catch {
      toast.error('Error cloning mock');
    }
  };

  const copyWithFeedback = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const copyUrl = (mock: Mock) => {
    const url = `https://mockflow-backend.onrender.com${mock.path}`;
    copyWithFeedback(url, `${mock._id}-url`);
  };

  const copyCurl = (mock: Mock) => {
    const url = `https://mockflow-backend.onrender.com${mock.path}`;
    let command = `curl -X ${mock.method} "${url}"`;
    if (['POST', 'PUT', 'PATCH'].includes(mock.method)) {
      command += ` -H "Content-Type: application/json" -d '${JSON.stringify(mock.response)}'`;
    }
    copyWithFeedback(command, `${mock._id}-curl`);
  };

  const toggleExpanded = (mockId: string) => {
    const newExpanded = expandedMock === mockId ? null : mockId;
    setExpandedMock(newExpanded);
    if (onSelectMock) onSelectMock(newExpanded);
  };

  const toggleMethodFilter = (method: string) => {
    setActiveMethodFilters(prev => {
      const next = new Set(prev);
      if (next.has(method)) next.delete(method);
      else next.add(method);
      return next;
    });
    setCurrentPage(1);
  };

  const exportMocks = () => {
    const blob = new Blob([JSON.stringify(mocks, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mockflow-export.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Mocks exported successfully');
  };

  const importMocks = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      const items = Array.isArray(imported) ? imported : [imported];
      let successCount = 0;

      for (const item of items) {
        const res = await fetch('https://mockflow-backend.onrender.com/start-mock', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            path: item.path,
            method: item.method,
            status: item.status,
            response: item.response,
            delay: item.delay || 0,
            isDynamic: item.isDynamic || false
          })
        });
        if (res.ok) successCount++;
      }

      toast.success(`Imported ${successCount} of ${items.length} mocks`);
      fetchMocks();
    } catch {
      toast.error('Invalid JSON file');
    }

    e.target.value = '';
  };

  useEffect(() => {
    fetchMocks();
  }, []);

  if (loading) {
    return (
      <div className="w-full font-inter">
        <div className="rounded-xl shadow-lg py-8">
          <div className="flex flex-col items-center justify-center py-12">
            <BouncingDotsLoader size="lg" color="text-indigo-400" />
            <p className="text-gray-400 mt-4">Loading your mocks...</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredMocks = mocks.filter(mock => {
    const matchesSearch = searchQuery === '' || mock.path.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = activeMethodFilters.size === 0 || activeMethodFilters.has(mock.method);
    return matchesSearch && matchesMethod;
  });

  const totalPages = Math.ceil(filteredMocks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedMocks = filteredMocks.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="w-full max-w-6xl font-inter">
      <div className="rounded-xl">
        <div className="py-8">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={fetchMocks}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm cursor-pointer"
              >
                {loading ? (
                  <>
                    <BouncingDotsLoader size="sm" color="text-white" />
                    <span className="ml-2">Refreshing...</span>
                  </>
                ) : 'Refresh'}
              </button>

              <span className="px-3 py-1.5 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-semibold border border-indigo-500/20">
                {mocks.length} mock{mocks.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportMocks}
                disabled={mocks.length === 0}
                className="px-3 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-lg hover:bg-white/10 transition-colors text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>

              <label className="px-3 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-lg hover:bg-white/10 transition-colors text-xs flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                Import
                <input type="file" accept=".json" onChange={importMocks} className="hidden" />
              </label>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search by path..."
                className="w-full pl-9 pr-4 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {METHODS.map(m => (
                <button
                  key={m}
                  onClick={() => toggleMethodFilter(m)}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium border transition-all cursor-pointer ${activeMethodFilters.has(m)
                      ? methodColor(m)
                      : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                    }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {filteredMocks.length === 0 ? (
            <div className="text-center py-16 space-y-5">
              {mocks.length === 0 ? (
                <>
                  <svg className="w-20 h-20 mx-auto text-gray-600" fill="none" viewBox="0 0 80 80" stroke="currentColor" strokeWidth="1.5">
                    <rect x="12" y="18" width="56" height="44" rx="6" strokeDasharray="4 3" />
                    <path d="M32 38h16M36 44h8" strokeLinecap="round" />
                    <circle cx="40" cy="30" r="4" />
                  </svg>
                  <p className="text-gray-400 text-base md:text-lg">No mock endpoints created yet.</p>
                  <p className="text-gray-500 text-sm max-w-sm mx-auto">Create your first mock to start simulating API responses instantly.</p>
                </>
              ) : (
                <>
                  <Search className="w-16 h-16 mx-auto text-gray-600" />
                  <p className="text-gray-400 text-base md:text-lg">No mocks match your filters.</p>
                  <p className="text-gray-500 text-sm">Try adjusting your search or filter criteria.</p>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {displayedMocks.map(mock => (
                  <div key={mock._id} className="bg-white/5 rounded-lg border border-white/10 overflow-hidden hover:bg-white/[0.07] transition">
                    <div className="p-4">

                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${methodColor(mock.method)}`}>
                            {mock.method}
                          </span>

                          <span className="text-white font-inter text-xs md:text-sm">{mock.path}</span>

                          {mock.isDynamic && (
                            <span className="ml-2 px-2 py-1 rounded text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                              Dynamic
                            </span>
                          )}

                          <span className={`px-2 py-1 rounded text-xs ${mock.status >= 200 && mock.status < 300
                            ? 'bg-green-500/20 text-green-400'
                            : mock.status >= 400 && mock.status < 500
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                            }`}>
                            {mock.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {onEditMock && (
                            <button
                              onClick={() => onEditMock(mock)}
                              className="p-1.5 rounded-md bg-white/5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => cloneMock(mock)}
                            className="p-1.5 rounded-md bg-white/5 text-gray-400 hover:text-green-400 hover:bg-green-500/10 transition-colors cursor-pointer"
                            title="Clone"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => toggleExpanded(mock._id)}
                            className="px-3 py-1 bg-gray-600/20 text-gray-300 rounded text-xs md:text-sm hover:bg-gray-600/30 transition-colors cursor-pointer"
                          >
                            {expandedMock === mock._id ? 'Hide Logs' : 'Show Logs'}
                          </button>

                          <button
                            onClick={() => deleteMock(mock._id)}
                            disabled={deletingIds.has(mock._id)}
                            className="p-1.5 rounded-md bg-white/5 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            title="Delete"
                          >
                            {deletingIds.has(mock._id)
                              ? <BouncingDotsLoader size="sm" color="text-red-400" />
                              : <Trash2 className="w-3.5 h-3.5" />
                            }
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap md:flex-row gap-3 text-sm text-gray-300 mb-3">
                        <div><span className="text-gray-400">Delay:</span> {mock.delay}ms</div>
                        <div><span className="text-gray-400">Accesses:</span> {mock.accessCount}</div>
                        <div><span className="text-gray-400">Created:</span> {new Date(mock.createdAt).toLocaleDateString()}</div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => copyUrl(mock)}
                          className="px-3 py-1 bg-indigo-600/20 text-indigo-400 rounded text-sm hover:bg-indigo-600/30 cursor-pointer flex items-center gap-1.5 transition-all"
                        >
                          {copiedKey === `${mock._id}-url` ? (
                            <><Check className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Copied!</span></>
                          ) : (
                            <><ClipboardCopy className="w-3.5 h-3.5" />Copy URL</>
                          )}
                        </button>
                        <button
                          onClick={() => copyCurl(mock)}
                          className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded text-sm hover:bg-purple-600/30 cursor-pointer flex items-center gap-1.5 transition-all"
                        >
                          {copiedKey === `${mock._id}-curl` ? (
                            <><Check className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Copied!</span></>
                          ) : (
                            <><Terminal className="w-3.5 h-3.5" />Copy CURL</>
                          )}
                        </button>
                      </div>

                      {expandedMock === mock._id && (
                        <div className="mt-6 border-t border-white/10 pt-6">
                          <RequestHistory mockId={mock._id} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex flex-wrap justify-center items-center gap-2 mt-6 px-2">
                  <button
                    className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-40 text-xs md:text-sm cursor-pointer"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>

                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 rounded text-xs md:text-sm cursor-pointer ${currentPage === i + 1
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-700 text-gray-300'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-40 text-xs md:text-sm cursor-pointer"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
});

export default MockList;
