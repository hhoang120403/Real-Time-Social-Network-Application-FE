import Avatar from '@components/avatar/Avatar';
import { timeAgo } from '@services/utils/timeago.utils';
import { FaTrash } from 'react-icons/fa';
import '@components/gallery-image/GalleryImage.scss';

interface IGalleryImageProps {
  post?: any;
  showCaption: boolean;
  showDelete: boolean;
  imgSrc: string;
  onClick: () => void;
  onRemoveImage?: (event: any) => void;
}

const GalleryImage = ({ post, showCaption, showDelete, imgSrc, onClick, onRemoveImage }: IGalleryImageProps) => {
  return (
    <>
      <figure className="gallery-image" onClick={onClick} data-testid="gallery">
        <div className="gallery-image__crop">
          <img className="gallery-image__media" src={`${imgSrc}`} alt="" />
          {showDelete && (
            <span className="gallery-image__delete" onClick={onRemoveImage}>
              <FaTrash />
            </span>
          )}
        </div>
        {showCaption && (
          <>
            <figcaption className="gallery-image__caption">
              <div className="figure-header">
                <Avatar
                  name={post?.username}
                  bgColor={post?.avatarColor}
                  textColor="#ffffff"
                  size={40}
                  avatarSrc={post?.profilePicture}
                />
                <div className="figure-body">
                  <span className="figure-title">{post?.username}</span>
                  <span className="figure-date">{timeAgo.transform(post?.createdAt)}</span>
                </div>
              </div>
            </figcaption>
          </>
        )}
      </figure>
    </>
  );
};

export default GalleryImage;
