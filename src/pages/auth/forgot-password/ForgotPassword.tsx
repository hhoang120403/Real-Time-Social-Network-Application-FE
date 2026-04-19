import { FaArrowLeft } from 'react-icons/fa';
import backgroundImage from '@assets/images/background.jpg';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authService } from '@services/api/auth/auth.service';
import { Utils } from '@services/utils/utils.service';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@redux/store';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [environment, setEnvironment] = useState('');
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const env = Utils.appEnvironment();
    setEnvironment(env);
  }, []);

  const forgotPassword = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await authService.forgotPassword(email);
      setLoading(false);
      setEmail('');
      Utils.dispatchNotification(result?.data?.message, 'success', dispatch);
    } catch (error: any) {
      setLoading(false);
      Utils.dispatchNotification(error?.response?.data?.message, 'error', dispatch);
    }
  };

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
          <div className="flex bg-black/10">
            <div className="w-full py-5 text-center text-[20px] font-bold text-white">Forgot Password</div>
          </div>

          <div className="px-[30px] py-[40px]">
            <div className="animate-in fade-in zoom-in-95 duration-400">
              <form onSubmit={forgotPassword} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-semibold text-white/95" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="w-full rounded-xl border-2 border-white/20 bg-white/15 px-[16px] py-[14px] text-[15px] text-white outline-none transition-all placeholder:text-white/50 hover:border-white/30 focus:border-emerald-400 focus:bg-white/25 focus:shadow-[0_0_0_4px_rgba(110,231,183,0.2)]"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="mt-2 w-full rounded-xl bg-linear-to-br from-[#10b981] to-[#059669] p-[16px] text-[16px] font-bold tracking-wide text-white shadow-[0_8px_20px_rgba(16,185,129,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(16,185,129,0.4)] hover:from-[#34d399] hover:to-[#10b981] disabled:pointer-events-none disabled:bg-white/20 disabled:bg-none disabled:text-white/50 disabled:shadow-none"
                  disabled={loading || !email}
                >
                  {loading ? 'SENDING...' : 'CHANGE PASSWORD'}
                </button>

                <Link
                  to="/"
                  className="group mt-2 flex items-center justify-center text-[14px] font-medium text-white/80 transition-colors hover:text-emerald-400"
                >
                  <FaArrowLeft className="mr-2 transition-transform group-hover:-translate-x-1" /> Back to Sign In
                </Link>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
