import Skeleton from 'react-loading-skeleton';

const PhotoSkeleton = () => {
  return (
    <>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((_post, index) => (
        <div key={index} className="w-full aspect-square animate-in fade-in duration-500" style={{ animationDelay: `${index * 50}ms` }}>
          <Skeleton 
             baseColor="#f3f4f6" 
             highlightColor="#ffffff"
             height="100%" 
             width="100%" 
             style={{ borderRadius: '32px' }} 
          />
        </div>
      ))}
    </>
  );
};

export default PhotoSkeleton;

