import { useState } from 'react';
import { Utils } from '@services/utils/utils.service';
import { authService } from '@services/api/auth/auth.service';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@redux/store';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const registerUser = async (event: React.SubmitEvent<HTMLFormElement>) => {
    setLoading(true);
    event.preventDefault();
    try {
      const avatarColor = Utils.avatarColor();
      const avatarImage = Utils.generateAvatarImage(username, avatarColor);
      const result: any = await authService.signUp({ username, email, password, avatarColor, avatarImage });

      setLoading(false);
      Utils.dispatchNotification(result?.data?.message, 'success', dispatch);
      navigate('/?tab=signin');
    } catch (error: any) {
      setLoading(false);
      Utils.dispatchNotification(error?.response?.data.message, 'error', dispatch);
    }
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-400">
      <form onSubmit={registerUser} className="flex flex-col gap-5">
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
          <label className="text-[14px] font-semibold text-white/95" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="text"
            className="w-full rounded-xl border-2 border-white/20 bg-white/15 px-[16px] py-[14px] text-[15px] text-white outline-none transition-all placeholder:text-white/50 hover:border-white/30 focus:border-emerald-400 focus:bg-white/25 focus:shadow-[0_0_0_4px_rgba(110,231,183,0.2)]"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        <button
          type="submit"
          className="mt-4 w-full rounded-xl bg-linear-to-br from-[#10b981] to-[#059669] p-[16px] text-[16px] font-bold text-white shadow-[0_8px_20px_rgba(16,185,129,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(16,185,129,0.4)] hover:from-[#34d399] hover:to-[#10b981] disabled:pointer-events-none disabled:bg-white/20 disabled:bg-none disabled:text-white/50 disabled:shadow-none"
          disabled={!username || !email || !password || loading}
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default Register;
