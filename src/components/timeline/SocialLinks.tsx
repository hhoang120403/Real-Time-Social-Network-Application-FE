import BasicInfoSkeleton from '@components/timeline/BasicInfoSkeleton';
import InfoDisplay from '@components/timeline/InfoDisplay';
import type { AppDispatch } from '@redux/store';
import { userService } from '@services/api/user/user.service';
import { Utils } from '@services/utils/utils.service';
import { useDispatch } from 'react-redux';
import { updateUserProfile } from '@redux/reducers/user/user.reducer';

interface SocialLinksProps {
  editableSocialInputs: any;
  username: string;
  profile: any;
  loading: boolean;
  setEditableSocialInputs: (data: any) => void;
}

const SocialLinks = ({
  editableSocialInputs,
  username,
  profile,
  loading,
  setEditableSocialInputs
}: SocialLinksProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const editableInputs = {
    quote: '',
    work: '',
    school: '',
    location: ''
  };
  const editableSocialLinks = editableSocialInputs ?? {
    instagram: '',
    twitter: '',
    facebook: '',
    youtube: ''
  };
  const basicInfoPlaceholder = {
    quotePlacehoder: '',
    workPlacehoder: '',
    schoolPlacehoder: '',
    locationPlacehoder: ''
  };
  const socialLinksPlaceholder = {
    instagramPlacehoder: 'Add your Instagram account link',
    twitterPlacehoder: 'Add your Twitter account link',
    facebookPlacehoder: 'Add your Facebook account link',
    youtubePlacehoder: 'Add your YouTube account link'
  };

  const updateSocialLinks = async () => {
    try {
      const response = await userService.updateSocialLinks(editableSocialInputs);
      Utils.dispatchNotification(response.data.message, 'success', dispatch);
      dispatch(updateUserProfile({ social: editableSocialInputs }));
    } catch (error: any) {
      Utils.dispatchNotification(error.response?.data?.message, 'error', dispatch);
    }
  };

  return (
    <>
      {loading ? (
        <BasicInfoSkeleton />
      ) : (
        <InfoDisplay
          title="Social Links"
          type="social"
          isCurrentUser={username === profile?.username}
          basicInfoPlaceholder={basicInfoPlaceholder}
          socialLinksPlaceholder={socialLinksPlaceholder}
          editableInputs={editableInputs}
          editableSocialInputs={editableSocialLinks}
          loading={loading}
          setEditableInputs={() => {}}
          setEditableSocialInputs={setEditableSocialInputs}
          updateInfo={updateSocialLinks}
        />
      )}
    </>
  );
};

export default SocialLinks;
