import { useState, useEffect, SetStateAction } from 'react';

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

      <div
        className="flex items-center justify-between cursor-pointer group"
        onClick={() => toggle(setShowToasts, 'pref_showToasts', showToasts)}
      >
        <p className="text-gray-300 group-hover:text-white transition-colors">Show toast notifications</p>
        <div
          className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${showToasts ? 'bg-indigo-600' : 'bg-gray-600'}`}
        >
          <div
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${showToasts ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </div>
      </div>

      <div
        className="flex items-center justify-between cursor-pointer group"
        onClick={() => toggle(setAutoRefresh, 'pref_autoRefresh', autoRefresh)}
      >
        <p className="text-gray-300 group-hover:text-white transition-colors">Enable auto refresh for logs</p>
        <div
          className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${autoRefresh ? 'bg-indigo-600' : 'bg-gray-600'}`}
        >
          <div
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${autoRefresh ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </div>
      </div>
    </div>
  );
};

export default PreferencesSection;
