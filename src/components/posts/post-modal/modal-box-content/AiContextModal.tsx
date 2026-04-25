import { useState } from 'react';
import { FaRobot, FaTimes } from 'react-icons/fa';
import Button from '@components/button/Button';

interface AiContextModalProps {
  onClose: () => void;
  onGenerate: (description: string) => void;
  loading: boolean;
}

const AiContextModal = ({ onClose, onGenerate, loading }: AiContextModalProps) => {
  const [description, setDescription] = useState('');

  return (
    <div className="fixed inset-0 z-10000 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-[450px] bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-linear-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <FaRobot size={24} />
            </div>
            <div>
              <h3 className="font-bold text-[18px]">AI Post Assistant</h3>
              <p className="text-[12px] opacity-80">Tell me what's on your mind</p>
            </div>
          </div>
          <FaTimes className="cursor-pointer hover:rotate-90 transition-transform" onClick={onClose} />
        </div>

        <div className="p-6">
          <p className="text-[14px] text-gray-600 mb-4 font-medium">
            I don't see any text or images yet. What would you like your post to be about?
          </p>
          <textarea
            className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-[15px] transition-all"
            placeholder="e.g., A post about my weekend trip to the mountains with friends..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex justify-end gap-3 mt-6">
            <button
              className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <Button
              label={loading ? 'Generating...' : 'Generate Caption'}
              className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
              disabled={loading || !description.trim()}
              handleClick={() => onGenerate(description)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiContextModal;
