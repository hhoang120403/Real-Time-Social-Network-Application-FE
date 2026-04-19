import Skeleton from 'react-loading-skeleton';

const SuggestionsSkeletons = () => {
  return (
    <div
      className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-[#e4e6eb] overflow-hidden"
      data-testid="suggestions"
    >
      <div className="px-4 py-3 border-b border-[#f0f2f5]">
        <Skeleton baseColor="#EFF1F6" width={100} height={20} />
      </div>

      <div className="p-2">
        <div className="flex flex-col gap-1">
          {[1, 2, 3, 4, 5].map((index) => (
            <div className="flex items-center gap-3 p-2" key={index}>
              <div className="shrink-0">
                <Skeleton baseColor="#EFF1F6" circle width={40} height={40} />
              </div>
              <div className="flex-1 min-w-0 pr-1">
                <Skeleton baseColor="#EFF1F6" width={100} height={16} />
                <div className="mt-1">
                  <Skeleton baseColor="#EFF1F6" width={80} height={12} />
                </div>
              </div>
              <div className="shrink-0">
                <Skeleton baseColor="#EFF1F6" width={70} height={32} borderRadius={8} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default SuggestionsSkeletons;
