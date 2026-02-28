import { Rocket, Users, ShieldCheck, ShoppingCart, MessageSquare, ListChecks } from 'lucide-react';

interface TemplateData {
    path: string;
    method: string;
    status: number;
    response: string;
    delay: number;
    isDynamic: boolean;
}

interface Template {
    id: string;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    method: string;
    data: TemplateData;
}

const TEMPLATES: Template[] = [
    {
        id: 'users-crud',
        title: 'Users CRUD',
        subtitle: 'Full REST API for user management',
        icon: <Users className="w-5 h-5" />,
        method: 'POST',
        data: {
            path: '/mock/users',
            method: 'POST',
            status: 200,
            response: JSON.stringify([
                { id: 1, name: "John Doe", email: "john@example.com", role: "admin" },
                { id: 2, name: "Jane Smith", email: "jane@example.com", role: "user" }
            ], null, 2),
            delay: 0,
            isDynamic: true,
        }
    },
    {
        id: 'auth-login',
        title: 'Auth Login',
        subtitle: 'Login endpoint with JWT token',
        icon: <ShieldCheck className="w-5 h-5" />,
        method: 'POST',
        data: {
            path: '/mock/auth/login',
            method: 'POST',
            status: 200,
            response: JSON.stringify({
                token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                user: { id: 1, name: "John Doe", email: "john@example.com" },
                expiresIn: "24h"
            }, null, 2),
            delay: 300,
            isDynamic: false,
        }
    },
    {
        id: 'products',
        title: 'Products',
        subtitle: 'E-commerce product listing',
        icon: <ShoppingCart className="w-5 h-5" />,
        method: 'GET',
        data: {
            path: '/mock/products',
            method: 'GET',
            status: 200,
            response: JSON.stringify([
                { id: 1, name: "Wireless Headphones", price: 59.99, category: "Electronics", inStock: true },
                { id: 2, name: "Running Shoes", price: 89.99, category: "Sports", inStock: true },
                { id: 3, name: "Coffee Maker", price: 129.99, category: "Home", inStock: false }
            ], null, 2),
            delay: 0,
            isDynamic: true,
        }
    },
    {
        id: 'comments',
        title: 'Comments',
        subtitle: 'Nested comment thread API',
        icon: <MessageSquare className="w-5 h-5" />,
        method: 'GET',
        data: {
            path: '/mock/comments',
            method: 'GET',
            status: 200,
            response: JSON.stringify([
                { id: 1, author: "Alice", text: "Great article!", createdAt: "2025-01-15T10:30:00Z", likes: 5 },
                { id: 2, author: "Bob", text: "Thanks for sharing", createdAt: "2025-01-15T11:00:00Z", likes: 2 }
            ], null, 2),
            delay: 0,
            isDynamic: true,
        }
    },
    {
        id: 'todos',
        title: 'Todos',
        subtitle: 'Task management API',
        icon: <ListChecks className="w-5 h-5" />,
        method: 'GET',
        data: {
            path: '/mock/todos',
            method: 'GET',
            status: 200,
            response: JSON.stringify([
                { id: 1, title: "Buy groceries", completed: false, priority: "high" },
                { id: 2, title: "Write tests", completed: true, priority: "medium" },
                { id: 3, title: "Deploy app", completed: false, priority: "high" }
            ], null, 2),
            delay: 0,
            isDynamic: true,
        }
    },
];

const methodBadgeColor = (m: string) => {
    switch (m) {
        case 'GET': return 'bg-green-500/20 text-green-400';
        case 'POST': return 'bg-blue-500/20 text-blue-400';
        default: return 'bg-purple-500/20 text-purple-400';
    }
};

interface MockTemplatesProps {
    onApplyTemplate: (data: TemplateData) => void;
}

const MockTemplates = ({ onApplyTemplate }: MockTemplatesProps) => {
    return (
        <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
                <Rocket className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-gray-300">Quick Start Templates</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {TEMPLATES.map(template => (
                    <button
                        key={template.id}
                        onClick={() => onApplyTemplate(template.data)}
                        className="group glass-card p-4 rounded-xl text-left hover:border-indigo-500/30 transition-all cursor-pointer"
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400 shrink-0 group-hover:bg-indigo-500/25 transition">
                                {template.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-sm font-semibold text-white truncate">{template.title}</span>
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${methodBadgeColor(template.method)}`}>
                                        {template.method}
                                    </span>
                                </div>
                                <p className="text-[11px] text-gray-500 leading-tight">{template.subtitle}</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MockTemplates;
