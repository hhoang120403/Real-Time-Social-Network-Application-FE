import { FaTimes, FaClock, FaRobot, FaLightbulb, FaCalendarDay } from 'react-icons/fa';
import Button from '@components/button/Button';

interface BestTimeModalProps {
  recommendedHour: number;
  advice: string;
  onClose: () => void;
}

const BestTimeModal = ({ recommendedHour, advice, onClose }: BestTimeModalProps) => {
  const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
  
  // Ensure the hour is within 0-23 range
  const displayHour = Math.abs(Math.round(recommendedHour)) % 24;

  return (
    <div className="fixed inset-0 z-10000 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[450px] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-6 py-5 bg-linear-to-r from-orange-400 to-rose-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <FaClock size={22} />
            </div>
            <div>
              <h3 className="text-white font-black uppercase tracking-tight text-[16px]">Best Time to Post</h3>
              <p className="text-white/80 text-[12px] font-bold uppercase tracking-widest">{dayName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <FaTimes className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col items-center text-center">
          <div className="relative mb-6">
             <div className="w-32 h-32 rounded-full border-4 border-orange-100 flex items-center justify-center bg-orange-50/50 shadow-inner">
                <span className="text-[42px] font-black text-orange-500 tracking-tighter">
                  {displayHour}:00
                </span>
             </div>
             <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-orange-500 border border-orange-50">
                <FaCalendarDay size={18} />
             </div>
          </div>

          <h4 className="text-[20px] font-black text-gray-800 mb-2 tracking-tight">Your Golden Hour!</h4>
          <p className="text-gray-500 text-[14px] leading-relaxed mb-8 px-4 font-medium">
            AI analyzed your content and engagement data to find the perfect timing for you.
          </p>

          {/* Gemini Insight */}
          <div className="w-full bg-linear-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100 text-left relative group mb-8">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <FaRobot size={40} className="text-blue-600" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <FaLightbulb className="text-amber-500 animate-pulse" />
              <span className="font-black text-[11px] text-blue-900 uppercase tracking-widest">AI Insight</span>
            </div>
            <p className="text-[14px] text-blue-900 leading-relaxed font-bold italic">
              "{advice}"
            </p>
          </div>

          <Button
            className="w-full h-12 bg-linear-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95 border-none"
            label="Great!"
            handleClick={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default BestTimeModal;
