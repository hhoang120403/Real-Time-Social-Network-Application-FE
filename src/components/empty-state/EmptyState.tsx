interface EmptyStateProps {
  image: string;
  title: string;
  description: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

const EmptyState = ({ image, title, description, buttonText, onButtonClick }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in zoom-in duration-500">
      <div className="relative mb-8 group">
        {/* Animated Glow Background */}
        <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        <img
          src={image}
          alt={title}
          className="relative w-64 h-64 object-contain transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <h3 className="text-2xl font-black text-gray-900 mb-2 font-geist tracking-tight">{title}</h3>

      <p className="text-gray-500 max-w-[400px] leading-relaxed font-medium mb-8">{description}</p>

      {buttonText && (
        <button
          onClick={onButtonClick}
          className="px-8 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 active:scale-95 transition-all shadow-xl shadow-gray-200"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
