import { useState } from 'react';
import { toast } from 'react-toastify';
import BouncingDotsLoader from './BouncingDotsLoader';

interface MockFormProps {
  onMockCreated?: () => void;
}

const MockForm = ({ onMockCreated }: MockFormProps) => {
  const [path, setPath] = useState('/mock/user');
  const [method, setMethod] = useState('GET');
  const [status, setStatus] = useState(200);
  const [response, setResponse] = useState('{\n  "message": "Hello, world!"\n}');
  const [delay, setDelay] = useState(0);
  const [isDynamic, setIsDynamic] = useState(false);
  const [curlCommand, setCurlCommand] = useState('');
  const [mockUrl, setMockUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleStartMocking = async () => {
    setIsCreating(true);
    try {
      const res = await fetch('https://mockflow-backend.onrender.com/start-mock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path,
          method,
          status: Number(status),
          response: JSON.parse(response),
          delay: Number(delay),
          isDynamic: isDynamic,
        }),
      });

      const text = await res.text();
      const fullUrl = `https://mockflow-backend.onrender.com${path}`;
      setMockUrl(fullUrl);
      generateCurlCommand(method, fullUrl, response);

      if (!res.ok) {
        toast.error(`Error: ${text}`);
      } else {
        toast.success(text);
        if (onMockCreated) {
          onMockCreated();
        }
      }
    } catch (error: any) {
      toast.error(`Failed to start mock: ${error.message || error}`);
    } finally {
      setIsCreating(false);
    }
  };

  const generateCurlCommand = (method: string, url: string, body: string) => {
    let command = `curl -X ${method} "${url}"`;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      command += ` -H "Content-Type: application/json" -d '${body}'`;
    }
    setCurlCommand(command);
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg border border-white/20">
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Endpoint Path</label>
              <input
                type="text"
                className="mt-1 block w-full bg-white/10 text-white border border-white/20 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 px-3"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                disabled={isCreating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">HTTP Method</label>
              <select
                className="mt-1 block w-full bg-white/10 text-white border border-white/20 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 px-3"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                disabled={isCreating}
              >
                <option className="bg-gray-900">GET</option>
                <option className="bg-gray-900">POST</option>
                <option className="bg-gray-900">PUT</option>
                <option className="bg-gray-900">DELETE</option>
                <option className="bg-gray-900">PATCH</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Status Code</label>
              <input
                type="number"
                className="mt-1 block w-full bg-white/10 text-white border border-white/20 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 px-3"
                value={status}
                onChange={(e) => setStatus(Number(e.target.value))}
                disabled={isCreating}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Delay (ms)</label>
              <input
                type="number"
                className="mt-1 block w-full bg-white/10 text-white border border-white/20 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 px-3"
                value={delay}
                onChange={(e) => setDelay(Number(e.target.value))}
                disabled={isCreating}
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="checkbox"
                  id="isDynamic"
                  checked={isDynamic}
                  onChange={(e) => setIsDynamic(e.target.checked)}
                  disabled={isCreating}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isDynamic" className="text-sm font-medium text-gray-300">
                  Dynamic Endpoint (CRUD Operations)
                </label>
              </div>
              <div className="text-xs text-gray-400 mb-4">
                {isDynamic ? (
                  <span className="text-green-400">
                    ✓ This endpoint will support real CRUD operations. POST requests will create new items, 
                    GET will return all items, PUT/DELETE will update/delete specific items by ID.
                  </span>
                ) : (
                  <span className="text-yellow-400">
                    ⚠ This endpoint will return the same static response for all requests.
                  </span>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {isDynamic ? 'Initial Data (Optional)' : 'JSON Response'}
              </label>
              <textarea
                className="mt-1 block w-full bg-white/10 text-white border border-white/20 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
                rows={10}
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                disabled={isCreating}
                placeholder={isDynamic ? 
                  '[\n  {"name": "John Doe", "email": "john@example.com"},\n  {"name": "Jane Smith", "email": "jane@example.com"}\n]' : 
                  '{\n  "message": "Hello, world!"\n}'
                }
              ></textarea>
              {isDynamic && (
                <p className="text-xs text-gray-400 mt-1">
                  For dynamic endpoints, this can be an array of initial data or left empty to start with no data.
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleStartMocking}
            disabled={isCreating}
            className="mt-8 w-full inline-flex justify-center items-center rounded-md border border-transparent bg-indigo-600 py-3 px-4 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <>
                <BouncingDotsLoader size="sm" color="text-white" />
                <span className="ml-2">Creating Mock...</span>
              </>
            ) : (
              'Start Mock Server'
            )}
          </button>

          {mockUrl && (
            <div className="mt-6 p-4 bg-black/30 rounded-lg">
              <label className="block text-sm font-medium text-gray-300">Your mock endpoint is live:</label>
              <div className="flex items-center mt-2">
                <input
                  type="text"
                  readOnly
                  value={mockUrl}
                  className="w-full bg-transparent text-white/80 border-none p-0 focus:ring-0"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(mockUrl)}
                  className="ml-2 text-sm text-indigo-400 hover:text-indigo-300"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          {curlCommand && (
            <div className="mt-4 p-4 bg-black/30 rounded-lg">
              <label className="block text-sm font-medium text-gray-300">CURL Command:</label>
              <div className="flex items-center mt-2">
                <input
                  type="text"
                  readOnly
                  value={curlCommand}
                  className="w-full bg-transparent text-white/80 border-none p-0 focus:ring-0"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(curlCommand)}
                  className="ml-2 text-sm text-indigo-400 hover:text-indigo-300"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MockForm;
