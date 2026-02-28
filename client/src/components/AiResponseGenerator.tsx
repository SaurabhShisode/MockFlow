import { useState } from 'react';
import { Sparkles, X, Sliders, Zap } from 'lucide-react';

interface AiResponseGeneratorProps {
    onInsert: (json: string) => void;
}

const FIRST_NAMES = ['James', 'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'Lucas', 'Mia', 'Alexander', 'Charlotte', 'Benjamin', 'Amelia', 'Daniel', 'Harper', 'Henry', 'Evelyn'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
const DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'protonmail.com'];
const CITIES = ['New York', 'London', 'Tokyo', 'Paris', 'Berlin', 'Sydney', 'Toronto', 'Mumbai', 'Dubai', 'Singapore', 'Los Angeles', 'Chicago', 'San Francisco', 'Seattle', 'Austin'];
const COLORS = ['Red', 'Blue', 'Green', 'Black', 'White', 'Silver', 'Gold', 'Navy', 'Teal', 'Coral'];
const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys', 'Health', 'Automotive', 'Food', 'Art'];
const ADJECTIVES = ['Premium', 'Classic', 'Ultra', 'Pro', 'Elite', 'Slim', 'Smart', 'Eco', 'Max', 'Lite'];
const PRODUCT_NOUNS = ['Headphones', 'Watch', 'Laptop', 'Camera', 'Speaker', 'Keyboard', 'Mouse', 'Monitor', 'Tablet', 'Phone'];
const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const COMMENT_TEXT = [
    'This is really great, love it!',
    'Could be better, but overall decent.',
    'Amazing quality, highly recommend.',
    'Not what I expected, returning it.',
    'Five stars, will buy again!',
    'Fast shipping and great packaging.',
    'Works perfectly for my needs.',
    'Good value for the price.',
    'The best purchase I made this year.',
    'Exceeded my expectations!'
];
const BLOG_TITLES = [
    'Getting Started with React',
    '10 Tips for Better CSS',
    'Understanding REST APIs',
    'The Future of Web Development',
    'Building Scalable Applications',
    'DevOps Best Practices',
    'Introduction to TypeScript',
    'State Management Patterns',
    'Performance Optimization Guide',
    'Testing Strategies for Modern Apps'
];

const rand = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randDate = () => {
    const d = new Date(Date.now() - randInt(0, 365 * 24 * 60 * 60 * 1000));
    return d.toISOString();
};
const uuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
});

type PresetKey = 'users' | 'products' | 'orders' | 'comments' | 'posts';

const PRESETS: { key: PresetKey; label: string; icon: string; desc: string }[] = [
    { key: 'users', label: 'Users', icon: '👤', desc: 'Name, email, avatar, location' },
    { key: 'products', label: 'Products', icon: '📦', desc: 'Title, price, category, stock' },
    { key: 'orders', label: 'Orders', icon: '🛒', desc: 'Items, total, status, address' },
    { key: 'comments', label: 'Comments', icon: '💬', desc: 'Author, text, rating, date' },
    { key: 'posts', label: 'Blog Posts', icon: '📝', desc: 'Title, body, tags, author' },
];

