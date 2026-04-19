import BasicInfoSkeleton from '@components/timeline/BasicInfoSkeleton';
import { useState } from 'react';
import {
  FaBriefcase,
  FaFacebook,
  FaGraduationCap,
  FaInstagram,
  FaMapMarkerAlt,
  FaTwitter,
  FaYoutube
} from 'react-icons/fa';
import InfoEditModal from '@components/timeline/InfoEditModal';
import { useSelector } from 'react-redux';
import type { RootState } from '@redux/store';

interface InfoDisplayProps {
  title: string;
  type: string;
  isCurrentUser: boolean;
  basicInfoPlaceholder: any;
  socialLinksPlaceholder: any;
  editableInputs: any;
  editableSocialInputs: any;
  loading: boolean;
  setEditableInputs: (editableInputs: any) => void;
  setEditableSocialInputs: (editableSocialInputs: any) => void;
  updateInfo: () => void;
}

const InfoDisplay = ({
  title,
  type,
  isCurrentUser,
  editableInputs,
  editableSocialInputs,
  loading,
  setEditableInputs,
  setEditableSocialInputs,
  updateInfo
}: InfoDisplayProps) => {
  const { profile } = useSelector((state: RootState) => state.user);
  const [showModal, setShowModal] = useState(false);
  
  // Use Redux profile if viewing own profile, otherwise fallback to passed data
  const currentBasicInfo = isCurrentUser && profile ? profile : editableInputs;
  const currentSocialInfo = isCurrentUser && profile?.social ? profile.social : editableSocialInputs;

  const { quote, work, school, location } = currentBasicInfo;
  const { instagram, twitter, facebook, youtube } = currentSocialInfo;

  return (
    <>
      {loading ? (
        <BasicInfoSkeleton />
      ) : (
        <div className="side-container" data-testid="side-container">
          <div className="side-container-header">
            <p>{title}</p>
            {isCurrentUser && (
              <p className="editBtn" data-testid="editBtn" onClick={() => setShowModal(true)}>
                Edit
              </p>
            )}
          </div>
          {showModal && (
            <InfoEditModal
              title={title}
              type={type}
              editableInputs={editableInputs}
              editableSocialInputs={editableSocialInputs}
              setEditableInputs={setEditableInputs}
              setEditableSocialInputs={setEditableSocialInputs}
              updateInfo={updateInfo}
              closeModal={() => setShowModal(false)}
            />
          )}
          {type === 'basic' && quote && (
            <div className="side-container-body">
              <div className="side-container-body-about" data-testid="quote">
                <div className="about" style={{ width: '250px' }}>{quote}</div>
              </div>
            </div>
          )}
          {((type === 'basic' && work) || (type !== 'basic' && instagram)) && (
            <div className="side-container-body">
              <div className="side-container-body-icon">
                {type === 'basic' ? <FaBriefcase className="icon" /> : <FaInstagram className="icon instagram" />}
              </div>
              <div className="side-container-body-content" data-testid="content-1">
                {type === 'basic' && work && <>Works at <b>{work}</b></>}
                {type !== 'basic' && instagram && (
                  <a className="link" href={instagram} target="_blank" rel="noreferrer noopener">
                    {instagram}
                  </a>
                )}
              </div>
            </div>
          )}

          {((type === 'basic' && school) || (type !== 'basic' && twitter)) && (
            <div className="side-container-body">
              <div className="side-container-body-icon">
                {type === 'basic' ? <FaGraduationCap className="icon" /> : <FaTwitter className="icon twitter" />}
              </div>
              <div className="side-container-body-content" data-testid="content-2">
                {type === 'basic' && school && <>Went to <b>{school}</b></>}
                {type !== 'basic' && twitter && (
                  <a className="link" href={twitter} target="_blank" rel="noreferrer noopener">
                    {twitter}
                  </a>
                )}
              </div>
            </div>
          )}

          {((type === 'basic' && location) || (type !== 'basic' && facebook)) && (
            <div className="side-container-body">
              <div className="side-container-body-icon">
                {type === 'basic' ? <FaMapMarkerAlt className="icon" /> : <FaFacebook className="icon facebook" />}
              </div>
              <div className="side-container-body-content" data-testid="content-3">
                {type === 'basic' && location && <>Lives in <b>{location}</b></>}
                {type !== 'basic' && facebook && (
                  <a className="link" href={facebook} target="_blank" rel="noreferrer noopener">
                    {facebook}
                  </a>
                )}
              </div>
            </div>
          )}

          {type !== 'basic' && youtube && (
            <div className="side-container-body">
              <div className="side-container-body-icon">
                <FaYoutube className="icon youtube" />
              </div>
              <div className="side-container-body-content" data-testid="content-4">
                <a className="link" href={youtube} target="_blank" rel="noreferrer noopener">
                  {youtube}
                </a>
              </div>
            </div>
          )}

          {((type === 'basic' && !quote && !work && !school && !location) || 
            (type !== 'basic' && !instagram && !twitter && !facebook && !youtube)) && (
            <div className="text-[#65676b] text-[14px] italic mt-2 mb-4">
              No Informations
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default InfoDisplay;
