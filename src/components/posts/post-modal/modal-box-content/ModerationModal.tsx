import { FaTimes, FaRobot, FaExclamationTriangle, FaCheckCircle, FaLightbulb } from 'react-icons/fa';
import Spinner from '@components/spinner/Spinner';
import Button from '@components/button/Button';

interface ModerationModalProps {
  loading: boolean;
  result: any;
  advice: string;
  onClose: () => void;
}

const ModerationModal = ({ loading, result, advice, onClose }: ModerationModalProps) => {
  return (
    <div className="fixed inset-0 z-10000 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[500px] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between border-b ${result?.is_inappropriate ? 'bg-red-50' : 'bg-green-50'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${result?.is_inappropriate ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
              {result?.is_inappropriate ? <FaExclamationTriangle size={16} /> : <FaCheckCircle size={16} />}
            </div>
            <h3 className={`text-[18px] font-black uppercase tracking-tight ${result?.is_inappropriate ? 'text-red-700' : 'text-green-700'}`}>
              {result?.is_inappropriate ? 'Content Warning' : 'Content Safe'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <FaTimes className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
          <div className="space-y-6">
            {/* Scores Section */}
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(result.scores).map(([label, score]: [string, any]) => (
                <div key={label} className="bg-gray-50 p-3 rounded-2xl border border-gray-100 transition-all hover:shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-black uppercase text-gray-400 tracking-wider">{label}</span>
                    <span className={`text-[14px] font-bold ${score > 0.5 ? 'text-red-500' : 'text-gray-700'}`}>
                      {(score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${score > 0.5 ? 'bg-red-500' : 'bg-blue-500'}`}
                      style={{ width: `${score * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Gemini Advice Section */}
            <div className="bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 p-5 rounded-3xl border border-blue-100 relative overflow-hidden group min-h-[100px] flex flex-col justify-center">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
                <FaRobot size={60} className="text-blue-600" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <FaLightbulb className="text-amber-500 animate-bounce" />
                <span className="font-black text-[13px] text-blue-900 uppercase tracking-widest">AI Assistant Insight</span>
              </div>
              {advice ? (
                <p className="text-[15px] text-blue-900 leading-relaxed font-medium italic animate-in fade-in slide-in-from-bottom-2 duration-500">
                  "{advice}"
                </p>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                  </div>
                  <span className="text-[13px] text-blue-400 font-bold italic uppercase tracking-tighter">Gemini is thinking...</span>
                </div>
              )}
            </div>

            {/* Action */}
            <Button
              className={`w-full h-12 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95 ${result.is_inappropriate ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'}`}
              label={result.is_inappropriate ? 'Understand' : 'Got it!'}
              handleClick={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModerationModal;
