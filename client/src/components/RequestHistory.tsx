import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import BouncingDotsLoader from './BouncingDotsLoader';

interface RequestLog {
  _id: string;
  timestamp: string;
  method: string;
  path: string;
  headers: Record<string, string>;
  queryParams: Record<string, string>;
  requestBody: any;
  responseBody: any;
  statusCode: number;
  clientIP: string;
  responseTime: number;
}

interface RequestHistoryProps {
  mockId: string;
}

const RequestHistory = ({ mockId }: RequestHistoryProps) => {
  const [requests, setRequests] = useState<RequestLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [replayingRequest, setReplayingRequest] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://mockflow-backend.onrender.com/mocks/${mockId}/requests?limit=50`);
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        toast.error('Failed to fetch request history');
      }
    } catch (error) {
      toast.error('Error fetching request history');
    } finally {
      setLoading(false);
    }
  };

  const replayRequest = async (request: RequestLog) => {
    setReplayingRequest(request._id);
    try {
      const url = `https://mockflow-backend.onrender.com${request.path}`;
      const options: RequestInit = {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
          ...request.headers
        }
      };

      if (request.requestBody && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        options.body = JSON.stringify(request.requestBody);
      }

      const response = await fetch(url, options);
      const responseData = await response.text();
      
      toast.success(`Request replayed! Status: ${response.status}`);
      console.log('Replay Response:', responseData);
    } catch (error) {
      toast.error('Failed to replay request');
    } finally {
      setReplayingRequest(null);
    }
  };

  const generateCurlCommand = (request: RequestLog) => {
    const url = `https://mockflow-backend.onrender.com${request.path}`;
    let command = `curl -X ${request.method} "${url}"`;
    
    Object.entries(request.headers).forEach(([key, value]) => {
      if (key.toLowerCase() !== 'content-length' && key.toLowerCase() !== 'host') {
        command += ` -H "${key}: ${value}"`;
      }
    });

    if (request.requestBody && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
      command += ` -d '${JSON.stringify(request.requestBody)}'`;
    }

    return command;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const truncateBody = (body: any, maxLength: number = 100) => {
    if (!body) return 'No body';
    const str = typeof body === 'string' ? body : JSON.stringify(body);
    return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-400';
    if (status >= 400 && status < 500) return 'text-yellow-400';
    return 'text-red-400';
  };

  useEffect(() => {
    fetchRequests();
  }, [mockId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <BouncingDotsLoader size="lg" color="text-indigo-400" />
        <p className="text-gray-400 mt-4">Loading request history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Request History</h3>
        <button
          onClick={fetchRequests}
          disabled={loading}
          className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No requests recorded yet.</p>
          <p className="text-gray-500 text-sm mt-2">Make a request to this endpoint to see the history.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <div
              key={request._id}
              className="bg-white/5 rounded-lg border border-white/10 overflow-hidden"
            >
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      request.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                      request.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                      request.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' :
                      request.method === 'DELETE' ? 'bg-red-500/20 text-red-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {request.method}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(request.statusCode)}`}>
                      {request.statusCode}
                    </span>
                    <span className="text-gray-300 text-sm">{formatTimestamp(request.timestamp)}</span>
                    <span className="text-gray-400 text-xs">{request.responseTime}ms</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setExpandedRequest(expandedRequest === request._id ? null : request._id)}
                      className="px-2 py-1 bg-gray-600/20 text-gray-300 rounded text-xs hover:bg-gray-600/30 transition-colors"
                    >
                      {expandedRequest === request._id ? 'Hide Details' : 'View Details'}
                    </button>
                    <button
                      onClick={() => replayRequest(request)}
                      disabled={replayingRequest === request._id}
                      className="px-2 py-1 bg-indigo-600/20 text-indigo-400 rounded text-xs hover:bg-indigo-600/30 transition-colors disabled:opacity-50 flex items-center"
                    >
                      {replayingRequest === request._id ? (
                        <BouncingDotsLoader size="sm" color="text-indigo-400" />
                      ) : (
                        'Replay'
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-3 text-sm text-gray-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-gray-400">Path:</span> {request.path}
                    </div>
                    <div>
                      <span className="text-gray-400">IP:</span> {request.clientIP || 'Unknown'}
                    </div>
                    <div>
                      <span className="text-gray-400">Body:</span> {truncateBody(request.requestBody)}
                    </div>
                  </div>
                </div>

                {expandedRequest === request._id && (
                  <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
                    <div>
                      <h4 className="text-sm font-medium text-white mb-2">Headers</h4>
                      <pre className="bg-black/30 p-3 rounded text-xs text-gray-300 overflow-x-auto">
                        {JSON.stringify(request.headers, null, 2)}
                      </pre>
                    </div>

                    {Object.keys(request.queryParams).length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-white mb-2">Query Parameters</h4>
                        <pre className="bg-black/30 p-3 rounded text-xs text-gray-300 overflow-x-auto">
                          {JSON.stringify(request.queryParams, null, 2)}
                        </pre>
                      </div>
                    )}

                    {request.requestBody && (
                      <div>
                        <h4 className="text-sm font-medium text-white mb-2">Request Body</h4>
                        <pre className="bg-black/30 p-3 rounded text-xs text-gray-300 overflow-x-auto">
                          {JSON.stringify(request.requestBody, null, 2)}
                        </pre>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-medium text-white mb-2">Response Body</h4>
                      <pre className="bg-black/30 p-3 rounded text-xs text-gray-300 overflow-x-auto">
                        {JSON.stringify(request.responseBody, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-white mb-2">CURL Command</h4>
                      <div className="flex items-center space-x-2">
                        <pre className="bg-black/30 p-3 rounded text-xs text-gray-300 overflow-x-auto flex-1">
                          {generateCurlCommand(request)}
                        </pre>
                        <button
                          onClick={() => navigator.clipboard.writeText(generateCurlCommand(request))}
                          className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs hover:bg-purple-600/30 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestHistory; 