import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';

const LoginPage = () => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    setLoading(true);
    loginWithGoogle()
      .then(() => {
        toast.success('Welcome to PixelWar');
        navigate('/canvas');
      })
      .catch((error) => {
        console.error('Login failed:', error);
        // Ensure error toast displays if it's not the custom admin error from context
        if (error.message !== 'NOT_ADMIN') {
          toast.error('Authentication failed. Please try again.');
        }
        setLoading(false);
      });
  };

  return (
    <>
      <Helmet>
        <title>Login - PixelWar</title>
        <meta name="description" content="Sign in to PixelWar to place your pixels on the collaborative canvas." />
      </Helmet>

      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 selection:bg-white selection:text-black">
        
        <div className="w-full max-w-lg flex flex-col items-center gap-16">
          <img 
            src="https://horizons-cdn.hostinger.com/698f1550-4ba2-4e9a-97e2-cd3b67e93a6a/52dcded46e392f8430a521cc84724738.png" 
            alt="PixelWar" 
            className="w-[300px] sm:w-[400px] h-auto object-contain select-none pointer-events-none"
            draggable="false"
          />

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full max-w-sm bg-white text-black font-bold uppercase tracking-[0.2em] text-sm sm:text-base px-8 py-5 border-none outline-none hover:bg-gray-200 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:pointer-events-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3 animate-pulse">
                <div className="w-2 h-2 bg-black"></div>
                CONNECTING
                <div className="w-2 h-2 bg-black"></div>
              </span>
            ) : (
              'Sign in with Google'
            )}
          </button>
        </div>

      </div>
    </>
  );
};

export default LoginPage;
