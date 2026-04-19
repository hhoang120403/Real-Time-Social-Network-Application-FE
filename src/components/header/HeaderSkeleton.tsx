import Skeleton from 'react-loading-skeleton';

const HeaderSkeleton = () => {
  return (
    <header
      className="fixed top-0 z-100 box-border flex h-[70px] w-full items-center justify-between bg-white px-6 py-2 border-b border-gray-100 shadow-sm"
      data-testid="header-skeleton"
    >
      {/* Left Side Skeleton */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex h-10 w-10 items-center justify-center">
          <Skeleton baseColor="#F3F4F6" circle height={40} width={40} />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton baseColor="#F3F4F6" circle height={36} width={36} />
          <div className="flex flex-col">
            <Skeleton baseColor="#F3F4F6" width={80} height={24} />
          </div>
        </div>
      </div>

      {/* Middle Side Skeleton (Search Bar) */}
      <div className="hidden sm:flex flex-1 justify-center px-6 max-w-[700px]">
        <div className="w-full max-w-[600px]">
          <Skeleton baseColor="#F9FAFB" height={46} borderRadius={16} />
        </div>
      </div>

      {/* Right Side Skeleton */}
      <div className="flex items-center gap-3 sm:gap-5 shrink-0">
        <Skeleton baseColor="#F3F4F6" circle height={40} width={40} />
        <Skeleton baseColor="#F3F4F6" circle height={40} width={40} />
        <div className="ml-2">
          <Skeleton baseColor="#F3F4F6" circle height={32} width={32} />
        </div>
      </div>
    </header>
  );
};
export default HeaderSkeleton;
