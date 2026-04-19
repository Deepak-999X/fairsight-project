/**
 * FairSight AI — Navbar Component
 * Fixed top navigation bar (64px) with logo and navigation links.
 */

import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Shield, 
  Upload, 
  Settings, 
  BarChart3, 
  Menu,
  X 
} from "lucide-react";
import { useState } from "react";

const navLinks = [
  { to: "/", label: "Upload", icon: Upload },
  { to: "/configure", label: "Configure", icon: Settings },
  { to: "/results", label: "Results", icon: BarChart3 },
];

export function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 backdrop-blur-lg border-b border-gray-200">
      <div className="h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-gradient-to-br from-brand-blue to-accent-purple rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-brand-dark leading-none">
              FairSight
              <span className="text-brand-blue ml-0.5">AI</span>
            </h1>
            <p className="text-[10px] text-text-secondary leading-none mt-0.5">
              Bias Auditing Platform
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "text-brand-blue bg-brand-light"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-gray"
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand-blue rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-accent-purple bg-accent-purple-light px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-accent-purple rounded-full animate-pulse" />
            Powered by Gemini AI
          </span>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-surface-gray transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-text-primary" />
            ) : (
              <Menu className="w-5 h-5 text-text-primary" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-white border-b border-gray-200 shadow-lg"
        >
          <nav className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-brand-blue bg-brand-light"
                      : "text-text-secondary hover:bg-surface-gray"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </motion.div>
      )}
    </header>
  );
}
