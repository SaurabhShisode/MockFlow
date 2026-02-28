import { useState, useRef, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Footer from './components/Footer'
import MockForm from './components/MockForm'
import MockList, { MockListRef } from './components/MockList'
import SidebarRequestLogs from './components/SidebarRequestLogs'
import PreferencesSection from './components/PreferencesSection'
import CommandPalette from './components/CommandPalette'
import MockTemplates from './components/MockTemplates'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAuth } from './context/AuthContext'
import { useTheme } from './context/ThemeContext'
import { LogOut, Sparkles, BarChart3, Zap, Sun, Moon, AlertTriangle } from 'lucide-react'
import { Layers, Activity, Settings2 } from 'lucide-react'
import ConfirmModal from './components/ConfirmModal'

type Page = 'home' | 'create' | 'mocks' | 'logs' | 'settings'

function App() {
  const [activePage, setActivePage] = useState<Page>('home')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const mockListRef = useRef<MockListRef | null>(null)

  const { user, loginWithGoogle, logout, loading, token } = useAuth()

  const handleMockCreated = () => {
    mockListRef.current?.fetchMocks()
  }

  const handlePageChange = async (page: Page) => {
    if (page !== 'create') setEditingMock(null)
    const protectedPages: Page[] = ['create', 'mocks', 'logs', 'settings']
    if (!user && protectedPages.includes(page)) {
      await loginWithGoogle()
      return
    }
    setActivePage(page)
  }

  const deleteAccount = async () => {
    if (!token) {
      toast.error('Not authenticated')
      return
    }
    try {
      const res = await fetch('https://mockflow-backend.onrender.com/user/delete', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to delete account')
        return
      }

      toast.success('Account deleted')
      await logout()
      setShowDeleteModal(false)
      setActivePage('home')
    } catch (err) {
      toast.error('Error deleting account')
    }
  }


  const [pageKey, setPageKey] = useState(0)
  const [overviewStats, setOverviewStats] = useState<{ mocks: number; requests: number } | null>(null)
  const [editingMock, setEditingMock] = useState<any>(null)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [allMocks, setAllMocks] = useState<any[]>([])
  const [templateData, setTemplateData] = useState<any>(null)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setPaletteOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    setPageKey(prev => prev + 1)
  }, [activePage])

  useEffect(() => {
    if (!user || !token) { setOverviewStats(null); return }
    const fetchStats = async () => {
      try {
        const mocksRes = await fetch('https://mockflow-backend.onrender.com/mocks', { headers: { Authorization: `Bearer ${token}` } })
        const mocksData = mocksRes.ok ? await mocksRes.json() : []
        const totalRequests = Array.isArray(mocksData) ? mocksData.reduce((sum: number, m: any) => sum + (m.accessCount || 0), 0) : 0
        setOverviewStats({ mocks: Array.isArray(mocksData) ? mocksData.length : 0, requests: totalRequests })
        if (Array.isArray(mocksData)) setAllMocks(mocksData)
      } catch {
        setOverviewStats(null)
      }
    }
    fetchStats()
  }, [user, token])

  return (
    <>
      <div className="min-h-screen flex bg-gray-950 text-white">
        <Sidebar activePage={activePage} setActivePage={handlePageChange} onOpenPalette={() => setPaletteOpen(true)} />

        <main className="flex-1 flex flex-col p-7 md:p-10 overflow-y-auto">

          <div className="mb-8 flex justify-end items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-3">
                    {user.photoURL && (
                      <img
                        src={user.photoURL}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full ring-2 ring-indigo-500/50"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <span className="text-xs md:text-sm text-gray-300 font-inter hidden md:inline">
                      {user.displayName || user.email || 'User'}
                    </span>
                    <button
                      onClick={logout}
                      className="cursor-pointer px-3 py-2 rounded-lg bg-white/10 hover:bg-red-600/80 text-xs md:text-sm font-inter flex items-center gap-2 transition-colors"
                    >
                      <LogOut size={16} />
                      <span className="hidden md:inline">Sign out</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={loginWithGoogle}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-sm font-medium flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <img
                      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                      alt="Google"
                      className="h-5 w-5"
                    />
                    Sign in with Google
                  </button>
                )}
              </>
            )}
          </div>

          {activePage === 'home' && (
            <div key={pageKey} className="max-w-6xl mx-auto text-center mt-10 md:mt-28 flex-1">
              <h1 className="text-3xl md:text-5xl font-bold mb-2 md:mb-6 text-indigo-400 font-inter animate-fadeUp-1">
                Build, Test and Mock APIs Instantly
              </h1>

              <p className="text-gray-300 text-sm md:text-lg max-w-2xl mx-auto mb-6 font-inter animate-fadeUp-2">
                MockFlow is a powerful tool that lets you create fully functional API endpoints
                within seconds. Speed up your frontend development by simulating backend responses
                with zero setup.
              </p>

              <div className="animate-fadeUp-2">
                <button
                  onClick={() => handlePageChange('create')}
                  className="glow-btn cursor-pointer inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm md:text-base transition-colors"
                >
                  <Sparkles className="w-5 h-5" />
                  Create Your First Mock
                </button>
              </div>

              {user && overviewStats && (
                <div className="flex justify-center gap-4 mt-6 animate-fadeUp-2">
                  <div className="glass-card flex items-center gap-2 px-4 py-2 rounded-full">
                    <BarChart3 className="w-4 h-4 text-indigo-400" />
                    <span className="text-indigo-300 font-bold text-sm">{overviewStats.mocks}</span>
                    <span className="text-gray-400 text-xs">mocks</span>
                  </div>
                  <div className="glass-card flex items-center gap-2 px-4 py-2 rounded-full">
                    <Zap className="w-4 h-4 text-indigo-400" />
                    <span className="text-indigo-300 font-bold text-sm">{overviewStats.requests}</span>
                    <span className="text-gray-400 text-xs">total requests</span>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-6 text-left mt-14 font-inter animate-fadeUp-3">
                <div className="glass-card p-6 rounded-xl">
                  <div className="mb-4 w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="md:text-xl font-semibold text-indigo-300 mb-2">Create Mocks Fast</h3>
                  <p className="text-gray-400 text-sm">Define methods, paths, responses and simulate backend behavior instantly.</p>
                </div>

                <div className="glass-card p-6 rounded-xl">
                  <div className="mb-4 w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="md:text-xl font-semibold text-indigo-300 mb-2">Monitor Requests</h3>
                  <p className="text-gray-400 text-sm">Track every request with timestamps, bodies, headers, and replay options.</p>
                </div>

                <div className="glass-card p-6 rounded-xl">
                  <div className="mb-4 w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                    <Settings2 className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="md:text-xl font-semibold text-indigo-300 mb-2">Dynamic and Static APIs</h3>
                  <p className="text-gray-400 text-sm">Support for CRUD-ready dynamic APIs and simple static mocks.</p>
                </div>
              </div>

              <div className="mt-16 max-w-4xl mx-auto space-y-8 text-left animate-fadeUp-4">
                <h2 className="text-xl md:text-3xl font-bold text-indigo-300 text-center mb-6">
                  How to Create a Mock API
                </h2>

                <div className="space-y-6">
                  {[
                    { step: 1, title: 'Choose an endpoint path', desc: 'Define your API route such as /mock/users or /api/data.' },
                    { step: 2, title: 'Select a method', desc: 'Pick GET, POST, PUT, PATCH, or DELETE depending on the API behavior.' },
                    { step: 3, title: 'Set the response', desc: 'Enter a JSON response, status code and optional delay.' },
                    { step: 4, title: 'Start the mock server', desc: 'Click the Create Mock button to generate your live API endpoint.' },
                    { step: 5, title: 'Use the generated endpoint', desc: 'Copy the URL or cURL command and call your mock API from any frontend app.' },
                  ].map(item => (
                    <div key={item.step} className="glass-card flex items-start gap-4 p-5 rounded-xl">
                      <div className="w-10 h-10 min-w-[2.5rem] rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg font-bold">
                        {item.step}
                      </div>
                      <div>
                        <h3 className="md:text-lg font-semibold text-indigo-300">{item.title}</h3>
                        <p className="text-gray-400 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>


            </div>
          )}

          {activePage === 'create' && (
            <div key={pageKey} className="max-w-6xl md:p-8 rounded-2xl shadow-xl font-inter mx-auto animate-pageEnter flex-1">
              <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-6 text-indigo-400 mx-auto">
                {editingMock ? 'Edit Mock' : 'Create a Mock API'}
              </h1>
              <p className="text-gray-300 mb-8 text-sm">
                {editingMock
                  ? 'Update your mock endpoint configuration below.'
                  : 'Configure your endpoint, choose a method, set a response, and start using your mock instantly.'
                }
              </p>
              {!editingMock && (
                <MockTemplates onApplyTemplate={(data) => {
                  setTemplateData(data)
                }} />
              )}
              <MockForm
                onMockCreated={handleMockCreated}
                editingMock={editingMock}
                onCancelEdit={() => { setEditingMock(null); handlePageChange('mocks'); }}
                templateData={templateData}
              />
            </div>
          )}

          {activePage === 'mocks' && (
            <div key={pageKey} className="w-full max-w-6xl mx-auto mt-14 font-inter animate-pageEnter flex-1">
              <h1 className="text-2xl md:text-4xl font-bold md:mb-6 text-indigo-400">Your Mock Endpoints</h1>
              <MockList ref={mockListRef} onEditMock={(mock) => { setEditingMock(mock); handlePageChange('create'); }} />
            </div>
          )}

          {activePage === 'logs' && (
            <div key={pageKey} className="w-full max-w-6xl mx-auto mt-14 font-inter animate-pageEnter flex-1">
              <h1 className="text-2xl md:text-4xl font-bold mb-6 text-indigo-400">Request Logs</h1>
              <SidebarRequestLogs />
            </div>
          )}

          {activePage === 'settings' && (
            <div key={pageKey} className="max-w-6xl mx-auto p-4 md:p-8 rounded-2xl shadow-xl font-inter space-y-10 animate-pageEnter flex-1">

              <h1 className="text-2xl md:text-4xl font-bold mb-6 text-indigo-400">
                Settings
              </h1>

              <div className="bg-white/10 p-4 md:p-6 rounded-xl border border-white/10 space-y-4">
                <h2 className="text-lg md:text-xl font-semibold text-indigo-300">
                  Account
                </h2>

                {user ? (
                  <div className="flex items-center gap-4">
                    {user.photoURL && (
                      <img
                        src={user.photoURL}
                        alt="Avatar"
                        className="w-12 h-12 rounded-full ring-2 ring-indigo-500/50"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="space-y-1">
                      <p className="text-white text-sm md:text-base font-medium">
                        {user.displayName || 'User'}
                      </p>
                      <p className="text-gray-400 text-xs md:text-sm">
                        {user.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={loginWithGoogle}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-sm font-medium flex items-center justify-center gap-2 cursor-pointer w-full md:w-fit"
                  >
                    <img
                      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                      alt="Google"
                      className="h-5 w-5"
                    />
                    Sign in with Google
                  </button>
                )}
              </div>

              <PreferencesSection />

              <div className="bg-white/10 p-4 md:p-6 rounded-xl border border-white/10 space-y-4">
                <h2 className="text-lg md:text-xl font-semibold text-indigo-300">
                  Security
                </h2>

                <p className="text-gray-300 text-sm md:text-base">
                  You signed in using Google OAuth. Password management is handled by Google.
                </p>

                <a
                  href="https://myaccount.google.com/security"
                  target="_blank"
                  className="text-indigo-400 underline text-sm break-all"
                >
                  Manage Google Security Settings
                </a>
              </div>

              <div className="bg-red-600/10 p-4 md:p-6 rounded-xl border-2 border-red-600/30 space-y-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <h2 className="text-lg md:text-xl font-bold text-red-400">
                    Danger Zone
                  </h2>
                </div>

                <p className="text-gray-300 text-sm md:text-base">
                  Deleting your account will permanently remove all your mocks, request logs, and data. This action is <strong className="text-red-400">irreversible</strong>.
                </p>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-semibold cursor-pointer w-full md:w-fit transition-colors"
                >
                  Delete Account
                </button>
              </div>

            </div>
          )}


          <Footer />
        </main>
      </div>

      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onNavigate={(page) => handlePageChange(page as Page)}
        onEditMock={(mock) => { setEditingMock(mock); handlePageChange('create'); }}
        mocks={allMocks}
      />

      <ConfirmModal
        {...({
          open: showDeleteModal,
          onClose: () => setShowDeleteModal(false),
          onConfirm: deleteAccount,
          title: "Delete Account",
          description: "Are you sure you want to delete your account? This action cannot be undone."
        } as any)}
      />

      <ToastContainer position="bottom-right" autoClose={4000} hideProgressBar={false} />
    </>
  )
}

export default App
