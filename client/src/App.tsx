import { useState, useRef } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MockForm from './components/MockForm';
import MockList, { MockListRef } from './components/MockList';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const mockListRef = useRef<MockListRef | null>(null);

  const handleMockCreated = () => {

    if (mockListRef.current) {
      mockListRef.current.fetchMocks();
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white ">
        <Navbar />
        <div className="flex-col items-center justify-between p-4 pt-24 animate-fadeIn">

        <main className="mt-10 flex flex-col items-center justify-center text-center w-full">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight text-white drop-shadow-xl font-raleway">
            Instant, Effortless API Mocking
          </h1>

          <p className="text-lg md:text-xl text-white max-w-2xl mb-12 font-inter">
            Stop waiting for backend development. Create, customize, and use mock API endpoints in seconds, right from your browser. No installs, no setup, just pure productivity.
          </p>

          <div className="w-full max-w-3xl mb-8 font-inter">
            <div className="flex bg-white/5 backdrop-blur-md rounded-xl p-1">
              <button
                onClick={() => setActiveTab('create')}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                  activeTab === 'create'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Create Mock
              </button>
              <button
                onClick={() => setActiveTab('list')}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                  activeTab === 'list'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Your Mocks
              </button>
            </div>
          </div>

         
          <div className="w-full max-w-3xl">
            {activeTab === 'create' ? (
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 shadow-xl">
                <MockForm onMockCreated={handleMockCreated} />
              </div>
            ) : (
              <MockList ref={mockListRef} />
            )}
          </div>

          <div className="mt-20 text-left max-w-6xl w-full font-grotesk">
            <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center text-indigo-400">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8 text-center font-poppins">
              <div className="bg-gradient-to-tr from-gray-800 to-gray-700/60 p-6 rounded-2xl shadow-md hover:scale-105 transform transition duration-300">
                <h3 className="text-xl font-semibold mb-3 text-indigo-400">1. Define Your Mock</h3>
                <p className="text-gray-300">Fill in the endpoint path, select the HTTP method, status code, and optional delay. Paste your desired JSON response.</p>
              </div>
              <div className="bg-gradient-to-tr from-gray-800 to-indigo-800/60 p-6 rounded-2xl shadow-md hover:scale-105 transform transition duration-300">
                <h3 className="text-xl font-semibold mb-3 text-indigo-400">2. Start the Server</h3>
                <p className="text-gray-300">Click "Start Mock Server." We instantly create a live, accessible endpoint based on your configuration.</p>
              </div>
              <div className="bg-gradient-to-tr from-gray-800 to-purple-800/60 p-6 rounded-2xl shadow-md hover:scale-105 transform transition duration-300">
                <h3 className="text-xl font-semibold mb-3 text-indigo-400">3. Integrate and Test</h3>
                <p className="text-gray-300">Copy the provided URL or CURL command and use it in your frontend application for testing and development.</p>
              </div>
            </div>
          </div>
        </main>
        </div>

        <Footer />
      </div>

      <ToastContainer position="bottom-right" autoClose={4000} hideProgressBar={false} />
    </>
  );
}

export default App;
