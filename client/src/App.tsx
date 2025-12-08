import { useState, useRef } from 'react'
import Sidebar from './components/Sidebar'
import Footer from './components/Footer'
import MockForm from './components/MockForm'
import MockList, { MockListRef } from './components/MockList'
import SidebarRequestLogs from './components/SidebarRequestLogs'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAuth } from './context/AuthContext'
import { LogOut } from 'lucide-react'
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


  return (
    <>
      <div className="min-h-screen flex bg-gray-950 text-white">
        <Sidebar activePage={activePage} setActivePage={handlePageChange} />

        <main className="flex-1 p-10 overflow-y-auto">

          <div className="mb-8 flex justify-end items-center gap-4">
            {!loading && (
              <>
                {user ? (
                  <>
                    <span className="text-sm text-gray-300 font-inter">
                      Signed in as {user.email || user.displayName || 'User'}
                    </span>
                    <button
                      onClick={logout}
                      className="px-4 py-2 rounded-lg bg-white/10 hover:bg-red-700 text-sm font-inter flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={loginWithGoogle}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-sm font-medium flex items-center gap-2"
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
            <div className="max-w-4xl mx-auto text-center mt-28">
              <h1 className="text-5xl font-bold mb-6 text-indigo-400 font-inter">
                Build, Test and Mock APIs Instantly
              </h1>

              <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-10 font-inter">
                MockFlow is a powerful tool that lets you create fully functional API endpoints
                within seconds. Speed up your frontend development by simulating backend responses
                with zero setup.
              </p>

              <div className="grid md:grid-cols-3 gap-6 text-left mt-12 font-inter">
                <div className="bg-white/5 p-6 rounded-xl ">
                  <div className="mb-4">
                    <Layers className="w-10 h-10 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-indigo-300 mb-2 ">Create Mocks Fast</h3>
                  <p className="text-gray-400">Define methods, paths, responses and simulate backend behavior instantly.</p>
                </div>

                <div className="bg-white/5 p-6 rounded-xl">
                  <div className="mb-4">
                    <Activity className="w-10 h-10 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-indigo-300 mb-2">Monitor Requests</h3>
                  <p className="text-gray-400">Track every request with timestamps, bodies, headers, and replay options.</p>
                </div>

                <div className="bg-white/5 p-6 rounded-xl">
                  <div className="mb-4">
                    <Settings2 className="w-10 h-10 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-indigo-300 mb-2">Dynamic and Static APIs</h3>
                  <p className="text-gray-400">Support for CRUD-ready dynamic APIs and simple static mocks.</p>
                </div>
              </div>
              <div className="mt-16 max-w-3xl mx-auto space-y-8 text-left">

  <h2 className="text-3xl font-bold text-indigo-300 text-center mb-6">
    How to Create a Mock API
  </h2>

  <div className="space-y-6">

    <div className="flex items-start gap-4 bg-white/5 p-5 rounded-xl border border-white/10">
      <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg font-bold">
        1
      </div>
      <div>
        <h3 className="text-lg font-semibold text-indigo-300">Choose an endpoint path</h3>
        <p className="text-gray-400 text-sm">
          Define your API route such as /mock/users or /api/data.
        </p>
      </div>
    </div>

    <div className="flex items-start gap-4 bg-white/5 p-5 rounded-xl border border-white/10">
      <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg font-bold">
        2
      </div>
      <div>
        <h3 className="text-lg font-semibold text-indigo-300">Select a method</h3>
        <p className="text-gray-400 text-sm">
          Pick GET, POST, PUT, PATCH, or DELETE depending on the API behavior.
        </p>
      </div>
    </div>

    <div className="flex items-start gap-4 bg-white/5 p-5 rounded-xl border border-white/10">
      <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg font-bold">
        3
      </div>
      <div>
        <h3 className="text-lg font-semibold text-indigo-300">Set the response</h3>
        <p className="text-gray-400 text-sm">
          Enter a JSON response, status code and optional delay.
        </p>
      </div>
    </div>

    <div className="flex items-start gap-4 bg-white/5 p-5 rounded-xl border border-white/10">
      <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg font-bold">
        4
      </div>
      <div>
        <h3 className="text-lg font-semibold text-indigo-300">Start the mock server</h3>
        <p className="text-gray-400 text-sm">
          Click the Start Mock Server button to generate your live API endpoint.
        </p>
      </div>
    </div>

    <div className="flex items-start gap-4 bg-white/5 p-5 rounded-xl border border-white/10">
      <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg font-bold">
        5
      </div>
      <div>
        <h3 className="text-lg font-semibold text-indigo-300">Use the generated endpoint</h3>
        <p className="text-gray-400 text-sm">
          Copy the URL or cURL command and call your mock API from any frontend app.
        </p>
      </div>
    </div>

  </div>

</div>


            </div>
          )}

          {activePage === 'create' && (
            <div className="max-w-5xl p-8 rounded-2xl shadow-xl font-inter mx-auto">
              <h1 className="text-4xl font-bold mb-6 text-indigo-400 mx-auto">Create a Mock API</h1>
              <p className="text-gray-300 mb-8">
                Configure your endpoint, choose a method, set a response, and start using your mock instantly.
              </p>
              <MockForm onMockCreated={handleMockCreated} />
            </div>
          )}

          {activePage === 'mocks' && (
            <div className="max-w-5xl mx-auto mt-14 font-inter">
              <h1 className="text-4xl font-bold mb-6 text-indigo-400">Your Mock Endpoints</h1>
              <MockList ref={mockListRef} />
            </div>
          )}

          {activePage === 'logs' && (
            <div className="max-w-5xl mx-auto mt-14 font-inter">
              <h1 className="text-4xl font-bold mb-6 text-indigo-400">Request Logs</h1>
              <SidebarRequestLogs />
            </div>
          )}

          {activePage === 'settings' && (
            <div className="max-w-4xl mx-auto p-8 rounded-2xl shadow-xl font-inter space-y-10">

              <h1 className="text-4xl font-bold mb-6 text-indigo-400">Settings</h1>

              <div className="bg-white/10 p-6 rounded-xl border border-white/10 space-y-4">
                <h2 className="text-xl font-semibold text-indigo-300">Account</h2>

                {user ? (
                  <div className="space-y-2">
                    <p className="text-gray-300">
                      <span className="font-medium">Email:</span> {user.email}
                    </p>
                    <p className="text-gray-300">
                      <span className="font-medium">UID:</span> {user.uid}
                    </p>

                    <button
                      onClick={logout}
                      className="mt-3 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={loginWithGoogle}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-sm font-medium flex items-center gap-2"
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

              <div className="bg-white/10 p-6 rounded-xl border border-white/10 space-y-4">
                <h2 className="text-xl font-semibold text-indigo-300">Security</h2>

                <p className="text-gray-300">
                  You signed in using Google OAuth. Password management is handled by Google.
                </p>

                <a
                  href="https://myaccount.google.com/security"
                  target="_blank"
                  className="text-indigo-400 underline text-sm"
                >
                  Manage Google Security Settings
                </a>
              </div>

              <div className="bg-red-600/10 p-6 rounded-xl border border-red-600/20 space-y-4">
                <h2 className="text-xl font-bold text-red-400">Danger Zone</h2>

                <p className="text-gray-300">
                  Deleting your account will remove all your mocks and logs. This action cannot be undone.
                </p>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm"
                >
                  Delete Account
                </button>
              </div>

            </div>
          )}

        </main>
      </div>

      <ConfirmModal
        {...({
          open: showDeleteModal,
          onClose: () => setShowDeleteModal(false),
          onConfirm: deleteAccount,
          title: "Delete Account",
          description: "Are you sure you want to delete your account? This action cannot be undone."
        } as any)}
      />

      <Footer />
      <ToastContainer position="bottom-right" autoClose={4000} hideProgressBar={false} />
    </>
  )
}

export default App
