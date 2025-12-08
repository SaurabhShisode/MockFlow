import { useState, useEffect, SetStateAction } from 'react';
import { Check } from 'lucide-react';

const PreferencesSection = () => {
  const [showToasts, setShowToasts] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    const storedToasts = localStorage.getItem('pref_showToasts');
    const storedRefresh = localStorage.getItem('pref_autoRefresh');

    if (storedToasts !== null) setShowToasts(storedToasts === 'true');
    if (storedRefresh !== null) setAutoRefresh(storedRefresh === 'true');
  }, []);

  const toggle = (setter: { (value: SetStateAction<boolean>): void; (value: SetStateAction<boolean>): void; (arg0: boolean): void; }, key: string, value: boolean) => {
    setter(!value);
    localStorage.setItem(key, (!value).toString());
  };

  return (
    <div className="bg-white/10 p-6 rounded-xl border border-white/10 space-y-6">
      <h2 className="text-xl font-semibold text-indigo-300">Preferences</h2>

      {/* Toast Notifications */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => toggle(setShowToasts, 'pref_showToasts', showToasts)}
      >
        <p className="text-gray-300">Show toast notifications</p>
        <div
          className={`w-6 h-6 flex items-center justify-center rounded-md border
            ${showToasts ? 'border-indigo-500 bg-indigo-600/80' : 'border-gray-600 bg-black/40'}
          `}
        >
          {showToasts && <Check className="w-4 h-4 text-white" />}
        </div>
      </div>

      {/* Auto-refresh logs */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => toggle(setAutoRefresh, 'pref_autoRefresh', autoRefresh)}
      >
        <p className="text-gray-300">Enable auto refresh for logs</p>
        <div
          className={`w-6 h-6 flex items-center justify-center rounded-md border
            ${autoRefresh ? 'border-indigo-500 bg-indigo-600/80' : 'border-gray-600 bg-black/40'}
          `}
        >
          {autoRefresh && <Check className="w-4 h-4 text-white" />}
        </div>
      </div>
    </div>
  );
};

export default PreferencesSection;
