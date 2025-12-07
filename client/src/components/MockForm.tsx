import { useState } from 'react';
import { toast } from 'react-toastify';
import BouncingDotsLoader from './BouncingDotsLoader';
import {
  Server,
  UploadCloud,
  Hash,
  Clock,
  FileJson,
  Database,
  ClipboardCopy,
  Link as LinkIcon,
  ChevronDown,
  Check
} from 'lucide-react';

interface MockFormProps {
  onMockCreated?: () => void;
}



const MockForm = ({ onMockCreated }: MockFormProps) => {
  const [path, setPath] = useState('/mock/user');
  const [method, setMethod] = useState('GET');
  const [status, setStatus] = useState(200);
  const [delay, setDelay] = useState(0);
  const [response, setResponse] = useState('{\n  "message": "Hello, world!"\n}');
  const [isDynamic, setIsDynamic] = useState(false);
  const [curlCommand, setCurlCommand] = useState('');
  const [mockUrl, setMockUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [methodOpen, setMethodOpen] = useState(false);

  const handleStartMocking = async () => {
    setIsCreating(true);
    try {
      const res = await fetch('https://mockflow-backend.onrender.com/start-mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path,
          method,
          status: Number(status),
          response: JSON.parse(response),
          delay: Number(delay),
          isDynamic
        })
      });

      const text = await res.text();
      const fullUrl = `https://mockflow-backend.onrender.com${path}`;
      setMockUrl(fullUrl);
      generateCurlCommand(method, fullUrl, response);

      if (!res.ok) {
        toast.error(text || 'Failed to create mock');
      } else {
        toast.success(text || 'Mock created');
        if (onMockCreated) onMockCreated();
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create mock');
    } finally {
      setIsCreating(false);
    }
  };

  const generateCurlCommand = (m: string, url: string, body: string) => {
    let cmd = `curl -X ${m} "${url}"`;
    if (['POST', 'PUT', 'PATCH'].includes(m)) {
      cmd += ` -H "Content-Type: application/json" -d '${body}'`;
    }
    setCurlCommand(cmd);
  };



  return (
    <div className="w-full font-inter mt-8">
      <div className="max-w-5xl rounded-2xl items-center mx-auto bg-white/5 border border-white/10 shadow-xl backdrop-blur-xl p-8 space-y-10">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-400" />
              Endpoint Path
            </label>
            <div className="rounded-xl bg-black/20 border border-white/10 px-4 h-12 flex items-center focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition">
              <input
                type="text"
                className="w-full bg-transparent outline-none text-sm text-white placeholder:text-gray-500"
                value={path}
                onChange={e => setPath(e.target.value)}
                disabled={isCreating}
                placeholder="/mock/users"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-indigo-400" />
              HTTP Method
            </label>

            <div
              className="relative rounded-xl bg-black/20 border border-white/10 h-12 flex items-center px-4 cursor-pointer select-none transition"
              onClick={() => setMethodOpen(o => !o)}
            >
              <span className="flex items-center gap-2 text-sm text-white">
                <span className="inline-flex items-center justify-center rounded-md bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300 font-mono">
                  {method}
                </span>
                <span className="text-gray-300">Request</span>
              </span>

              <ChevronDown
                className={`w-4 h-4 text-gray-400 ml-auto transition-transform ${methodOpen ? 'rotate-180' : ''}`}
              />

              {methodOpen && (
                <div className="absolute left-0 top-12 w-full rounded-xl bg-gray-950 border border-white/10 shadow-2xl overflow-hidden z-20">

                  {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(m => (
                    <button
                      key={m}
                      type="button"
                      onMouseDown={() => {
                        setMethod(m);
                        setMethodOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-white/5 ${m === method ? 'text-indigo-300 bg-white/5' : 'text-gray-200'
                        }`}
                    >
                      <span className="font-mono">{m}</span>
                      {m === method && <Check className="w-4 h-4 text-indigo-300" />}
                    </button>
                  ))}

                </div>
              )}
            </div>
          </div>


          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase flex items-center gap-2">
              <Hash className="w-4 h-4 text-indigo-400" />
              Status Code
            </label>
            <div className="rounded-xl bg-black/20 border border-white/10 px-4 h-12 flex items-center focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition">
              <input
                type="number"
                className="w-full bg-transparent outline-none text-sm text-white appearance-none no-spinner"
                value={status}
                onChange={e => setStatus(Number(e.target.value))}
                disabled={isCreating}
                min={100}
                max={599}
              />

            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Delay (ms)
            </label>
            <div className="rounded-xl bg-black/20 border border-white/10 px-4 h-12 flex items-center focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition">
              <input
                type="number"
                className="w-full bg-transparent outline-none text-sm text-white noppearance-none no-spinner"
                value={delay}
                onChange={e => setDelay(Number(e.target.value))}
                disabled={isCreating}
                min={0}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase flex items-center gap-2">
            <FileJson className="w-4 h-4 text-indigo-400" />
            JSON Response
          </label>
          <div className="rounded-2xl bg-black/30 border border-white/10 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition">
            <textarea
              className="w-full bg-transparent outline-none text-sm text-white p-4 font-mono resize-none h-60"
              value={response}
              onChange={e => setResponse(e.target.value)}
              disabled={isCreating}
            />
          </div>
        </div>

        <div
          className="relative group inline-flex items-center gap-3 rounded-xl bg-black/20 border border-white/10 px-4 py-3 cursor-pointer hover:bg-black/30 transition"
          onClick={() => !isCreating && setIsDynamic(v => !v)}
        >

          <div
            className={`w-5 h-5 rounded-md border flex items-center justify-center ${isDynamic ? 'border-indigo-500 bg-indigo-600/80' : 'border-gray-600 bg-black/40'
              }`}
          >
            {isDynamic && <Check className="w-3 h-3 text-white" />}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Database className="w-4 h-4 text-indigo-400" />
            <span>Enable CRUD dynamic mock</span>
          </div>

          {/* Tooltip */}
          <div className="absolute left-0 top-full mt-2 hidden group-hover:block w-64 p-3 rounded-lg bg-gray-900/90 text-gray-200 text-xs border border-white/10 shadow-xl backdrop-blur-lg z-20">
            <p className="text-sm font-inter">
              When enabled, this endpoint behaves like a dynamic mock.
              Supports GET, POST, PUT, DELETE, and PATCH automatically with in-memory data.
            </p>
          </div>
        </div>


        <button
          onClick={handleStartMocking}
          disabled={isCreating}
          className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 flex items-center justify-center gap-3 text-sm tracking-wide transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isCreating ? (
            <>
              <BouncingDotsLoader size="sm" color="text-white" />
              <span>Creating mock</span>
            </>
          ) : (
            'Start Mock Server'
          )}
        </button>

        {mockUrl && (
          <div className="rounded-2xl bg-black/30 border border-white/10 p-4 space-y-2">
            <div className="text-xs font-semibold text-gray-300 uppercase flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-indigo-400" />
              Your mock endpoint is live
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                readOnly
                value={mockUrl}
                className="flex-1 bg-transparent outline-none text-sm text-white/80"
              />
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(mockUrl)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-indigo-300"
              >
                <ClipboardCopy className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {curlCommand && (
          <div className="rounded-2xl bg-black/30 border border-white/10 p-4 space-y-2">
            <div className="text-xs font-semibold text-gray-300 uppercase">
              CURL Command
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                readOnly
                value={curlCommand}
                className="flex-1 bg-transparent outline-none text-xs text-white/80 font-mono"
              />
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(curlCommand)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-indigo-300"
              >
                <ClipboardCopy className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockForm;
