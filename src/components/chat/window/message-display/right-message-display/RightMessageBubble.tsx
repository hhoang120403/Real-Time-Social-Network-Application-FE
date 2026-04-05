interface RightMessageBubbleProps {
  chat: any;
  showImageModal: boolean;
  setImageUrl: (imageUrl: string) => void;
  setShowImageModal: (showImageModal: boolean) => void;
}

const RightMessageBubble = ({ chat, showImageModal, setImageUrl, setShowImageModal }: RightMessageBubbleProps) => {
  return (
    <>
      {chat?.body !== 'Sent a GIF' && chat?.body !== 'Sent an Image' && (
        <div className="message-bubble right-message-bubble">{chat?.body}</div>
      )}
      {chat?.selectedImage && (
        <div
          className="message-image"
          style={{ marginTop: `${chat?.body && chat?.body !== 'Sent an Image' ? '5px' : ''}` }}
        >
          <img
            src={chat?.selectedImage}
            onClick={() => {
              setImageUrl(chat?.selectedImage);
              setShowImageModal(!showImageModal);
            }}
            alt=""
          />
        </div>
      )}
      {chat?.gifUrl && (
        <div className="message-gif">
          <img
            src={chat?.gifUrl}
            onClick={() => {
              setImageUrl(chat?.gifUrl);
              setShowImageModal(!showImageModal);
            }}
            alt=""
          />
        </div>
      )}
    </>
  );
};

export default RightMessageBubble;
