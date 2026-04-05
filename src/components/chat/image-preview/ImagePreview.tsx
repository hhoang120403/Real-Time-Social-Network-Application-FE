import { FaTimes } from 'react-icons/fa';
import '@components/chat/image-preview/ImagePreview.scss';

interface ImagePreviewProps {
  image: string;
  onRemoveImage: () => void;
}

const ImagePreview = ({ image, onRemoveImage }: ImagePreviewProps) => {
  return (
    <div className="image-preview-container" data-testid="image-preview">
      <div className="image-preview">
        <img className="img" src={image} alt="" />
        <FaTimes className="icon" onClick={onRemoveImage} />
      </div>
    </div>
  );
};

export default ImagePreview;
