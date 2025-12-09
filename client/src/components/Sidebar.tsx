import { Home, PlusCircle, Boxes, List, Settings, Menu,  } from 'lucide-react';
import { JSX, useState } from 'react';

type Page = 'home' | 'create' | 'mocks' | 'logs' | 'settings';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

function Sidebar({ activePage, setActivePage }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const menu: { id: Page; label: string; icon: JSX.Element }[] = [
    { id: 'home', label: 'Overview', icon: <Home size={18} /> },
    { id: 'create', label: 'Create Mock', icon: <PlusCircle size={18} /> },
    { id: 'mocks', label: 'Your Mocks', icon: <Boxes size={18} /> },
    { id: 'logs', label: 'Request Logs', icon: <List size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> }
  ];

  return (
    <>
      <button
        onClick={() => setMobileOpen(prev => !prev)}
        className="md:hidden fixed top-7 left-4 z-50 text-white bg-gray-800 p-2 rounded-lg"
      >
        <Menu size={22} />
      </button>

      <aside className="w-64 min-h-screen bg-gray-900 border-r border-gray-800  flex-col p-6 pt-14 font-inter hidden md:flex">
        <div className="flex items-center mb-10">
          <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 9l3 3-3 3m5 0h3M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h1 className="text-xl font-semibold text-white ml-2 font-grotesk">MockFlow</h1>
        </div>

        <h2 className="text-lg font-bold text-indigo-400 mb-6">Dashboard</h2>

        <nav className="space-y-2 flex-1">
          {menu.map(item => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all duration-200 active:scale-95 cursor-pointer ${
                activePage === item.id
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-indigo-300">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <a
          href="https://github.com/SaurabhShisode"
          target="_blank"
          className="mt-10 flex items-center gap-2 text-gray-400 hover:text-white"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd"
              d="M12 0C5.37 0 0 5.373 0 12a12 12 0 008.207 11.387c.6.111.793-.261.793-.58v-2.234c-3.338.725-4.033-1.416-4.033-1.416-.547-1.39-1.333-1.76-1.333-1.76-1.09-.744.083-.729.083-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.836 2.808 1.306 3.493.998.108-.775.418-1.305.762-1.605-2.665-.306-5.466-1.335-5.466-5.932 0-1.31.469-2.381 1.236-3.22-.124-.304-.536-1.527.117-3.176 0 0 1.008-.322 3.3 1.23a11.51 11.51 0 013.003-.404c1.02.005 2.047.138 3.003.404 2.292-1.552 3.297-1.23 3.297-1.23.655 1.65.243 2.873.12 3.176.77.839 1.235 1.91 1.235 3.22 0 4.61-2.804 5.623-5.475 5.922.43.372.823 1.102.823 2.222v3.293c0 .322.19.695.8.578A12.001 12.001 0 0024 12c0-6.627-5.373-12-12-12z"
            />
          </svg>
          GitHub
        </a>
      </aside>

      {mobileOpen && (
  <div className="fixed inset-0 z-40 md:hidden transition-opacity duration-300 ease-out">
    <div
      className="absolute inset-0 bg-black/60 animate-fadeIn"
      onClick={() => setMobileOpen(false)}
    />

    <aside
      className="
        relative w-60 min-h-screen bg-gray-900 border-r border-gray-800 flex flex-col p-6 pt-24 font-inter z-50
        transform transition-transform duration-300 ease-in-out
        translate-x-0
        animate-slideIn
      "
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 9l3 3-3 3m5 0h3M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h1 className="text-xl font-semibold text-white ml-2 font-grotesk">MockFlow</h1>
        </div>

      </div>

      <h2 className="text-base font-bold text-indigo-400 mb-4">Dashboard</h2>

      <nav className="space-y-2 flex-1">
        {menu.map(item => (
          <button
            key={item.id}
            onClick={() => {
              setActivePage(item.id);
              setMobileOpen(false);
            }}
            className={`w-full text-sm text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all duration-200 active:scale-95 ${
              activePage === item.id
                ? 'bg-indigo-600 text-white shadow'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span className="text-indigo-300">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <a
        href="https://github.com/SaurabhShisode"
        target="_blank"
        className="mt-10 flex items-center gap-2 text-gray-400 hover:text-white"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" clipRule="evenodd"
            d="M12 0C5.37 0 0 5.373 0 12a12 12 0 008.207 11.387c.6.111.793-.261.793-.58v-2.234c-3.338.725-4.033-1.416-4.033-1.416-.547-1.39-1.333-1.76-1.333-1.76-1.09-.744.083-.729.083-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.836 2.808 1.306 3.493.998.108-.775.418-1.305.762-1.605-2.665-.306-5.466-1.335-5.466-5.932 0-1.31.469-2.381 1.236-3.22-.124-.304-.536-1.527.117-3.176 0 0 1.008-.322 3.3 1.23a11.51 11.51 0 013.003-.404c1.02.005 2.047.138 3.003.404 2.292-1.552 3.297-1.23 3.297-1.23.655 1.65.243 2.873.12 3.176.77.839 1.235 1.91 1.235 3.22 0 4.61-2.804 5.623-5.475 5.922.43.372.823 1.102.823 2.222v3.293c0 .322.19.695.8.578A12.001 12.001 0 0024 12c0-6.627-5.373-12-12-12z"
          />
        </svg>
        GitHub
      </a>
    </aside>
  </div>
)}

    </>
  );
}

export default Sidebar;
