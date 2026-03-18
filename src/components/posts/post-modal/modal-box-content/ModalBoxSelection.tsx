import Input from '@components/input/Input';
import photo from '@assets/images/photo.png';
import gif from '@assets/images/gif.png';
import feeling from '@assets/images/feeling.png';
import useDetectOutsideClick from '@hooks/useDetectOutsideClick';
import { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@redux/store';
import Feelings from '@components/feelings/Feelings';
import { ImageUtils } from '@services/utils/image-utils.service';
import { toggleGifModal } from '@redux/reducers/modal/modal.reducer';

const ModalBoxSelection = ({ setSelectedImage }: { setSelectedImage: (image: File) => void }) => {
  const { feelingsIsOpen, gifModalIsOpen } = useSelector((state: RootState) => state.modal);
  const { post } = useSelector((state: RootState) => state.post);
  const feelingsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toggleFeelings, setToggleFeelings] = useDetectOutsideClick(feelingsRef, feelingsIsOpen);
  const dispatch = useDispatch<AppDispatch>();

  const fileInputClicked = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    ImageUtils.addFileToRedux(event, post, setSelectedImage, dispatch, 'image');
  };

  return (
    <>
      {toggleFeelings && (
        <div ref={feelingsRef}>
          <Feelings />
        </div>
      )}
      <div className="modal-box-selection" data-testid="modal-box-selection">
        <ul className="post-form-list" data-testid="list-item">
          <li className="post-form-list-item image-select" onClick={fileInputClicked}>
            <Input
              name="image"
              ref={fileInputRef}
              type="file"
              className="file-input"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              onChange={handleFileChange}
            />
            <img src={photo} alt="" /> Photo
          </li>
          <li className="post-form-list-item" onClick={() => dispatch(toggleGifModal(!gifModalIsOpen))}>
            <img src={gif} alt="" /> Gif
          </li>
          <li className="post-form-list-item" onClick={() => setToggleFeelings(!toggleFeelings)}>
            <img src={feeling} alt="" /> Feeling
          </li>
        </ul>
      </div>
    </>
  );
};

export default ModalBoxSelection;
