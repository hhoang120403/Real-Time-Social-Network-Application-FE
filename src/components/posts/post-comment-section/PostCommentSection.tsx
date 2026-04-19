import CommentArea from '@components/posts/comment-area/CommentArea';
import type { PostItem } from '@app-types/post';
import ReactionsAndCommentsDisplay from '../reactions/reactions-and-comments-display/ReactionsAndCommentsDisplay';

interface IPostCommentSectionProps {
  post: PostItem;
  setPosts?: React.Dispatch<React.SetStateAction<any[]>>;
}

const PostCommentSection = ({ post, setPosts }: IPostCommentSectionProps) => {
  return (
    <div data-testid="comment-section">
      <ReactionsAndCommentsDisplay post={post} />
      <CommentArea post={post} setPosts={setPosts} />
    </div>
  );
};

export default PostCommentSection;
