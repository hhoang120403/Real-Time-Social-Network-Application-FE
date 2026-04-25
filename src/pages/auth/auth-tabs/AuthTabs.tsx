import backgroundImage from '@assets/images/background.jpg';
import { useState, useEffect } from 'react';
import { Login, Register } from '@pages/auth/index';
import useLocalStorage from '@hooks/useLocalStorage';
import { clearAuthTransition } from '@services/axios';
import { Utils } from '@services/utils/utils.service';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@redux/store';

const AuthTabs = () => {
  const [searchParams] = useSearchParams();
  const [type, setType] = useState<'Sign In' | 'Sign Up'>('Sign In');
  const keepLoggedIn = useLocalStorage('keepLoggedIn', 'get');
  const [environment, setEnvironment] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'signup') {
      setType('Sign Up');
    } else {
      setType('Sign In');
    }
  }, [searchParams]);

  useEffect(() => {
    const env = Utils.appEnvironment();
    setEnvironment(env);
    if (keepLoggedIn) navigate('/app/social/streams');

    // Show pending toast
    const pending = sessionStorage.getItem('pendingToast');
    if (pending) {
      try {
        const { message, type } = JSON.parse(pending);
        Utils.dispatchNotification(message, type, dispatch);
      } catch (_) {}
      sessionStorage.removeItem('pendingToast');
    }

    window.setTimeout(clearAuthTransition, 1500);
  }, [keepLoggedIn, navigate, dispatch, type]); // Added type to dependencies to re-check toast on tab change

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center p-4 font-sans"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-linear-to-br from-blue-900/80 to-blue-950/90 z-0"></div>

      <div className="absolute top-5 left-5 z-10 flex h-10 items-center rounded-lg bg-white/20 px-4 font-bold tracking-wider text-white shadow-lg backdrop-blur-md">
        {environment}
      </div>

      <div className="relative z-10 w-full max-w-[480px] animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl">
          <ul className="flex bg-black/10">
            <li className="flex-1">
              <button
                onClick={() => navigate('/?tab=signin')}
                className={`w-full py-5 text-[18px] transition-all duration-300 ${type === 'Sign In' ? 'bg-white/20 font-bold text-white border-b-[3px] border-emerald-400' : 'font-medium text-white/70 hover:bg-white/5 hover:text-white border-b-[3px] border-transparent'}`}
              >
                Sign In
              </button>
            </li>
            <li className="flex-1">
              <button
                onClick={() => navigate('/?tab=signup')}
                className={`w-full py-5 text-[18px] transition-all duration-300 ${type === 'Sign Up' ? 'bg-white/20 font-bold text-white border-b-[3px] border-emerald-400' : 'font-medium text-white/70 hover:bg-white/5 hover:text-white border-b-[3px] border-transparent'}`}
              >
                Sign Up
              </button>
            </li>
          </ul>

          <div className="px-[30px] py-[40px]">
            {type === 'Sign In' && <Login />}
            {type === 'Sign Up' && <Register />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthTabs;
