import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { Plus, X, Pencil, Trash2, Check, FolderOpen } from 'lucide-react';

interface Collection {
    _id: string;
    name: string;
    description: string;
    color: string;
    createdAt: string;
}

const PRESET_COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
    '#f59e0b', '#22c55e', '#06b6d4', '#3b82f6',
];

interface CollectionManagerProps {
    activeCollection: string | null;
    onSelectCollection: (id: string | null) => void;
}

const CollectionManager = ({ activeCollection, onSelectCollection }: CollectionManagerProps) => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [inputName, setInputName] = useState('');
    const [inputColor, setInputColor] = useState('#6366f1');
    const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { token } = useAuth();

    const fetchCollections = async () => {
        if (!token) return;
        try {
            const res = await fetch('https://mockflow-backend.onrender.com/collections', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCollections(data);
            }
        } catch {
            // silent fail
        }
    };

    useEffect(() => {
        fetchCollections();
    }, [token]);

    useEffect(() => {
        if ((isCreating || editingId) && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isCreating, editingId]);

    const createCollection = async () => {
        if (!inputName.trim() || !token) return;
        try {
            const res = await fetch('https://mockflow-backend.onrender.com/collections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ name: inputName.trim(), color: inputColor })
            });
            if (res.ok) {
                setInputName('');
                setInputColor('#6366f1');
                setIsCreating(false);
                fetchCollections();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to create');
            }
        } catch {
            toast.error('Network error');
        }
    };

    const updateCollection = async (id: string) => {
        if (!inputName.trim() || !token) return;
        try {
            const res = await fetch(`https://mockflow-backend.onrender.com/collections/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ name: inputName.trim(), color: inputColor })
            });
            if (res.ok) {
                setEditingId(null);
                setInputName('');
                fetchCollections();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to update');
            }
        } catch {
            toast.error('Network error');
        }
    };

    const deleteCollection = async (id: string) => {
        if (!token) return;
        try {
            const res = await fetch(`https://mockflow-backend.onrender.com/collections/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                if (activeCollection === id) onSelectCollection(null);
                fetchCollections();
            }
        } catch {
            toast.error('Failed to delete');
        }
    };

    const startEdit = (c: Collection) => {
        setEditingId(c._id);
        setInputName(c.name);
        setInputColor(c.color);
        setIsCreating(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (editingId) updateCollection(editingId);
            else createCollection();
        } else if (e.key === 'Escape') {
            setIsCreating(false);
            setEditingId(null);
            setInputName('');
        }
    };

    return (
        <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
                <FolderOpen className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Collections</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {/* All filter */}
                <button
                    onClick={() => onSelectCollection(null)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${activeCollection === null
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                        }`}
                >
                    All
                </button>

                {/* Collection pills */}
                {collections.map(c => (
                    <div key={c._id} className="group relative flex items-center">
                        {editingId === c._id ? (
                            <div className="flex items-center gap-1.5">
                                <div
                                    className="w-3 h-3 rounded-full shrink-0 cursor-pointer relative"
                                    style={{ backgroundColor: inputColor }}
                                    onClick={() => setShowColorPicker(showColorPicker === c._id ? null : c._id)}
                                />
                                {showColorPicker === c._id && (
                                    <div className="absolute top-8 left-0 z-10 flex gap-1 bg-gray-900 border border-white/10 p-2 rounded-lg">
                                        {PRESET_COLORS.map(color => (
                                            <button
                                                key={color}
                                                className="w-5 h-5 rounded-full cursor-pointer ring-2 ring-transparent hover:ring-white/30"
                                                style={{ backgroundColor: color }}
                                                onClick={() => { setInputColor(color); setShowColorPicker(null); }}
                                            />
                                        ))}
                                    </div>
                                )}
                                <input
                                    ref={inputRef}
                                    value={inputName}
                                    onChange={e => setInputName(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="bg-transparent border border-white/20 rounded px-2 py-0.5 text-xs text-white outline-none w-24 focus:border-indigo-500"
                                />
                                <button onClick={() => updateCollection(c._id)} className="text-green-400 hover:text-green-300 cursor-pointer"><Check size={14} /></button>
                                <button onClick={() => { setEditingId(null); setInputName(''); }} className="text-gray-500 hover:text-gray-300 cursor-pointer"><X size={14} /></button>
                            </div>
                        ) : (
                            <button
                                onClick={() => onSelectCollection(activeCollection === c._id ? null : c._id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${activeCollection === c._id
                                        ? 'text-white border-white/20'
                                        : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                                    }`}
                                style={activeCollection === c._id ? { backgroundColor: c.color + '33', borderColor: c.color + '66' } : {}}
                            >
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                                {c.name}
                            </button>
                        )}

                        {/* hover actions */}
                        {editingId !== c._id && (
                            <div className="hidden group-hover:flex items-center gap-0.5 ml-1">
                                <button onClick={() => startEdit(c)} className="text-gray-500 hover:text-white cursor-pointer p-0.5"><Pencil size={11} /></button>
                                <button onClick={() => deleteCollection(c._id)} className="text-gray-500 hover:text-red-400 cursor-pointer p-0.5"><Trash2 size={11} /></button>
                            </div>
                        )}
                    </div>
                ))}

                {/* Create new */}
                {isCreating ? (
                    <div className="flex items-center gap-1.5">
                        <div
                            className="w-3 h-3 rounded-full shrink-0 cursor-pointer relative"
                            style={{ backgroundColor: inputColor }}
                            onClick={() => setShowColorPicker(showColorPicker === '__new__' ? null : '__new__')}
                        />
                        {showColorPicker === '__new__' && (
                            <div className="absolute top-8 z-10 flex gap-1 bg-gray-900 border border-white/10 p-2 rounded-lg">
                                {PRESET_COLORS.map(color => (
                                    <button
                                        key={color}
                                        className="w-5 h-5 rounded-full cursor-pointer ring-2 ring-transparent hover:ring-white/30"
                                        style={{ backgroundColor: color }}
                                        onClick={() => { setInputColor(color); setShowColorPicker(null); }}
                                    />
                                ))}
                            </div>
                        )}
                        <input
                            ref={inputRef}
                            value={inputName}
                            onChange={e => setInputName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Collection name..."
                            className="bg-transparent border border-white/20 rounded px-2 py-0.5 text-xs text-white placeholder:text-gray-600 outline-none w-28 focus:border-indigo-500"
                        />
                        <button onClick={createCollection} className="text-green-400 hover:text-green-300 cursor-pointer"><Check size={14} /></button>
                        <button onClick={() => { setIsCreating(false); setInputName(''); }} className="text-gray-500 hover:text-gray-300 cursor-pointer"><X size={14} /></button>
                    </div>
                ) : (
                    <button
                        onClick={() => { setIsCreating(true); setEditingId(null); setInputName(''); }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs text-gray-500 border border-dashed border-white/10 hover:text-white hover:border-white/20 transition cursor-pointer"
                    >
                        <Plus size={12} />
                        New
                    </button>
                )}
            </div>
        </div>
    );
};

export default CollectionManager;
export type { Collection };
