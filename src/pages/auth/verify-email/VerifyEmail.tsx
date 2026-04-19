import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '@services/api/auth/auth.service';
import { FaArrowLeft } from 'react-icons/fa';
import backgroundImage from '@assets/images/background.jpg';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Verification token is missing.');
        return;
      }

      try {
        const response = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(response.data.message);
      } catch (error: any) {
        setStatus('error');
        setMessage(error?.response?.data?.message || 'Something went wrong. Please try again.');
      }
    };
    verify();
  }, [token]);

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center p-4 font-sans"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-linear-to-br from-indigo-900/80 to-purple-950/90 z-0"></div>

      <div className="relative z-10 w-full max-w-[480px] animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl">
          <div className="flex bg-black/10">
            <div className="w-full py-5 text-center text-[20px] font-bold text-white uppercase tracking-wider">Email Verification</div>
          </div>

          <div className="px-[30px] py-[40px] text-center">
            <div className="animate-in fade-in zoom-in-95 duration-400">
              {status === 'loading' && (
                <div className="flex flex-col items-center gap-4">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-emerald-400"></div>
                  <p className="text-white/90 font-medium">Verifying your email, please wait...</p>
                </div>
              )}

              {status === 'success' && (
                <div className="flex flex-col gap-6">
                  <div className="flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400/20 shadow-[0_0_30px_rgba(52,211,153,0.3)]">
                      <span className="text-4xl">✅</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold text-white">Success!</h2>
                    <p className="text-white/80 leading-relaxed">{message}</p>
                  </div>
                  <Link
                    to="/"
                    className="mt-4 w-full rounded-xl bg-linear-to-br from-[#10b981] to-[#059669] p-[16px] text-[16px] font-bold tracking-wide text-white shadow-[0_8px_20px_rgba(16,185,129,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(16,185,129,0.4)] hover:from-[#34d399] hover:to-[#10b981] text-center no-underline"
                  >
                    GO TO LOGIN
                  </Link>
                </div>
              )}

              {status === 'error' && (
                <div className="flex flex-col gap-6">
                  <div className="flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-400/20 shadow-[0_0_30px_rgba(248,113,113,0.3)]">
                      <span className="text-4xl">❌</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
                    <p className="text-white/80 leading-relaxed">{message}</p>
                  </div>
                  <Link
                    to="/"
                    className="group mt-4 flex items-center justify-center text-[14px] font-medium text-white/80 transition-colors hover:text-emerald-400 no-underline"
                  >
                    <FaArrowLeft className="mr-2 transition-transform group-hover:-translate-x-1" /> Back to Home
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
