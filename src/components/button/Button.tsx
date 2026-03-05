interface IButtonProps {
  label: string;
  className?: string;
  disabled?: boolean;
  handleClick?: () => void;
}

const Button = (props: IButtonProps) => {
  const { label, className, disabled, handleClick } = props;

  return (
    <>
      <button className={className} disabled={disabled} onClick={handleClick}>
        {label}
      </button>
    </>
  );
};

export default Button;
