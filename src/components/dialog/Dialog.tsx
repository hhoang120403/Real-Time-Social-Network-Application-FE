import '@components/dialog/Dialog.scss';
import Button from '@components/button/Button';

interface IDialogProps {
  title: string;
  showButtons: boolean;
  firstButtonText: string;
  secondButtonText: string;
  firstBtnHandler: () => void;
  secondBtnHandler: () => void;
}

const Dialog = ({
  title,
  showButtons,
  firstButtonText,
  secondButtonText,
  firstBtnHandler,
  secondBtnHandler
}: IDialogProps) => {
  return (
    <div className="dialog-container" data-testid="dialog-container">
      <div className="dialog">
        <h4>{title}</h4>
        {showButtons && (
          <div className="btn-container">
            <Button className="btn button cancel-btn" label={secondButtonText} handleClick={secondBtnHandler} />
            <Button className="btn button confirm-btn" label={firstButtonText} handleClick={firstBtnHandler} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dialog;
