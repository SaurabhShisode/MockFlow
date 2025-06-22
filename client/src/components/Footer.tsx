import InstagramIcon from '../assets/instagram.svg';
import LinkedInIcon from '../assets/linkedin.svg';
import TwitterIcon from '../assets/twitter.svg';

const Footer = () => {
  return (
    <footer className="w-full py-8 mt-16 border-t border-white/10">
      <div className="container mx-auto flex flex-col items-center text-center text-white space-y-4">
        <p>&copy; {new Date().getFullYear()} MockFlow. Built for the modern developer.</p>

        <div className="flex space-x-5">
          <a
            href="https://www.instagram.com/saurabh_shisode_?igsh=MWZ3cHRwNmM0NTJxNA=="
            aria-label="Instagram"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-400 transition"
          >
            <img src={InstagramIcon} alt="Instagram" className="w-6 h-6 filter brightness-0 invert" />
          </a>
          <a
            href="https://www.linkedin.com/in/saurabh-shisode-686476248/"
            aria-label="LinkedIn"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-400 transition"
          >
            <img src={LinkedInIcon} alt="LinkedIn" className="w-6 h-6 filter brightness-0 invert" />
          </a>
          <a
            href="https://x.com/NotSaurabh_?t=9cnJ8PnEbgz4XIixYymSeA&s=09"
            aria-label="Twitter"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-400 transition"
          >
            <img src={TwitterIcon} alt="Twitter" className="w-6 h-6 filter brightness-0 invert" />
          </a>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;
