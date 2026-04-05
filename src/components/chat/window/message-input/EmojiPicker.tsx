import Picker, { type EmojiClickData } from 'emoji-picker-react';

interface EmojiPickerProps {
  onEmojiClick: (emoji: EmojiClickData) => void;
  pickerStyle?: React.CSSProperties;
}

const EmojiPicker = ({ onEmojiClick, pickerStyle }: EmojiPickerProps) => (
  <div className="emoji-picker" data-testid="emoji-container" style={pickerStyle}>
    <Picker onEmojiClick={(emojiData) => onEmojiClick(emojiData)} />
  </div>
);

export default EmojiPicker;
