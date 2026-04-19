import Picker, { type EmojiClickData } from 'emoji-picker-react';

interface EmojiPickerProps {
  onEmojiClick: (emoji: EmojiClickData) => void;
  pickerStyle?: React.CSSProperties;
}

const EmojiPicker = ({ onEmojiClick, pickerStyle }: EmojiPickerProps) => (
  <div data-testid="emoji-container" style={pickerStyle}>
    <Picker width="100%" height="100%" onEmojiClick={(emojiData) => onEmojiClick(emojiData)} />
  </div>
);

export default EmojiPicker;
