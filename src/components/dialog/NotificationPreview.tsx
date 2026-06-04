import Button from '@components/button/Button';
import { reactionsMap } from '@services/utils/static.data';
import '@components/dialog/NotificationPreview.scss';
import type { ReactionType } from '@app-types/reaction';

export interface INotificationPreview {
  title: string;
  post: string;
  imgUrl: string;
  comment: string;
  reaction?: ReactionType;
  senderName: string;
  secondButtonText: string;
  secondBtnHandler: () => void;
  commentImage?: string;
  commentGif?: string;
}

const NotificationPreview = ({
  title,
  post,
  imgUrl,
  comment,
  reaction,
  senderName,
  secondButtonText,
  secondBtnHandler,
  commentImage,
  commentGif
}: INotificationPreview) => {
  return (
    <div 
      className="notification-preview-container" 
      data-testid="notification-preview"
      onClick={secondBtnHandler}
    >
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <h4>{title}</h4>
        <div className="dialog-body">
          
          {/* Post Card */}
          {(post || imgUrl) && (
            <div className="preview-card post-card">
              <div className="card-label">Original Post</div>
              {post && <span className="dialog-body-post">{post}</span>}
              {imgUrl && <img className="dialog-body-img" src={imgUrl} alt="Post" />}
            </div>
          )}

          {/* Comment Card */}
          {(comment || commentImage || commentGif) && (
            <div className="preview-card comment-card">
              <div className="card-label">{senderName}'s Comment</div>
              {comment && <span className="dialog-body-comment">{comment}</span>}
              {commentImage && <img className="dialog-body-comment-img" src={commentImage} alt="Comment visual" />}
              {commentGif && <img className="dialog-body-comment-gif" src={commentGif} alt="Comment GIF" />}
            </div>
          )}

          {/* Reaction Card */}
          {reaction && (
            <div className="preview-card reaction-card" data-testid="reaction">
              <div className="dialog-body-reaction">
                <span className="dialog-body-reaction-text">{senderName} reacted with</span>{' '}
                <img className="reaction-img" src={`${reactionsMap[`${reaction}`]}`} alt="" />
              </div>
            </div>
          )}

        </div>
        <div className="btn-container">
          <Button className="button cancel-btn" label={secondButtonText} handleClick={secondBtnHandler} />
        </div>
      </div>
    </div>
  );
};

export default NotificationPreview;
