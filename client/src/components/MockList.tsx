import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { toast } from 'react-toastify';

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
}

export interface MockListRef {
  fetchMocks: () => void;
}

const MockList = forwardRef<MockListRef>((props, ref) => {
  const [mocks, setMocks] = useState<Mock[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMocks = async () => {
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
    try {
      const response = await fetch(`https://mockflow-backend.onrender.com/mocks/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast.success('Mock deleted successfully');
        fetchMocks(); // Refresh the list
      } else {
        toast.error('Failed to delete mock');
      }
    } catch (error) {
      toast.error('Error deleting mock');
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

  useEffect(() => {
    fetchMocks();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-4xl">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 p-8">
          <div className="animate-pulse">
            <div className="h-4 bg-white/20 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-white/10 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg border border-white/20">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Your Mock Endpoints</h2>
            <button
              onClick={fetchMocks}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Refresh
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
                  className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-colors"
                >
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
                    </div>
                    <button
                      onClick={() => deleteMock(mock._id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Delete mock"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default MockList; 