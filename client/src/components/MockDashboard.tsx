import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { BarChart3, Zap, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

interface Mock {
    _id: string;
    path: string;
    method: string;
    status: number;
    accessCount: number;
    delay: number;
    createdAt: string;
    lastAccessed: string;
}

interface LogEntry {
    method: string;
    path: string;
    statusCode: number;
    timestamp: string;
}

const AnimatedCounter = ({ target, duration = 1200 }: { target: number; duration?: number }) => {
    const [count, setCount] = useState(0);
    const ref = useRef<number | null>(null);

    useEffect(() => {
        if (target === 0) { setCount(0); return; }
        const start = performance.now();
        const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) ref.current = requestAnimationFrame(animate);
        };
        ref.current = requestAnimationFrame(animate);
        return () => { if (ref.current) cancelAnimationFrame(ref.current); };
    }, [target, duration]);

    return <span>{count.toLocaleString()}</span>;
};

const METHOD_COLORS: Record<string, string> = {
    GET: '#22c55e',
    POST: '#3b82f6',
    PUT: '#eab308',
    DELETE: '#ef4444',
    PATCH: '#a855f7',
};

const MockDashboard = () => {
    const { token } = useAuth();
    const [mocks, setMocks] = useState<Mock[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const [mocksRes, logsRes] = await Promise.all([
                    fetch('https://mockflow-backend.onrender.com/mocks', { headers: { Authorization: `Bearer ${token}` } }),
                    fetch('https://mockflow-backend.onrender.com/logs/paginated?page=1&limit=50', { headers: { Authorization: `Bearer ${token}` } }),
                ]);
                if (mocksRes.ok) setMocks(await mocksRes.json());
                if (logsRes.ok) {
                    const logsData = await logsRes.json();
                    setLogs(logsData.logs || []);
                }
            } catch { }
            setLoading(false);
        };
        fetchData();
    }, [token]);

    if (loading) {
        return (
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 rounded-xl bg-white/5 border border-white/10" />
                ))}
            </div>
        );
    }

    if (mocks.length === 0) return null;

    const totalRequests = mocks.reduce((sum, m) => sum + (m.accessCount || 0), 0);
    const avgDelay = mocks.length > 0 ? Math.round(mocks.reduce((sum, m) => sum + (m.delay || 0), 0) / mocks.length) : 0;
    const errorLogs = logs.filter(l => l.statusCode >= 400).length;
    const errorRate = logs.length > 0 ? Math.round((errorLogs / logs.length) * 100) : 0;

    const methodCounts: Record<string, number> = {};
    mocks.forEach(m => { methodCounts[m.method] = (methodCounts[m.method] || 0) + 1; });

    const topEndpoints = [...mocks]
        .sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0))
        .slice(0, 5);

    const barData = {
        labels: topEndpoints.map(m => m.path.length > 20 ? m.path.slice(0, 20) + '…' : m.path),
        datasets: [{
            label: 'Requests',
            data: topEndpoints.map(m => m.accessCount || 0),
            backgroundColor: topEndpoints.map(m => METHOD_COLORS[m.method] || '#6366f1'),
            borderRadius: 6,
            borderSkipped: false as const,
        }],
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 10, family: 'monospace' } } },
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b7280', font: { size: 10 } } },
        },
    };

    const doughnutData = {
        labels: Object.keys(methodCounts),
        datasets: [{
            data: Object.values(methodCounts),
            backgroundColor: Object.keys(methodCounts).map(m => METHOD_COLORS[m] || '#6366f1'),
            borderWidth: 0,
            hoverOffset: 8,
        }],
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: { color: '#9ca3af', font: { size: 11 }, padding: 12, usePointStyle: true, pointStyleWidth: 8 },
            },
        },
    };

    const recentLogs = logs.slice(0, 8);

    const statCards = [
        { label: 'Total Mocks', value: mocks.length, icon: BarChart3, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        { label: 'Total Requests', value: totalRequests, icon: Zap, color: 'text-green-400', bg: 'bg-green-500/10' },
        { label: 'Avg Delay', value: avgDelay, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', suffix: 'ms' },
        { label: 'Error Rate', value: errorRate, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', suffix: '%' },
    ];

    return (
        <div className="mt-12 space-y-6 animate-fadeUp-3">
            <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">Mock Analytics</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map(card => (
                    <div key={card.label} className="glass-card p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                                <card.icon className={`w-4 h-4 ${card.color}`} />
                            </div>
                        </div>
                        <div className={`text-2xl font-bold ${card.color}`}>
                            <AnimatedCounter target={card.value} />
                            {card.suffix && <span className="text-sm ml-0.5">{card.suffix}</span>}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{card.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2 glass-card p-5 rounded-xl">
                    <h3 className="text-sm font-semibold text-gray-300 mb-4">Request Volume by Endpoint</h3>
                    <div className="h-52">
                        <Bar data={barData} options={barOptions} />
                    </div>
                </div>

                <div className="glass-card p-5 rounded-xl">
                    <h3 className="text-sm font-semibold text-gray-300 mb-4">Method Distribution</h3>
                    <div className="h-52">
                        <Doughnut data={doughnutData} options={doughnutOptions} />
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="glass-card p-5 rounded-xl">
                    <h3 className="text-sm font-semibold text-gray-300 mb-3">Top Endpoints</h3>
                    <div className="space-y-2">
                        {topEndpoints.map((m, i) => (
                            <div key={m._id} className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0">
                                <span className="w-5 h-5 rounded-full bg-white/5 text-[10px] font-bold text-gray-500 flex items-center justify-center">{i + 1}</span>
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${m.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                                        m.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                                            m.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-red-500/20 text-red-400'
                                    }`}>{m.method}</span>
                                <span className="text-xs text-gray-300 font-mono flex-1 truncate">{m.path}</span>
                                <span className="text-xs text-indigo-400 font-bold">{(m.accessCount || 0).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card p-5 rounded-xl">
                    <h3 className="text-sm font-semibold text-gray-300 mb-3">Recent Activity</h3>
                    <div className="space-y-2">
                        {recentLogs.length === 0 ? (
                            <p className="text-xs text-gray-600 py-4 text-center">No request logs yet</p>
                        ) : (
                            recentLogs.map((log, i) => (
                                <div key={i} className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0">
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${log.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                                            log.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                                                log.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-red-500/20 text-red-400'
                                        }`}>{log.method}</span>
                                    <span className="text-xs text-gray-300 font-mono flex-1 truncate">{log.path}</span>
                                    <span className={`text-[10px] font-medium ${log.statusCode >= 400 ? 'text-red-400' : 'text-green-400'}`}>{log.statusCode}</span>
                                    <span className="text-[10px] text-gray-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MockDashboard;
