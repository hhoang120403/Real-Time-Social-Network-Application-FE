import AddPost from '@components/posts/post-modal/post-add/AddPost';
import type { RootState } from '@redux/store';
import { useSelector } from 'react-redux';

const SharePostModal = () => {
  const { isOpen, type } = useSelector((state: RootState) => state.modal);

  if (!isOpen || type !== 'share') {
    return null;
  }

  return <AddPost selectedImage={null} />;
};

export default SharePostModal;
