import BackgroundHeader from '@components/background-header/BackgroundHeader';
import ChangePassword from '@components/change-password/ChangePassword';
import GalleryImage from '@components/gallery-image/GalleryImage';
import NotificationSettings from '@components/notification-settings/NotificationSettings';
import Timeline from '@components/timeline/Timeline';
import FollowerCard from '@pages/social/followers/FollowerCard';
import { toggleDeleteDialog } from '@redux/reducers/modal/modal.reducer';
import { imageService } from '@services/api/image/image.service';
import { userService } from '@services/api/user/user.service';
import { tabItems } from '@services/utils/static.data';
import { Utils } from '@services/utils/utils.service';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useSearchParams } from 'react-router-dom';
import { filter } from 'lodash';
import ImageModal from '@components/image-modal/ImageModal';
import Dialog from '@components/dialog/Dialog';
import type { AppDispatch, RootState } from '@redux/store';
import { updateUserProfile } from '@redux/reducers/user/user.reducer';
import './Profile.scss';

const Profile = () => {
  const { profile } = useSelector((state: RootState) => state.user);
  const { deleteDialogIsOpen, data } = useSelector((state: RootState) => state.modal);
  const [user, setUser] = useState();
  const [rendered, setRendered] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasImage, setHasImage] = useState(false);
  const [selectedBackgroundImage, setSelectedBackgroundImage] = useState('');
  const [selectedProfileImage, setSelectedProfileImage] = useState('');
  const [bgUrl, setBgUrl] = useState('');
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [displayContent, setDisplayContent] = useState('timeline');
  const [loading, setLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [userProfileData, setUserProfileData] = useState(null);
  const dispatch = useDispatch<AppDispatch>();
  const { username } = useParams();
  const [searchParams] = useSearchParams();

  const changeTabContent = (data: any) => {
    setDisplayContent(data);
  };

  const selectedFileImage = (data: any, type: string) => {
    setHasImage(true);
    if (type === 'background') {
      setSelectedBackgroundImage(data);
    } else {
      setSelectedProfileImage(data);
    }
  };

  const cancelFileSelection = () => {
    setHasImage(false);
    setSelectedBackgroundImage('');
    setSelectedProfileImage('');
    setHasError(false);
  };

  const getUserProfileByUsername = useCallback(async () => {
    try {
      const response = await userService.getUserProfileByUsername(
        username || '',
        searchParams.get('id') || '',
        searchParams.get('uId') || ''
      );
      setUser(response.data.user);
      setUserProfileData(response.data);
      setBgUrl(Utils.getImage(response.data.user?.bgImageId, response.data.user?.bgImageVersion));
      setLoading(false);

      if (response.data.user.username === profile?.username) {
        dispatch(updateUserProfile(response.data.user));
      }
    } catch (error: any) {
      if (!Utils.shouldSkipErrorNotification(error)) {
        Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
      }
    }
  }, [dispatch, searchParams, username, profile?.username]);

  const getUserImages = useCallback(async () => {
    try {
      const imagesResponse = await imageService.getUserImages(searchParams.get('id') || '');
      setGalleryImages(imagesResponse.data.images);
    } catch (error: any) {
      if (!Utils.shouldSkipErrorNotification(error)) {
        Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
      }
    }
  }, [dispatch, searchParams]);

  const saveImage = (type: string) => {
    const reader = new FileReader();

    const fileToRead = type === 'background' ? selectedBackgroundImage : selectedProfileImage;

    if (fileToRead && typeof fileToRead !== 'string') {
      reader.addEventListener('load', async () => addImage(reader.result, type), false);
      reader.readAsDataURL(Utils.renameFile(fileToRead as File));
    } else {
      addImage(fileToRead, type);
    }
  };

  const addImage = async (result: any, type: string) => {
    try {
      const url = type === 'background' ? '/images/background' : '/images/profile';
      const response = await imageService.addImage(url, result);
      if (response) {
        Utils.dispatchNotification(response.data.message, 'success', dispatch);
        setHasError(false);
        setHasImage(false);
        setSelectedBackgroundImage('');
        setSelectedProfileImage('');
        getUserProfileByUsername();
        getUserImages();
      }
    } catch (error: any) {
      setHasError(true);
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  const removeBackgroundImage = async (bgImageId: string) => {
    try {
      setBgUrl('');
      await removeImage(`/images/background/${bgImageId}`);
    } catch (error: any) {
      setHasError(true);
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  const removeImageFromGallery = async (imageId: string) => {
    try {
      dispatch(toggleDeleteDialog({ toggle: false, data: null }));
      const images = filter(galleryImages, (image: any) => image._id !== imageId);
      setGalleryImages(images);
      await removeImage(`/images/${imageId}`);
    } catch (error: any) {
      setHasError(true);
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  const removeImage = async (url: string) => {
    const response = await imageService.removeImage(url);
    Utils.dispatchNotification(response.data.message, 'success', dispatch);
  };

  useEffect(() => {
    if (!profile) return;
    if (rendered) {
      getUserProfileByUsername();
      getUserImages();
    }
    if (!rendered) setRendered(true);
  }, [rendered, getUserProfileByUsername, getUserImages]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setDisplayContent(tab);
    }
  }, [searchParams]);

  const currentUserData = (username === profile?.username ? profile : user) as any;

  return (
    <>
      {showImageModal && (
        <ImageModal image={`${imageUrl}`} onCancel={() => setShowImageModal(!showImageModal)} showArrow={false} />
      )}
      {deleteDialogIsOpen && (
        <Dialog
          title="Are you sure you want to delete this image?"
          showButtons={true}
          firstButtonText="Delete"
          secondButtonText="Cancel"
          firstBtnHandler={() => removeImageFromGallery(data || '')}
          secondBtnHandler={() => dispatch(toggleDeleteDialog({ toggle: false, data: null }))}
        />
      )}
      <div className="min-h-screen max-w-[1152px] mx-auto px-0 sm:px-4">
        <div className="flex flex-col gap-6">
          <div className="w-full h-fit">
            <BackgroundHeader
              user={currentUserData}
              loading={loading}
              hasImage={hasImage}
              hasError={hasError}
              url={bgUrl}
              onClick={changeTabContent}
              selectedFileImage={selectedFileImage}
              saveImage={saveImage}
              cancelFileSelection={cancelFileSelection}
              removeBackgroundImage={removeBackgroundImage}
              tabItems={tabItems(username === profile?.username, username === profile?.username)}
              tab={displayContent}
              hideSettings={username === profile?.username}
              galleryImages={galleryImages}
            />
          </div>
          <div className="w-full px-4 sm:px-0 pb-20 profile-content-container" key={displayContent}>
            {displayContent === 'timeline' && (
              <Timeline
                userProfileData={
                  username === profile?.username
                    ? userProfileData
                      ? { ...userProfileData, user: profile }
                      : userProfileData
                    : userProfileData
                }
                loading={loading}
              />
            )}
            {displayContent === 'followers' && <FollowerCard userData={currentUserData} />}
            {displayContent === 'gallery' && (
              <>
                {galleryImages.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 bg-white p-6 rounded-2xl shadow-xl shadow-gray-200/50 mb-24">
                    {galleryImages.map((image) => (
                      <div key={image._id} className="group relative">
                        <GalleryImage
                          showCaption={false}
                          showDelete={true}
                          imgSrc={Utils.getImage(image?.imgId, image.imgVersion)}
                          onClick={() => {
                            setImageUrl(Utils.getImage(image?.imgId, image.imgVersion));
                            setShowImageModal(!showImageModal);
                          }}
                          onRemoveImage={(event: any) => {
                            event.stopPropagation();
                            dispatch(toggleDeleteDialog({ toggle: !deleteDialogIsOpen, data: image?._id }));
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            {displayContent === 'change password' && <ChangePassword />}
            {displayContent === 'notifications' && <NotificationSettings />}
          </div>
        </div>
      </div>
    </>
  );
};
export default Profile;
