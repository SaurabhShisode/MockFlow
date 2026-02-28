import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface Field {
    id: string;
    name: string;
    type: 'string' | 'number' | 'boolean' | 'null' | 'array' | 'object';
    value: string;
}

interface SchemaBuilderProps {
    onJsonChange: (json: string) => void;
    initialJson?: string;
}

let fieldCounter = 0;

const createField = (): Field => ({
    id: `field-${++fieldCounter}`,
    name: '',
    type: 'string',
    value: '',
});

const TYPE_OPTIONS = [
    { value: 'string', label: 'String' },
    { value: 'number', label: 'Number' },
    { value: 'boolean', label: 'Boolean' },
    { value: 'null', label: 'Null' },
    { value: 'array', label: 'Array (JSON)' },
    { value: 'object', label: 'Object (JSON)' },
] as const;

const buildJson = (fields: Field[]): string => {
    const obj: Record<string, any> = {};
    for (const field of fields) {
        if (!field.name.trim()) continue;
        switch (field.type) {
            case 'string':
                obj[field.name] = field.value;
                break;
            case 'number':
                obj[field.name] = Number(field.value) || 0;
                break;
            case 'boolean':
                obj[field.name] = field.value === 'true';
                break;
            case 'null':
                obj[field.name] = null;
                break;
            case 'array':
            case 'object':
                try {
                    obj[field.name] = JSON.parse(field.value);
                } catch {
                    obj[field.name] = field.type === 'array' ? [] : {};
                }
                break;
        }
    }
    return JSON.stringify(obj, null, 2);
};

const parseJsonToFields = (json: string): Field[] => {
    try {
        const parsed = JSON.parse(json);
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return [createField()];
        return Object.entries(parsed).map(([key, val]) => {
            const field = createField();
            field.name = key;
            if (val === null) {
                field.type = 'null';
                field.value = '';
            } else if (typeof val === 'string') {
                field.type = 'string';
                field.value = val;
            } else if (typeof val === 'number') {
                field.type = 'number';
                field.value = String(val);
            } else if (typeof val === 'boolean') {
                field.type = 'boolean';
                field.value = String(val);
            } else if (Array.isArray(val)) {
                field.type = 'array';
                field.value = JSON.stringify(val, null, 2);
            } else {
                field.type = 'object';
                field.value = JSON.stringify(val, null, 2);
            }
            return field;
        });
    } catch {
        return [createField()];
    }
};

const SchemaBuilder = ({ onJsonChange, initialJson }: SchemaBuilderProps) => {
    const [fields, setFields] = useState<Field[]>(() =>
        initialJson ? parseJsonToFields(initialJson) : [createField()]
    );

    useEffect(() => {
        const json = buildJson(fields);
        onJsonChange(json);
    }, [fields]);

    const updateField = (id: string, updates: Partial<Field>) => {
        setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const removeField = (id: string) => {
        setFields(prev => prev.length <= 1 ? prev : prev.filter(f => f.id !== id));
    };

    const addField = () => {
        setFields(prev => [...prev, createField()]);
    };

    return (
        <div className="space-y-2">
            <div className="grid grid-cols-[1fr_120px_1fr_32px] gap-2 px-1 mb-1">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Field Name</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Type</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Value</span>
                <span />
            </div>

            {fields.map(field => (
                <div key={field.id} className="grid grid-cols-[1fr_120px_1fr_32px] gap-2 items-start animate-fadeIn">
                    <input
                        type="text"
                        value={field.name}
                        onChange={e => updateField(field.id, { name: e.target.value })}
                        placeholder="key"
                        className="px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 outline-none focus:border-indigo-500 transition font-mono"
                    />

                    <select
                        value={field.type}
                        onChange={e => updateField(field.id, { type: e.target.value as Field['type'], value: '' })}
                        className="px-2 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white outline-none focus:border-indigo-500 transition cursor-pointer"
                    >
                        {TYPE_OPTIONS.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>

                    {field.type === 'boolean' ? (
                        <select
                            value={field.value || 'false'}
                            onChange={e => updateField(field.id, { value: e.target.value })}
                            className="px-2 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white outline-none focus:border-indigo-500 transition cursor-pointer"
                        >
                            <option value="true">true</option>
                            <option value="false">false</option>
                        </select>
                    ) : field.type === 'null' ? (
                        <div className="px-3 py-2 bg-black/10 border border-white/5 rounded-lg text-sm text-gray-500 italic">null</div>
                    ) : field.type === 'array' || field.type === 'object' ? (
                        <textarea
                            value={field.value}
                            onChange={e => updateField(field.id, { value: e.target.value })}
                            placeholder={field.type === 'array' ? '["item1", "item2"]' : '{"nested": "value"}'}
                            rows={2}
                            className="px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 outline-none focus:border-indigo-500 transition font-mono resize-y"
                        />
                    ) : (
                        <input
                            type={field.type === 'number' ? 'number' : 'text'}
                            value={field.value}
                            onChange={e => updateField(field.id, { value: e.target.value })}
                            placeholder={field.type === 'number' ? '0' : 'value'}
                            className="px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 outline-none focus:border-indigo-500 transition font-mono"
                        />
                    )}

                    <button
                        onClick={() => removeField(field.id)}
                        className="p-2 rounded-lg bg-white/5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                        title="Remove field"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            ))}

            <button
                onClick={addField}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-white/15 text-xs text-gray-400 hover:text-white hover:border-white/25 transition cursor-pointer w-fit"
            >
                <Plus size={14} />
                Add Field
            </button>
        </div>
    );
};

export default SchemaBuilder;
