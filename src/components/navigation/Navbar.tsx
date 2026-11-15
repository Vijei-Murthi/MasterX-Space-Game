import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import MasterXLogo from '../ui/MasterXLogo';

interface NavbarProps {
  onOpenHowToPlay?: () => void;
  onOpenNewMission?: () => void;
  onOpenContinue?: () => void;
  onOpenGuide?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenContinue,
  onOpenGuide,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', isRoute: true },
    { name: 'New Mission', path: '/briefing', isRoute: true },
    { name: 'Continue', path: '/continue', onClick: onOpenContinue },
    { name: 'Mission Guide', path: '/guide', onClick: onOpenGuide },
  ];

  return (
    <header className="relative z-30 w-full px-6 sm:px-12 lg:px-16 pt-7 sm:pt-8 pb-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo - MasterX Unified Emblem */}
        <div className="flex items-center select-none">
          <MasterXLogo withLink size="md" />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 lg:space-x-10 text-sm font-medium">
          {navItems.map((item) => {
            const isHome = item.path === '/';
            const isActive = isHome ? location.pathname === '/' : location.pathname === item.path;

            if (item.onClick) {
              return (
                <button
                  key={item.name}
                  onClick={item.onClick}
                  className="relative py-1 text-slate-300 hover:text-white transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:text-sky-400"
                >
                  {item.name}
                </button>
              );
            }

            return (
              <Link
                key={item.name}
                to={item.path}
                className="relative py-1 text-slate-200 hover:text-white transition-colors duration-150 outline-none"
              >
                <span>{item.name}</span>
                {/* Active Underline for Home / Current page */}
                {isActive && (
                  <span
                    className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-sky-500 rounded-full"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-slate-300 hover:text-white p-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 p-4 bg-[#080e1c]/95 backdrop-blur-md border border-slate-800 rounded-lg shadow-xl text-left animate-in fade-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-3">
            {navItems.map((item) => {
              const isHome = item.path === '/';
              const isActive = isHome ? location.pathname === '/' : location.pathname === item.path;

              if (item.onClick) {
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      item.onClick?.();
                    }}
                    className="text-left py-2 px-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded transition-colors"
                  >
                    {item.name}
                  </button>
                );
              }

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-2 px-3 rounded flex items-center justify-between transition-colors ${
                    isActive
                      ? 'text-white bg-sky-950/40 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <span>{item.name}</span>
                  {isActive && <span className="w-1.5 h-1.5 bg-sky-400 rounded-full" />}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
