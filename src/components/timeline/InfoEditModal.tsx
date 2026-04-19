import ReactionWrapper from '@components/posts/modal-wrappers/reaction-wrapper/ReactionWrapper';
import Button from '@components/button/Button';
import '@components/timeline/InfoEditModal.scss';

interface InfoEditModalProps {
  title: string;
  type: string;
  editableInputs: any;
  editableSocialInputs: any;
  setEditableInputs: (inputs: any) => void;
  setEditableSocialInputs: (inputs: any) => void;
  updateInfo: () => void;
  closeModal: () => void;
}

const InfoEditModal = ({
  title,
  type,
  editableInputs,
  editableSocialInputs,
  setEditableInputs,
  setEditableSocialInputs,
  updateInfo,
  closeModal
}: InfoEditModalProps) => {
  const { quote, work, school, location } = editableInputs;
  const { instagram, twitter, facebook, youtube } = editableSocialInputs;

  return (
    <ReactionWrapper closeModal={closeModal}>
      <div className="info-edit-modal-header">
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <div className="info-edit-modal-body p-6">
        {type === 'basic' ? (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-700">Quote</label>
              <textarea
                className="w-full border border-gray-200 rounded-lg p-3 focus:border-primary outline-none text-[15px] resize-none h-24"
                placeholder="Add your quote"
                value={quote}
                onChange={(e) => setEditableInputs({ ...editableInputs, quote: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-700">Work</label>
              <input
                className="w-full border border-gray-200 rounded-lg p-3 focus:border-primary outline-none text-[15px]"
                type="text"
                placeholder="Add company name"
                value={work}
                onChange={(e) => setEditableInputs({ ...editableInputs, work: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-700">School</label>
              <input
                className="w-full border border-gray-200 rounded-lg p-3 focus:border-primary outline-none text-[15px]"
                type="text"
                placeholder="Add school name"
                value={school}
                onChange={(e) => setEditableInputs({ ...editableInputs, school: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-700">Location</label>
              <input
                className="w-full border border-gray-200 rounded-lg p-3 focus:border-primary outline-none text-[15px]"
                type="text"
                placeholder="Add city and country names"
                value={location}
                onChange={(e) => setEditableInputs({ ...editableInputs, location: e.target.value })}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
             <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-700 text-[14px]">Instagram</label>
              <input
                className="w-full border border-gray-200 rounded-lg p-3 focus:border-primary outline-none text-[15px]"
                type="text"
                placeholder="Add instagram profile link"
                value={instagram}
                onChange={(e) => setEditableSocialInputs({ ...editableSocialInputs, instagram: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-700 text-[14px]">Twitter</label>
              <input
                className="w-full border border-gray-200 rounded-lg p-3 focus:border-primary outline-none text-[15px]"
                type="text"
                placeholder="Add twitter profile link"
                value={twitter}
                onChange={(e) => setEditableSocialInputs({ ...editableSocialInputs, twitter: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-700 text-[14px]">Facebook</label>
              <input
                className="w-full border border-gray-200 rounded-lg p-3 focus:border-primary outline-none text-[15px]"
                type="text"
                placeholder="Add facebook profile link"
                value={facebook}
                onChange={(e) => setEditableSocialInputs({ ...editableSocialInputs, facebook: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-700 text-[14px]">Youtube</label>
              <input
                className="w-full border border-gray-200 rounded-lg p-3 focus:border-primary outline-none text-[15px]"
                type="text"
                placeholder="Add youtube profile link"
                value={youtube}
                onChange={(e) => setEditableSocialInputs({ ...editableSocialInputs, youtube: e.target.value })}
              />
            </div>
          </div>
        )}
        <div className="mt-8 flex justify-end gap-3">
          <Button
            label="Cancel"
            className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
            handleClick={closeModal}
          />
          <Button
            label="Save Changes"
            className="px-6 py-2 rounded-lg bg-primary text-white font-bold hover:opacity-90 transition-colors"
            handleClick={() => {
              updateInfo();
              closeModal();
            }}
          />
        </div>
      </div>
    </ReactionWrapper>
  );
};

export default InfoEditModal;
