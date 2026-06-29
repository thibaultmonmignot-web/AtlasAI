import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Menu, X, Coins, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const { currentUser, logout, isAuthenticated, isAdminUser } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    ...(isAuthenticated ? [
      { path: '/canvas', label: 'Canvas' },
      { path: '/shop', label: 'Shop' },
      { path: '/dashboard', label: 'Dashboard' },
    ] : []),
  ];

  return (
    <header className="border-b-2 border-border bg-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary"></div>
            <span className="text-2xl font-bold text-foreground tracking-tight">PixelWar</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? 'text-primary border-b-2 border-primary pb-1'
                    : 'text-foreground/70 hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && isAdminUser() && (
              <Link
                to="/admin"
                className={`text-sm font-bold flex items-center gap-1 transition-all duration-200 ${
                  isActive('/admin')
                    ? 'text-primary border-b-2 border-primary pb-1'
                    : 'text-foreground hover:text-primary'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                Admin
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary border border-border">
                  <Coins className="w-4 h-4 text-foreground" />
                  <span className="text-sm font-bold text-foreground">
                    {currentUser?.pixels || 0}
                  </span>
                </div>
                <Button
                  onClick={logout}
                  variant="outline"
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200">
                  Login
                </Button>
              </Link>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t-2 border-border">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-medium transition-all duration-200 ${
                    isActive(link.path) ? 'text-primary' : 'text-foreground/70'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && isAdminUser() && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-bold flex items-center gap-1 transition-all duration-200 ${
                    isActive('/admin') ? 'text-primary' : 'text-foreground'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  Admin Dashboard
                </Link>
              )}
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary border border-border w-fit">
                    <Coins className="w-4 h-4 text-foreground" />
                    <span className="text-sm font-bold text-foreground">
                      {currentUser?.pixels || 0}
                    </span>
                  </div>
                  <Button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    variant="outline"
                    className="border-2 border-primary text-primary w-fit"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="bg-primary text-primary-foreground w-fit">
                    Login
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
