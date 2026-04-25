import React from 'react';
import { FaGlobe, FaSmile, FaMagic, FaTimes } from 'react-icons/fa';

interface AiAssistantSettingsProps {
  options: {
    language: string;
    tone: string;
    useEmoji: boolean;
  };
  setOptions: React.Dispatch<React.SetStateAction<{
    language: string;
    tone: string;
    useEmoji: boolean;
  }>>;
  onClose: () => void;
}

const AiAssistantSettings = ({ options, setOptions, onClose }: AiAssistantSettingsProps) => {
  const languages = ['English', 'Vietnamese', 'French', 'Spanish', 'Japanese'];
  const tones = ['Engaging', 'Professional', 'Funny', 'Minimalist', 'Inspirational'];

  return (
    <div className="p-3 bg-white border-t border-[#f0f2f5] animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between mb-3 text-[12px] font-bold text-gray-500 uppercase tracking-widest">
        <span>AI Configuration</span>
        <FaTimes className="cursor-pointer hover:text-red-500" onClick={onClose} />
      </div>

      <div className="flex flex-col gap-3">
        {/* Language Selection */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-700">
            <FaGlobe className="text-blue-500" />
            <span>Language</span>
          </div>
          <select 
            className="text-[12px] p-1 border rounded bg-gray-50 focus:outline-none"
            value={options.language}
            onChange={(e) => setOptions({ ...options, language: e.target.value })}
          >
            {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
          </select>
        </div>

        {/* Tone Selection */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-700">
            <FaMagic className="text-purple-500" />
            <span>Tone</span>
          </div>
          <select 
            className="text-[12px] p-1 border rounded bg-gray-50 focus:outline-none"
            value={options.tone}
            onChange={(e) => setOptions({ ...options, tone: e.target.value })}
          >
            {tones.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Emoji Toggle */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-700">
            <FaSmile className="text-orange-500" />
            <span>Use Emoji</span>
          </div>
          <div 
             className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${options.useEmoji ? 'bg-green-500' : 'bg-gray-300'}`}
             onClick={() => setOptions({ ...options, useEmoji: !options.useEmoji })}
          >
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${options.useEmoji ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAssistantSettings;
