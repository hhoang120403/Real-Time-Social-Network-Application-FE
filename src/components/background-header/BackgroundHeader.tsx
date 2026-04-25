import Avatar from '@components/avatar/Avatar';
import ImageGridModal from '@components/image-grid-modal/ImageGridModal';
import Spinner from '@components/spinner/Spinner';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FaCamera,
  FaBriefcase,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaUserPlus,
  FaUserCheck,
  FaCommentDots
} from 'react-icons/fa';
import BackgroundHeaderSkeleton from '@components/background-header/BackgroundHeaderSkeleton';
import useDetectOutsideClick from '@hooks/useDetectOutsideClick';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { followerService } from '@services/api/followers/follower.service';
import { Utils } from '@services/utils/utils.service';
import type { AppDispatch, RootState } from '@redux/store';
import { find } from 'lodash';

interface BackgroundHeaderProps {
  user: any;
  loading: boolean;
  url: string;
  onClick: (tab: string) => void;
  tab: string;
  hasImage: boolean;
  tabItems: any[];
  hasError: boolean;
  hideSettings: boolean;
  selectedFileImage: (event: any, type: string) => void;
  saveImage: (type: string) => void;
  cancelFileSelection: () => void;
  removeBackgroundImage: (bgImageId: string) => void;
  galleryImages: string[];
}

