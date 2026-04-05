import { FaCheck, FaCircle } from 'react-icons/fa';
import doubleCheckmark from '@assets/images/double-checkmark.png';

interface ChatListBodyProps {
  data: any;
  profile: any;
}

const ChatListBody = ({ data, profile }: ChatListBodyProps) => {
  return (
    <div className="conversation-message">
      <span>{data.body}</span>
      {!data.isRead ? (
        <>
          {data.receiverUsername === profile?.username ? (
            <FaCircle className="icon" />
          ) : (
            <FaCheck className="icon not-read" />
          )}
        </>
      ) : (
        <>{data.senderUsername === profile?.username && <img src={doubleCheckmark} alt="" className="icon read" />}</>
      )}
    </div>
  );
};

export default ChatListBody;
