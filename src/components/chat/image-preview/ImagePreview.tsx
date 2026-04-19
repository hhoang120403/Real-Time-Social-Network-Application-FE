import { FaTimes } from 'react-icons/fa';

interface ImagePreviewProps {
  image: string;
  onRemoveImage: () => void;
}

const ImagePreview = ({ image, onRemoveImage }: ImagePreviewProps) => {
  return (
    <div className="flex justify-start px-2" data-testid="image-preview">
      <div className="group relative w-fit">
        {/* Background Glow Effect */}
        <div className="absolute -inset-2 bg-primary/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Image Container */}
        <div className="relative bg-white/80 backdrop-blur-xl p-1.5 rounded-2xl border border-white shadow-2xl ring-1 ring-black/5">
          <div className="relative aspect-video w-[240px] sm:w-[320px] rounded-xl overflow-hidden group/img">
            <img 
              className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" 
              src={image} 
              alt="Preview" 
            />
            {/* Dark inner shadow for depth */}
            <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.1)] pointer-events-none" />
          </div>
          
          {/* Close Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              onRemoveImage();
            }}
            className="absolute -top-2 -right-2 w-8 h-8 bg-white text-gray-500 hover:text-red-500 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-90 z-10 border border-gray-100 group/close"
          >
            <FaTimes className="text-[12px] group-hover/close:rotate-90 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;