const BackgroundHeader = ({
  user,
  loading,
  url,
  onClick,
  tab,
  hasImage,
  tabItems,
  hasError,
  hideSettings,
  selectedFileImage,
  saveImage,
  cancelFileSelection,
  removeBackgroundImage,
  galleryImages
}: BackgroundHeaderProps) => {
  const [selectedBackground, setSelectedBackground] = useState('');
  const [selectedProfileImage, setSelectedProfileImage] = useState('');
  const [showSpinner, setShowSpinner] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useDetectOutsideClick(menuRef, false);
  const [showImagesModal, setShowImagesModal] = useState(false);
  const backgroundFileRef = useRef<HTMLInputElement | null>(null);
  const profileImageRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector((state: RootState) => state.user);
  const [following, setFollowing] = useState<any[]>([]);

  const isFollowing = find(following, (f: any) => f?._id === user?._id || f?.userId === user?._id);

  const getUserFollowing = useCallback(async () => {
    try {
      const response = await followerService.getUserFollowing();
      setFollowing(response.data.following);
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  }, [dispatch]);

  const followUser = async () => {
    try {
      await followerService.followUser(user?._id);
      getUserFollowing();
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  const unfollowUser = async () => {
    try {
      await followerService.unfollowUser(user?._id, profile?._id || '');
      getUserFollowing();
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  const onMessageClick = () => {
    const params = new URLSearchParams({
      username: user?.username.toLowerCase(),
      id: user?._id
    });
    navigate(`/app/social/chat/messages?${params.toString()}`);
  };

  useEffect(() => {
    if (!hideSettings) {
      getUserFollowing();
    }
  }, [hideSettings, getUserFollowing]);

  const backgroundFileInputClicked = () => {
    backgroundFileRef.current?.click();
  };

  const profileFileInputClicked = () => {
    profileImageRef.current?.click();
  };

  const hideSaveChangesContainer = () => {
    setSelectedBackground('');
    setSelectedProfileImage('');
    setShowSpinner(false);
  };

  const onAddProfileClick = () => setIsActive(!isActive);

  const BackgroundSelectDropdown = () => {
    return (
      <nav
        className="absolute right-0 top-full mt-2 z-50 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        data-testid="menu"
      >
        <ul className="py-1">
          {galleryImages.length > 0 && (
            <li
              className="px-4 py-2.5 hover:bg-gray-100 cursor-pointer flex items-center gap-3 transition-colors group"
              onClick={() => {
                setShowImagesModal(true);
                setIsActive(false);
              }}
            >
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <span className="text-blue-600">🖼️</span>
              </div>
              <span className="font-semibold text-gray-700 text-[14px]">Select from gallery</span>
            </li>
          )}
          <li
            className="px-4 py-2.5 hover:bg-gray-100 cursor-pointer flex items-center gap-3 transition-colors group"
            onClick={() => {
              backgroundFileInputClicked();
              setIsActive(false);
              setShowImagesModal(false);
            }}
          >
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <span className="text-gray-600 text-sm">⬆️</span>
            </div>
            <span className="font-semibold text-gray-700 text-[14px]">Upload photo</span>
          </li>
          {url && (
            <li
              className="px-4 py-2.5 hover:bg-red-50 cursor-pointer flex items-center gap-3 transition-colors group border-t border-gray-100"
              onClick={() => {
                removeBackgroundImage(user?.bgImageId);
                setIsActive(false);
              }}
            >
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                <span className="text-red-600 text-sm">🗑️</span>
              </div>
              <span className="font-semibold text-red-600 text-[14px]">Remove cover photo</span>
            </li>
          )}
        </ul>
      </nav>
    );
  };

  useEffect(() => {
    if (!hasImage) {
      setShowSpinner(false);
      setSelectedBackground('');
      setSelectedProfileImage('');
    }
  }, [hasImage]);

  return (
    <>
      {showImagesModal && (
        <ImageGridModal
          images={galleryImages}
          closeModal={() => setShowImagesModal(false)}
          selectedImage={(event: any) => {
            setSelectedBackground(event);
            selectedFileImage(event, 'background');
          }}
        />
      )}
      {loading ? (
        <BackgroundHeaderSkeleton tabItems={tabItems} />
      ) : (
        <div className="w-full bg-white rounded-b-xl shadow-sm shadow-gray-200" data-testid="profile-banner">
          {/* Banner Section (Background) */}
          <div className="relative w-full h-[180px] sm:h-[300px] lg:h-[350px] bg-gray-100 rounded-b-xl">
            <div
              data-testid="profile-banner-image"
              className="w-full h-full"
              style={{ background: `${!selectedBackground && !url ? user?.avatarColor : ''}` }}
            >
              {(selectedBackground || url) && (
                <img src={selectedBackground || url} alt="cover" className="w-full h-full object-cover rounded-b-xl" />
              )}
            </div>

            {/* Edit Cover Button */}
            {hideSettings && (
              <div className="absolute right-4 bottom-4 z-10" ref={menuRef}>
                <button
                  onClick={onAddProfileClick}
                  className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-white transition-colors"
                >
                  <FaCamera className="text-lg" />
                  <span className="hidden sm:inline">Edit cover photo</span>
                </button>
                {isActive && <BackgroundSelectDropdown />}
              </div>
            )}

            <input
              ref={backgroundFileRef}
              name="background"
              type="file"
              className="hidden"
              onClick={() => backgroundFileRef.current && (backgroundFileRef.current.value = '')}
              onChange={(event) => {
                if (event.target.files?.[0]) {
                  setSelectedBackground(URL.createObjectURL(event.target.files[0]));
                  selectedFileImage(event.target.files[0], 'background');
                }
              }}
            />
          </div>

          {/* Profile Details (Positioned ENTIRELY BELOW the background) */}
          <div className="max-w-[1250px] mx-auto px-4 sm:px-12 lg:px-20 py-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar */}
              <div className="shrink-0 relative">
                <div className="ring-4 ring-white rounded-full overflow-hidden bg-gray-50 shadow-md w-[120px] h-[120px] sm:w-[160px] sm:h-[160px] flex items-center justify-center">
                  <Avatar
                    name={user?.username}
                    bgColor={user?.avatarColor}
                    textColor="#ffffff"
                    size={160}
                    avatarSrc={selectedProfileImage || user?.profilePicture}
                  />
                </div>
                {hideSettings && (
                  <>
                    <button
                      className="absolute bottom-1 right-1 p-2 bg-[#e4e6eb] rounded-full border-2 border-white cursor-pointer hover:bg-gray-200 transition-colors z-30 shadow-sm"
                      onClick={profileFileInputClicked}
                    >
                      <FaCamera className="text-gray-900 text-lg" />
                    </button>
                    <input
                      ref={profileImageRef}
                      name="profile"
                      type="file"
                      className="hidden"
                      onClick={() => profileImageRef.current && (profileImageRef.current.value = '')}
                      onChange={(event) => {
                        if (event.target.files?.[0]) {
                          setSelectedProfileImage(URL.createObjectURL(event.target.files[0]));
                          selectedFileImage(event.target.files[0], 'profile');
                        }
                      }}
                    />
                  </>
                )}
              </div>

              {/* User Data: Name, Followers, Bio, Metadata */}
              <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left mt-2">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-1">{user?.username}</h1>
                <p className="text-[#65676b] font-bold text-[17px] mb-4">
                  {user?.followersCount || 0} followers • {user?.followingCount || 0} following
                </p>

                <div className="flex flex-col gap-2 items-center md:items-start">
                  <p className="text-gray-900 text-[16px] font-medium leading-relaxed max-w-[600px] mb-2">
                    {user?.quote || 'Add a bio to tell people more about yourself'}
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-[#65676b] text-[15px]">
                    {user?.work && (
                      <span className="flex items-center gap-2">
                        <FaBriefcase className="text-lg opacity-70" /> {user.work}
                      </span>
                    )}
                    <span className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-lg opacity-70" /> {user?.location || 'Country'}
                    </span>
                    <span className="flex items-center gap-2">
                      <FaGraduationCap className="text-lg opacity-70" /> {user?.school || 'University'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for other users */}
              {!hideSettings && (
                <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto md:ml-auto mt-2 md:mt-4">
                  <button
                    onClick={isFollowing ? unfollowUser : followUser}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-[15px] transition-all transform active:scale-95 shadow-sm ${
                      isFollowing
                        ? 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                        : 'bg-[#0866ff] text-white hover:bg-[#0550cc]'
                    }`}
                  >
                    {isFollowing ? <FaUserCheck className="text-lg" /> : <FaUserPlus className="text-lg" />}
                    <span>{isFollowing ? 'Following' : 'Follow'}</span>
                  </button>
                  <button
                    onClick={onMessageClick}
                    className="flex items-center gap-2 bg-gray-200 text-gray-900 px-6 py-2.5 rounded-lg font-bold text-[15px] hover:bg-gray-300 transition-all transform active:scale-95 shadow-sm"
                  >
                    <FaCommentDots className="text-lg" />
                    <span>Message</span>
                  </button>
                </div>
              )}
            </div>
            <div className="mt-8 border-t border-gray-200 overflow-x-auto no-scrollbar">
              <ul className="flex items-center gap-1 py-0.5 min-w-max">
                {tabItems.map(
                  (data) =>
                    data.show && (
                      <li key={data.key} className="relative">
                        <div
                          className={`profile-tab-item px-4 py-4 cursor-pointer font-bold text-[15px] rounded-lg ${
                            tab === data.key.toLowerCase() ? 'active' : 'text-[#65676b]'
                          }`}
                          onClick={() => onClick(data.key.toLowerCase())}
                        >
                          {data.key}
                        </div>
                        {tab === data.key.toLowerCase() && <div className="tab-indicator" />}
                      </li>
                    )
                )}
              </ul>
            </div>
          </div>

          {hasImage && (
            <div className="fixed top-0 left-0 right-0 z-100 bg-[#0866ff] py-3 px-6 shadow-lg animate-in slide-in-from-top duration-300">
              <div className="max-w-[1250px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-white">
                  {showSpinner && !hasError ? (
                    <Spinner bgColor="white" />
                  ) : (
                    <div className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-full text-sm">✨</div>
                  )}
                  <span className="font-semibold text-[15px]">You have unsaved changes.</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="bg-[#e4e6eb] text-gray-900 px-6 py-1.5 rounded-lg font-bold text-[14px] hover:bg-gray-200 transition-colors"
                    onClick={() => {
                      setShowSpinner(false);
                      cancelFileSelection();
                      hideSaveChangesContainer();
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-white text-blue-600 px-6 py-1.5 rounded-lg font-bold text-[14px] hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      setShowSpinner(true);
                      if (selectedBackground) saveImage('background');
                      if (selectedProfileImage) saveImage('profile');
                    }}
                  >
                    Save changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default BackgroundHeader;
