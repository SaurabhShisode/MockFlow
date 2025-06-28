import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { toast } from 'react-toastify';
import BouncingDotsLoader from './BouncingDotsLoader';
import RequestHistory from './RequestHistory';

interface Mock {
  _id: string;
  path: string;
  method: string;
  status: number;
  response: any;
  delay: number;
  isDynamic: boolean;
  createdAt: string;
  lastAccessed: string;
  accessCount: number;
}

interface DynamicData {
  mockId: string;
  path: string;
  method: string;
  data: any[];
  count: number;
  lastUpdated: string;
}

export interface MockListRef {
  fetchMocks: () => void;
}

const MockList = forwardRef<MockListRef>((_, ref) => {
  const [mocks, setMocks] = useState<Mock[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [expandedMock, setExpandedMock] = useState<string | null>(null);
  const [dynamicData, setDynamicData] = useState<DynamicData | null>(null);
  const [showDataModal, setShowDataModal] = useState(false);

  const fetchMocks = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://mockflow-backend.onrender.com/mocks');
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
    setDeletingIds(prev => new Set(prev).add(id));
    try {
      const response = await fetch(`https://mockflow-backend.onrender.com/mocks/${id}`, {
        method: 'DELETE',
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

  const fetchDynamicData = async (mockId: string) => {
    try {
      const response = await fetch(`https://mockflow-backend.onrender.com/mocks/${mockId}/data`);
      if (response.ok) {
        const data = await response.json();
        setDynamicData(data);
        setShowDataModal(true);
      } else {
        toast.error('Failed to fetch dynamic data');
      }
    } catch (error) {
      toast.error('Error fetching dynamic data');
    }
  };

  const clearDynamicData = async (mockId: string) => {
    try {
      const response = await fetch(`https://mockflow-backend.onrender.com/mocks/${mockId}/data`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast.success('Dynamic data cleared successfully');
        if (showDataModal) {
          fetchDynamicData(mockId);
        }
      } else {
        toast.error('Failed to clear dynamic data');
      }
    } catch (error) {
      toast.error('Error clearing dynamic data');
    }
  };

  const copyUrl = (mock: Mock) => {
    const url = `https://mockflow-backend.onrender.com${mock.path}`;
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard!');
  };

  const copyCurl = (mock: Mock) => {
    const url = `https://mockflow-backend.onrender.com${mock.path}`;
    let command = `curl -X ${mock.method} "${url}"`;
    if (['POST', 'PUT', 'PATCH'].includes(mock.method)) {
      command += ` -H "Content-Type: application/json" -d '${JSON.stringify(mock.response)}'`;
    }
    navigator.clipboard.writeText(command);
    toast.success('CURL command copied to clipboard!');
  };

  const toggleExpanded = (mockId: string) => {
    setExpandedMock(expandedMock === mockId ? null : mockId);
  };

  useEffect(() => {
    fetchMocks();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-4xl">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <BouncingDotsLoader size="lg" color="text-indigo-400" />
            <p className="text-gray-400 mt-4">Loading your mocks...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-4xl">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg border border-white/20">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Your Mock Endpoints</h2>
              <button
                onClick={fetchMocks}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <BouncingDotsLoader size="sm" color="text-white" />
                    <span className="ml-2">Refreshing...</span>
                  </>
                ) : (
                  'Refresh'
                )}
              </button>
            </div>

            {mocks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 text-lg">No mock endpoints created yet.</p>
                <p className="text-gray-500 text-sm mt-2">Create your first mock using the form above!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {mocks.map((mock) => (
                  <div
                    key={mock._id}
                    className="bg-white/5 rounded-lg border border-white/10 overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            mock.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                            mock.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                            mock.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' :
                            mock.method === 'DELETE' ? 'bg-red-500/20 text-red-400' :
                            'bg-purple-500/20 text-purple-400'
                          }`}>
                            {mock.method}
                          </span>
                          <span className="text-white font-mono text-sm">{mock.path}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            mock.status >= 200 && mock.status < 300 ? 'bg-green-500/20 text-green-400' :
                            mock.status >= 400 && mock.status < 500 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {mock.status}
                          </span>
                          {mock.isDynamic && (
                            <span className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-400">
                              Dynamic
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          {mock.isDynamic && (
                            <button
                              onClick={() => fetchDynamicData(mock._id)}
                              className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded text-sm hover:bg-purple-600/30 transition-colors"
                            >
                              View Data
                            </button>
                          )}
                          <button
                            onClick={() => toggleExpanded(mock._id)}
                            className="px-3 py-1 bg-gray-600/20 text-gray-300 rounded text-sm hover:bg-gray-600/30 transition-colors"
                          >
                            {expandedMock === mock._id ? 'Hide History' : 'Request History'}
                          </button>
                          <button
                            onClick={() => deleteMock(mock._id)}
                            disabled={deletingIds.has(mock._id)}
                            className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            title="Delete mock"
                          >
                            {deletingIds.has(mock._id) ? (
                              <BouncingDotsLoader size="sm" color="text-red-400" />
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300 mb-3">
                        <div>
                          <span className="text-gray-400">Delay:</span> {mock.delay}ms
                        </div>
                        <div>
                          <span className="text-gray-400">Accesses:</span> {mock.accessCount}
                        </div>
                        <div>
                          <span className="text-gray-400">Created:</span> {new Date(mock.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => copyUrl(mock)}
                          className="px-3 py-1 bg-indigo-600/20 text-indigo-400 rounded text-sm hover:bg-indigo-600/30 transition-colors"
                        >
                          Copy URL
                        </button>
                        <button
                          onClick={() => copyCurl(mock)}
                          className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded text-sm hover:bg-purple-600/30 transition-colors"
                        >
                          Copy CURL
                        </button>
                      </div>

                      {expandedMock === mock._id && (
                        <div className="mt-6 border-t border-white/10 pt-6">
                          <RequestHistory 
                            mockId={mock._id}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Data Modal */}
      {showDataModal && dynamicData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                Dynamic Data for {dynamicData.method} {dynamicData.path}
              </h3>
              <button
                onClick={() => setShowDataModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-300">
                Total items: {dynamicData.count} | Last updated: {new Date(dynamicData.lastUpdated).toLocaleString()}
              </div>
              <button
                onClick={() => clearDynamicData(dynamicData.mockId)}
                className="px-3 py-1 bg-red-600/20 text-red-400 rounded text-sm hover:bg-red-600/30 transition-colors"
              >
                Clear All Data
              </button>
            </div>

            {dynamicData.data.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No data available. Use POST requests to add items.</p>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-4">
                <pre className="text-sm text-gray-300 overflow-x-auto">
                  {JSON.stringify(dynamicData.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
});

export default MockList; 