import GalleryImage from '@components/gallery-image/GalleryImage';
import ImageModal from '@components/image-modal/ImageModal';
import type { AppDispatch, RootState } from '@redux/store';
import { followerService } from '@services/api/followers/follower.service';
import { postService } from '@services/api/post/post.service';
import { PostUtils } from '@services/utils/post-utils.service';
import { Utils } from '@services/utils/utils.service';
import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PhotoSkeleton from '@pages/social/photos/PhotoSkeleton';
import useInfiniteScroll from '@hooks/useInfiniteScroll';
import { uniqBy } from 'lodash';
import { useNavigate } from 'react-router-dom';
import { FaImage, FaImages, FaCloudUploadAlt } from 'react-icons/fa';

const Photos = () => {
  const { profile } = useSelector((state: RootState) => state.user);
  const [posts, setPosts] = useState<any[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [rightImageIndex, setRightImageIndex] = useState<number>(0);
  const [leftImageIndex, setLeftImageIndex] = useState<number>(0);
  const [lastItemRight, setLastItemRight] = useState<boolean>(false);
  const [lastItemLeft, setLastItemLeft] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPostsCount, setTotalPostsCount] = useState<number>(0);
  const bottomLineRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const getPostsWithImages = async (page: number) => {
    try {
      const response = await postService.getPostsWithImages(page);
      setPosts((prev) => {
        const combined = [...prev, ...response.data.posts];
        return uniqBy(combined, '_id');
      });
      setTotalPostsCount(response.data.totalPosts);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  const fetchMorePhotos = () => {
    if (posts.length < totalPostsCount && !loading) {
      const page = currentPage + 1;
      setCurrentPage(page);
      getPostsWithImages(page);
    }
  };

  useInfiniteScroll(bottomLineRef, fetchMorePhotos);

  const getUserFollowing = async () => {
    try {
      const response = await followerService.getUserFollowing();
      setFollowing(response.data.following);
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  const postImageUrl = (post: any) => {
    const imgUrl = Utils.getImage(post?.imgId, post?.imgVersion);
    return post?.gifUrl ? post?.gifUrl : imgUrl;
  };

  const emptyPost = (post: any) => {
    return (
      Utils.checkIfUserIsBlocked(profile?.blockedBy!, post?.userId) || PostUtils.checkPrivacy(post, profile, following)
    );
  };

  const displayImage = (post: any) => {
    const imgUrl = post?.gifUrl ? post?.gifUrl : Utils.getImage(post?.imgId, post?.imgVersion);
    setImageUrl(imgUrl);
  };

  const onClickRight = () => {
    setLastItemLeft(false);
    setRightImageIndex((index) => index + 1);
    const lastImage = posts[posts.length - 1];
    const post = posts[rightImageIndex];
    if (post) {
      displayImage(post);
      setLeftImageIndex(rightImageIndex);
      if (posts[rightImageIndex] === lastImage) {
        setLastItemRight(true);
      }
    }
  };

  const onClickLeft = () => {
    setLastItemRight(false);
    setLeftImageIndex((index) => index - 1);
    const firstImage = posts[0];
    const post = posts[leftImageIndex - 1];
    if (post) {
      displayImage(post);
      setRightImageIndex(leftImageIndex);
      if (firstImage === post) {
        setLastItemLeft(true);
      }
    }
  };

  useEffect(() => {
    getPostsWithImages(1);
    getUserFollowing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-50/30">
      <div className="max-w-[1240px] mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {showImageModal && (
          <ImageModal
            image={`${imageUrl}`}
            showArrow={true}
            onClickRight={onClickRight}
            onClickLeft={onClickLeft}
            lastItemLeft={lastItemLeft}
            lastItemRight={lastItemRight}
            onCancel={() => {
              setRightImageIndex(0);
              setLeftImageIndex(0);
              setLastItemRight(false);
              setLastItemLeft(false);
              setShowImageModal(false);
              setImageUrl('');
            }}
          />
        )}

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-none italic uppercase">Visuals</h2>
            <p className="text-gray-500 font-bold text-base">A curated look into your community events and moments</p>
          </div>
          {totalPostsCount > 0 && (
            <div className="bg-rose-50 text-rose-600 px-8 py-3 rounded-2xl font-black text-sm border border-rose-100 shadow-sm backdrop-blur-sm flex items-center gap-2">
              <FaImages className="text-rose-400" />
              <span>{totalPostsCount} CAPTUREDS</span>
            </div>
          )}
        </div>

        {/* Loading Initial State */}
        {loading && posts.length === 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <PhotoSkeleton />
          </div>
        )}

        {/* Photos Gallery Grid */}
        {posts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {posts.map((post, index) => (
              <div
                key={Utils.generateString(10)}
                className={`group relative aspect-square rounded-[32px] overflow-hidden bg-white shadow-xl hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 border border-gray-100/50 ${!emptyPost(post) ? 'hidden' : 'block'}`}
              >
                {(!Utils.checkIfUserIsBlocked(profile?.blockedBy!, post?.userId) || post?.userId === profile?._id) && (
                  <>
                    {PostUtils.checkPrivacy(post, profile, following) && (
                      <div className="w-full h-full cursor-pointer">
                        <GalleryImage
                          post={post}
                          showCaption={true}
                          showDelete={false}
                          imgSrc={`${postImageUrl(post)}`}
                          onClick={() => {
                            setRightImageIndex(index + 1);
                            setLeftImageIndex(index);
                            setLastItemLeft(index === 0);
                            setLastItemRight(index + 1 === posts.length);
                            setImageUrl(postImageUrl(post));
                            setShowImageModal(true);
                          }}
                        />
                        {/* Custom Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white pointer-events-none p-4 text-center">
                          <div className="bg-white/20 p-3 rounded-full backdrop-blur-md mb-3 transform -translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            <FaImage className="text-xl" />
                          </div>
                          <p className="text-xs font-black uppercase tracking-widest">{post?.username}</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Loading More State */}
        {loading && posts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            <PhotoSkeleton />
          </div>
        )}

        {/* Empty State */}
        {!loading && !posts.length && (
          <div className="flex justify-center items-center pt-8 pb-32 px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-white p-16 rounded-[48px] shadow-2xl border border-gray-100 flex flex-col items-center text-center max-w-xl w-full relative overflow-hidden group">
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-rose-50/50 rounded-full blur-3xl group-hover:bg-rose-100/50 transition-colors duration-500" />

              <div className="w-32 h-32 bg-linear-to-br from-rose-50 to-rose-100 rounded-full flex items-center justify-center mb-12 relative shadow-inner">
                <div className="absolute inset-0 border-2 border-dashed border-rose-200 rounded-full animate-[spin_40s_linear_infinite] opacity-50" />
                <FaImage className="text-6xl text-rose-500 relative z-10" />
              </div>

              <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight uppercase">Clear Canvas</h3>
              <p className="text-gray-500 font-medium text-lg leading-relaxed mb-12">
                No visual stories found in your network yet. Be the first to capture and share a masterpiece!
              </p>

              <button
                className="px-12 py-5 bg-gray-900 text-white font-black rounded-[20px] hover:bg-rose-600 transition-all duration-300 shadow-xl active:scale-95 flex items-center gap-3"
                onClick={() => navigate('/app/social/streams')}
              >
                <span>Share First Visual</span>
                <FaCloudUploadAlt className="text-xl" />
              </button>
            </div>
          </div>
        )}

        {/* Infinite Scroll Bottom Anchor */}
        <div ref={bottomLineRef} className="h-20"></div>
      </div>
    </div>
  );
};

export default Photos;
