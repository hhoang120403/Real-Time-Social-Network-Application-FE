import { FaArrowRight } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authService } from '@services/api/auth/auth.service';
import useLocalStorage from '@hooks/useLocalStorage';
import { Utils } from '@services/utils/utils.service';
import useSessionStorage from '@hooks/useSessionStorage';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@redux/store';
import type { IUser } from '@app-types/user';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<IUser | null>(null);
  const [setStoredUsername] = useLocalStorage('username', 'set');
  const [setLoggedIn] = useLocalStorage('keepLoggedIn', 'set');
  const [pageReload] = useSessionStorage('pageReload', 'set');
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const loginUser = async (event: React.SubmitEvent<HTMLFormElement>) => {
    setLoading(true);
    event.preventDefault();

    try {
      const result = await authService.signIn({ username, password });

      setStoredUsername(username);
      setLoggedIn(keepLoggedIn);
      sessionStorage.setItem('pendingToast', JSON.stringify({ message: `Welcome back, ${username}! 👋`, type: 'success' }));
      Utils.dispatchUser(result.data, pageReload, dispatch, setUser);
    } catch (error: any) {
      setLoading(false);
      Utils.dispatchNotification(error?.response?.data?.message, 'error', dispatch);
    }
  };

  useEffect(() => {
    if (loading && !user) return;
    if (user) {
      navigate('/app/social/streams');
    }
  }, [loading, user, navigate]);

  return (
    <div className="animate-in fade-in zoom-in-95 duration-400">
      <form onSubmit={loginUser} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-semibold text-white/95" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            className="w-full rounded-xl border-2 border-white/20 bg-white/15 px-[16px] py-[14px] text-[15px] text-white outline-none transition-all placeholder:text-white/50 hover:border-white/30 focus:border-emerald-400 focus:bg-white/25 focus:shadow-[0_0_0_4px_rgba(110,231,183,0.2)]"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-semibold text-white/95" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="w-full rounded-xl border-2 border-white/20 bg-white/15 px-[16px] py-[14px] text-[15px] text-white outline-none transition-all placeholder:text-white/50 hover:border-white/30 focus:border-emerald-400 focus:bg-white/25 focus:shadow-[0_0_0_4px_rgba(110,231,183,0.2)]"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <label
          className="mt-1 flex cursor-pointer select-none items-center text-[14px] text-white/90"
          htmlFor="checkbox"
        >
          <input
            id="checkbox"
            name="checkbox"
            type="checkbox"
            className="mr-2.5 h-4 w-4 cursor-pointer accent-emerald-400"
            checked={keepLoggedIn}
            onChange={() => setKeepLoggedIn(!keepLoggedIn)}
          />
          Keep me signed in
        </label>

        <button
          type="submit"
          className="mt-2 w-full rounded-xl bg-linear-to-br from-[#10b981] to-[#059669] p-[16px] text-[16px] font-bold text-white shadow-[0_8px_20px_rgba(16,185,129,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(16,185,129,0.4)] hover:from-[#34d399] hover:to-[#10b981] disabled:pointer-events-none disabled:bg-white/20 disabled:bg-none disabled:text-white/50 disabled:shadow-none"
          disabled={loading || !username || !password}
        >
          {loading ? 'Signing in...' : 'Login'}
        </button>

        <Link
          to="/forgot-password"
          className="group mt-3 flex items-center justify-center text-[14px] font-medium text-white/80 transition-colors hover:text-emerald-400"
        >
          Forgot password? <FaArrowRight className="ml-1.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </form>
    </div>
  );
};

export default Login;
