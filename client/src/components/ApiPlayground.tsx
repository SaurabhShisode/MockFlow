import { useState } from 'react';
import { Send, Clock, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

interface ApiPlaygroundProps {
    mockUrl: string;
    method: string;
}

const ApiPlayground = ({ mockUrl, method }: ApiPlaygroundProps) => {
    const [expanded, setExpanded] = useState(true);
    const [reqBody, setReqBody] = useState('');
    const [headers, setHeaders] = useState<{ key: string; value: string }[]>([
        { key: 'Content-Type', value: 'application/json' }
    ]);
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<{
        status: number;
        statusText: string;
        body: string;
        time: number;
        headers: Record<string, string>;
    } | null>(null);
    const [history, setHistory] = useState<Array<{
        status: number;
        time: number;
        timestamp: string;
    }>>([]);

    const sendRequest = async () => {
        if (!mockUrl) return;
        setLoading(true);
        const start = performance.now();

        try {
            const fetchHeaders: Record<string, string> = {};
            headers.forEach(h => {
                if (h.key.trim()) fetchHeaders[h.key.trim()] = h.value;
            });

            const opts: RequestInit = {
                method,
                headers: fetchHeaders,
            };

            if (['POST', 'PUT', 'PATCH'].includes(method) && reqBody.trim()) {
                opts.body = reqBody;
            }

            const res = await fetch(mockUrl, opts);
            const elapsed = Math.round(performance.now() - start);
            const text = await res.text();

            let formattedBody = text;
            try {
                formattedBody = JSON.stringify(JSON.parse(text), null, 2);
            } catch { }

            const resHeaders: Record<string, string> = {};
            res.headers.forEach((v, k) => { resHeaders[k] = v; });

            const result = {
                status: res.status,
                statusText: res.statusText,
                body: formattedBody,
                time: elapsed,
                headers: resHeaders,
            };

            setResponse(result);
            setHistory(prev => [
                { status: res.status, time: elapsed, timestamp: new Date().toLocaleTimeString() },
                ...prev.slice(0, 4)
            ]);
        } catch (err: any) {
            setResponse({
                status: 0,
                statusText: 'Network Error',
                body: err.message || 'Failed to connect',
                time: Math.round(performance.now() - start),
                headers: {},
            });
        } finally {
            setLoading(false);
        }
    };

    const addHeader = () => setHeaders(prev => [...prev, { key: '', value: '' }]);
    const removeHeader = (idx: number) => setHeaders(prev => prev.filter((_, i) => i !== idx));
    const updateHeader = (idx: number, field: 'key' | 'value', val: string) => {
        setHeaders(prev => prev.map((h, i) => i === idx ? { ...h, [field]: val } : h));
    };

    const statusColor = (s: number) => {
        if (s >= 200 && s < 300) return 'bg-green-500/20 text-green-400 border-green-500/30';
        if (s >= 400 && s < 500) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        return 'bg-red-500/20 text-red-400 border-red-500/30';
    };

    if (!mockUrl) return null;

    return (
        <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/5 transition cursor-pointer"
            >
                <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-semibold text-indigo-300">API Playground</span>
                    <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">Test your mock live</span>
                </div>
                {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>

            {expanded && (
                <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
                    <div className="flex items-center gap-2 bg-black/20 rounded-xl px-4 py-2.5 border border-white/10">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${method === 'GET' ? 'bg-green-500/20 text-green-400' :
                                method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                                    method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' :
                                        method === 'DELETE' ? 'bg-red-500/20 text-red-400' :
                                            'bg-purple-500/20 text-purple-400'
                            }`}>{method}</span>
                        <span className="text-sm text-gray-300 font-mono flex-1 truncate">{mockUrl}</span>
                        <button
                            onClick={sendRequest}
                            disabled={loading}
                            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                            Send
                        </button>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Headers</span>
                            <button onClick={addHeader} className="text-[10px] text-indigo-400 hover:text-indigo-300 cursor-pointer">+ Add</button>
                        </div>
                        {headers.map((h, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                                <input
                                    value={h.key}
                                    onChange={e => updateHeader(idx, 'key', e.target.value)}
                                    placeholder="Key"
                                    className="flex-1 px-3 py-1.5 bg-black/20 border border-white/10 rounded-lg text-xs text-white outline-none focus:border-indigo-500 font-mono"
                                />
                                <input
                                    value={h.value}
                                    onChange={e => updateHeader(idx, 'value', e.target.value)}
                                    placeholder="Value"
                                    className="flex-1 px-3 py-1.5 bg-black/20 border border-white/10 rounded-lg text-xs text-white outline-none focus:border-indigo-500 font-mono"
                                />
                                <button onClick={() => removeHeader(idx)} className="text-gray-600 hover:text-red-400 text-xs cursor-pointer">✕</button>
                            </div>
                        ))}
                    </div>

                    {['POST', 'PUT', 'PATCH'].includes(method) && (
                        <div className="space-y-2">
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Request Body</span>
                            <textarea
                                value={reqBody}
                                onChange={e => setReqBody(e.target.value)}
                                placeholder='{"key": "value"}'
                                rows={3}
                                className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-xl text-xs text-white font-mono outline-none focus:border-indigo-500 resize-y"
                            />
                        </div>
                    )}

                    {response && (
                        <div className="space-y-3 pt-2 border-t border-white/5">
                            <div className="flex items-center gap-3">
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${statusColor(response.status)}`}>
                                    {response.status} {response.statusText}
                                </span>
                                <span className="flex items-center gap-1 text-[10px] text-gray-500">
                                    <Clock size={10} />
                                    {response.time}ms
                                </span>
                            </div>
                            <pre className="bg-black/30 rounded-xl p-4 text-xs text-gray-300 font-mono overflow-auto max-h-60 border border-white/5">
                                {response.body}
                            </pre>
                        </div>
                    )}

                    {history.length > 0 && (
                        <div className="pt-2 border-t border-white/5">
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2 block">History</span>
                            <div className="flex gap-2 flex-wrap">
                                {history.map((h, i) => (
                                    <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px]">
                                        <span className={`w-1.5 h-1.5 rounded-full ${h.status >= 200 && h.status < 300 ? 'bg-green-400' : h.status >= 400 ? 'bg-yellow-400' : 'bg-red-400'}`} />
                                        <span className="text-gray-400">{h.status}</span>
                                        <span className="text-gray-600">{h.time}ms</span>
                                        <span className="text-gray-600">{h.timestamp}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ApiPlayground;
