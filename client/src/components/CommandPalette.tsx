import { useState, useEffect, useRef, useMemo } from 'react';
import {
    Search,
    Home,
    PlusCircle,
    List,
    ScrollText,
    Settings,
    Pencil,
    Download,
    ArrowRight,
    Command
} from 'lucide-react';

interface Mock {
    _id: string;
    path: string;
    method: string;
    status: number;
    response: any;
    delay: number;
    isDynamic?: boolean;
}

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (page: string) => void;
    onEditMock?: (mock: Mock) => void;
    mocks: Mock[];
}

interface PaletteItem {
    id: string;
    label: string;
    category: 'Pages' | 'Actions' | 'Mocks';
    icon: React.ReactNode;
    action: () => void;
    subtitle?: string;
    badge?: string;
}

const methodBadgeColor = (m: string) => {
    switch (m) {
        case 'GET': return 'bg-green-500/20 text-green-400';
        case 'POST': return 'bg-blue-500/20 text-blue-400';
        case 'PUT': return 'bg-yellow-500/20 text-yellow-400';
        case 'DELETE': return 'bg-red-500/20 text-red-400';
        default: return 'bg-purple-500/20 text-purple-400';
    }
};

const CommandPalette = ({ isOpen, onClose, onNavigate, onEditMock, mocks }: CommandPaletteProps) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    const allItems: PaletteItem[] = useMemo(() => {
        const pages: PaletteItem[] = [
            { id: 'page-home', label: 'Overview', category: 'Pages', icon: <Home className="w-4 h-4" />, action: () => { onNavigate('home'); onClose(); } },
            { id: 'page-create', label: 'Create Mock', category: 'Pages', icon: <PlusCircle className="w-4 h-4" />, action: () => { onNavigate('create'); onClose(); } },
            { id: 'page-mocks', label: 'Your Mocks', category: 'Pages', icon: <List className="w-4 h-4" />, action: () => { onNavigate('mocks'); onClose(); } },
            { id: 'page-logs', label: 'Request Logs', category: 'Pages', icon: <ScrollText className="w-4 h-4" />, action: () => { onNavigate('logs'); onClose(); } },
            { id: 'page-settings', label: 'Settings', category: 'Pages', icon: <Settings className="w-4 h-4" />, action: () => { onNavigate('settings'); onClose(); } },
        ];

        const actions: PaletteItem[] = [
            { id: 'action-new', label: 'New Mock', category: 'Actions', icon: <PlusCircle className="w-4 h-4 text-green-400" />, subtitle: 'Create a new mock endpoint', action: () => { onNavigate('create'); onClose(); } },
            { id: 'action-export', label: 'Export Mocks', category: 'Actions', icon: <Download className="w-4 h-4 text-indigo-400" />, subtitle: 'Download all mocks as JSON', action: () => { onNavigate('mocks'); onClose(); } },
        ];

        const mockItems: PaletteItem[] = mocks.map(mock => ({
            id: `mock-${mock._id}`,
            label: mock.path,
            category: 'Mocks' as const,
            icon: <Pencil className="w-4 h-4" />,
            badge: mock.method,
            subtitle: `Status ${mock.status} • ${mock.isDynamic ? 'Dynamic' : 'Static'}`,
            action: () => {
                if (onEditMock) onEditMock(mock);
                onClose();
            }
        }));

        return [...pages, ...actions, ...mockItems];
    }, [mocks, onNavigate, onEditMock, onClose]);

    const filtered = useMemo(() => {
        if (!query.trim()) return allItems;
        const q = query.toLowerCase();
        return allItems.filter(item =>
            item.label.toLowerCase().includes(q) ||
            item.subtitle?.toLowerCase().includes(q) ||
            item.badge?.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q)
        );
    }, [allItems, query]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && filtered[selectedIndex]) {
            e.preventDefault();
            filtered[selectedIndex].action();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    useEffect(() => {
        if (listRef.current) {
            const selected = listRef.current.querySelector('[data-selected="true"]');
            selected?.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedIndex]);

    if (!isOpen) return null;

    const grouped = filtered.reduce<Record<string, PaletteItem[]>>((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {});

    let flatIndex = -1;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <div
                className="relative w-full max-w-lg bg-[#0f1129] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-paletteIn"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                    <Search className="w-5 h-5 text-gray-400 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search mocks, pages, actions..."
                        className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-gray-500"
                    />
                    <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-gray-500 font-mono">
                        ESC
                    </kbd>
                </div>

                <div ref={listRef} className="max-h-[50vh] overflow-y-auto p-2">
                    {filtered.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm">
                            No results for "{query}"
                        </div>
                    ) : (
                        Object.entries(grouped).map(([category, items]) => (
                            <div key={category} className="mb-2">
                                <div className="px-2 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                                    {category}
                                </div>
                                {items.map(item => {
                                    flatIndex++;
                                    const isSelected = flatIndex === selectedIndex;
                                    const currentIndex = flatIndex;
                                    return (
                                        <button
                                            key={item.id}
                                            data-selected={isSelected}
                                            onClick={item.action}
                                            onMouseEnter={() => setSelectedIndex(currentIndex)}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${isSelected ? 'bg-indigo-600/20 text-white' : 'text-gray-300 hover:bg-white/5'
                                                }`}
                                        >
                                            <span className={`shrink-0 ${isSelected ? 'text-indigo-400' : 'text-gray-500'}`}>{item.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    {item.badge && (
                                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${methodBadgeColor(item.badge)}`}>
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                    <span className="text-sm truncate">{item.label}</span>
                                                </div>
                                                {item.subtitle && (
                                                    <span className="text-[11px] text-gray-500 truncate block">{item.subtitle}</span>
                                                )}
                                            </div>
                                            <ArrowRight className={`w-3.5 h-3.5 shrink-0 transition-opacity ${isSelected ? 'opacity-100 text-indigo-400' : 'opacity-0'}`} />
                                        </button>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </div>

                <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 text-[10px] text-gray-500">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 font-mono">↑↓</kbd> navigate</span>
                        <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 font-mono">↵</kbd> select</span>
                        <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 font-mono">esc</kbd> close</span>
                    </div>
                    <span className="flex items-center gap-1"><Command className="w-3 h-3" />K to open</span>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
