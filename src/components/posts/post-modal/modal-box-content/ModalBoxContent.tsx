import Avatar from '@components/avatar/Avatar';
import { useSelector } from 'react-redux';
import type { RootState } from '@redux/store';
import { useCallback, useEffect, useState } from 'react';
import { FaGlobe, FaCaretDown } from 'react-icons/fa';
import { privacyList } from '@services/utils/static.data';
import { find } from 'lodash';
import type { Privacy } from '@app-types/post';

interface ModalBoxContentProps {
  setTogglePrivacy: (active: boolean) => void;
  togglePrivacy: boolean;
}

const ModalBoxContent = ({ setTogglePrivacy, togglePrivacy }: ModalBoxContentProps) => {
  const { profile } = useSelector((state: RootState) => state.user);
  const { privacy } = useSelector((state: RootState) => state.post);
  const { feeling } = useSelector((state: RootState) => state.modal);
  const [selectedItem, setSelectedItem] = useState<Privacy>({
    topText: 'Public',
    subText: 'Anyone on Chatty',
    icon: <FaGlobe className="text-[12px]" />
  });

  const displayPostPrivacy = useCallback(() => {
    if (privacy) {
      const postPrivacy = find(privacyList, (data) => data.topText === privacy);
      if (postPrivacy) {
        setSelectedItem(postPrivacy);
      }
    }
  }, [privacy]);

  useEffect(() => {
    displayPostPrivacy();
  }, [displayPostPrivacy]);

  return (
    <div className="flex items-center gap-3 px-4 py-3 select-none" data-testid="modal-box-content">
      <div className="shrink-0 flex items-center justify-center">
        <Avatar
          name={profile?.username!}
          bgColor={profile?.avatarColor!}
          textColor="#ffffff"
          size={42}
          avatarSrc={profile?.profilePicture!}
        />
      </div>
      <div className="flex flex-col min-w-0 justify-center">
        <div className="flex flex-wrap items-center gap-1 leading-normal">
          <span className="font-bold text-[15px] text-[#050505]">
            {profile?.username}
          </span>
          {feeling && typeof feeling !== 'string' && (feeling as any).name && (
            <div className="flex items-center text-[15px] text-[#050505]">
              <span className="mr-1">is</span>
              <img className="w-7 h-7 object-contain mx-0.5" src={`${(feeling as any).image}`} alt="" />
              <span className="font-bold">feeling {(feeling as any).name}.</span>
            </div>
          )}
        </div>
        
        <div className="mt-0.5">
          <div
            className="inline-flex items-center gap-1 px-2 py-1 bg-[#e4e6eb] hover:bg-[#d8dadf] transition-colors rounded-md cursor-pointer text-[#050505] text-[12px] font-semibold"
            onClick={() => setTogglePrivacy(!togglePrivacy)}
          >
            <FaGlobe className="text-[11px]" />
            <span>{selectedItem.topText}</span>
            <FaCaretDown className="text-[10px]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalBoxContent;