const generateItem = (type: PresetKey) => {
    const first = rand(FIRST_NAMES);
    const last = rand(LAST_NAMES);

    switch (type) {
        case 'users':
            return {
                id: uuid(),
                firstName: first,
                lastName: last,
                email: `${first.toLowerCase()}.${last.toLowerCase()}@${rand(DOMAINS)}`,
                avatar: `https://i.pravatar.cc/150?u=${first}${last}`,
                age: randInt(18, 65),
                city: rand(CITIES),
                role: rand(['admin', 'user', 'editor', 'viewer']),
                isActive: Math.random() > 0.3,
                createdAt: randDate(),
            };
        case 'products':
            return {
                id: uuid(),
                name: `${rand(ADJECTIVES)} ${rand(PRODUCT_NOUNS)}`,
                price: parseFloat((Math.random() * 500 + 9.99).toFixed(2)),
                currency: 'USD',
                category: rand(CATEGORIES),
                color: rand(COLORS),
                inStock: randInt(0, 500),
                rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
                image: `https://picsum.photos/seed/${randInt(1, 1000)}/200`,
                createdAt: randDate(),
            };
        case 'orders':
            return {
                id: uuid(),
                customer: `${first} ${last}`,
                email: `${first.toLowerCase()}@${rand(DOMAINS)}`,
                items: randInt(1, 5),
                total: parseFloat((Math.random() * 800 + 15).toFixed(2)),
                currency: 'USD',
                status: rand(STATUSES),
                shippingCity: rand(CITIES),
                createdAt: randDate(),
            };
        case 'comments':
            return {
                id: uuid(),
                author: `${first} ${last}`,
                avatar: `https://i.pravatar.cc/40?u=${first}`,
                text: rand(COMMENT_TEXT),
                rating: randInt(1, 5),
                likes: randInt(0, 200),
                createdAt: randDate(),
            };
        case 'posts':
            return {
                id: uuid(),
                title: rand(BLOG_TITLES),
                excerpt: `A comprehensive guide on ${rand(BLOG_TITLES).toLowerCase()} and best practices for developers.`,
                author: `${first} ${last}`,
                tags: [rand(CATEGORIES), rand(CATEGORIES)].filter((v, i, a) => a.indexOf(v) === i),
                readTime: `${randInt(3, 15)} min`,
                likes: randInt(10, 5000),
                publishedAt: randDate(),
            };
    }
};

const AiResponseGenerator = ({ onInsert }: AiResponseGeneratorProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState<PresetKey>('users');
    const [count, setCount] = useState(5);
    const [preview, setPreview] = useState('');

    const generate = () => {
        const items = Array.from({ length: count }, () => generateItem(selectedPreset));
        const json = JSON.stringify(items, null, 2);
        setPreview(json);
    };

    const handleInsert = () => {
        if (preview) {
            onInsert(preview);
            setIsOpen(false);
            setPreview('');
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/20 text-purple-300 hover:from-purple-600/30 hover:to-indigo-600/30 text-[11px] font-medium transition cursor-pointer"
            >
                <Sparkles size={12} />
                Generate with AI
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
                    <div className="relative bg-[#0f1129] rounded-2xl border border-white/10 w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl animate-paletteIn">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-purple-400" />
                                <h2 className="text-lg font-bold text-white">AI Response Generator</h2>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white cursor-pointer"><X size={18} /></button>
                        </div>

                        <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(85vh-130px)]">
                            <div>
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-3 block">Choose Data Type</span>
                                <div className="grid grid-cols-5 gap-2">
                                    {PRESETS.map(p => (
                                        <button
                                            key={p.key}
                                            onClick={() => { setSelectedPreset(p.key); setPreview(''); }}
                                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition cursor-pointer ${selectedPreset === p.key
                                                    ? 'bg-indigo-600/20 border-indigo-500/40 text-white'
                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                                }`}
                                        >
                                            <span className="text-xl">{p.icon}</span>
                                            <span className="text-xs font-medium">{p.label}</span>
                                            <span className="text-[9px] text-gray-500 leading-tight text-center">{p.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold flex items-center gap-1">
                                        <Sliders size={10} />
                                        Count
                                    </span>
                                    <span className="text-sm font-mono text-indigo-300 font-bold">{count}</span>
                                </div>
                                <input
                                    type="range"
                                    min={1}
                                    max={50}
                                    value={count}
                                    onChange={e => { setCount(Number(e.target.value)); setPreview(''); }}
                                    className="w-full accent-indigo-500 cursor-pointer"
                                />
                                <div className="flex justify-between text-[9px] text-gray-600 mt-1">
                                    <span>1</span><span>25</span><span>50</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={generate}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
                            >
                                <Zap size={16} />
                                Generate {count} {PRESETS.find(p => p.key === selectedPreset)?.label}
                            </button>

                            {preview && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Preview</span>
                                        <span className="text-[10px] text-gray-600">{(preview.length / 1024).toFixed(1)} KB</span>
                                    </div>
                                    <pre className="bg-black/30 rounded-xl p-4 text-xs text-gray-300 font-mono overflow-auto max-h-48 border border-white/5">
                                        {preview.slice(0, 2000)}{preview.length > 2000 ? '\n...' : ''}
                                    </pre>
                                    <button
                                        type="button"
                                        onClick={handleInsert}
                                        className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
                                    >
                                        Insert into Response Editor
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AiResponseGenerator;
