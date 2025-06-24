const Navbar = () => {
  return (
    <nav className="pt-10 top-5 left-0 right-0 z-10">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center  rounded-xl ">
      
        <div className="flex items-center">
          <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h1 className="text-xl font-semibold text-white ml-2">MockFlow</h1>
        </div>

      
        <a
          href="https://github.com/SaurabhShisode"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-300 hover:text-white flex items-center gap-2"
        >
        
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12 0C5.37 0 0 5.373 0 12a12 12 0 008.207 11.387c.6.111.793-.261.793-.58v-2.234c-3.338.725-4.033-1.416-4.033-1.416-.547-1.39-1.333-1.76-1.333-1.76-1.09-.744.083-.729.083-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.836 2.808 1.306 3.493.998.108-.775.418-1.305.762-1.605-2.665-.306-5.466-1.335-5.466-5.932 0-1.31.469-2.381 1.236-3.22-.124-.304-.536-1.527.117-3.176 0 0 1.008-.322 3.3 1.23a11.51 11.51 0 013.003-.404c1.02.005 2.047.138 3.003.404 2.292-1.552 3.297-1.23 3.297-1.23.655 1.65.243 2.873.12 3.176.77.839 1.235 1.91 1.235 3.22 0 4.61-2.804 5.623-5.475 5.922.43.372.823 1.102.823 2.222v3.293c0 .322.19.695.8.578A12.001 12.001 0 0024 12c0-6.627-5.373-12-12-12z"
              clipRule="evenodd"
            />
          </svg>
          GitHub
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
