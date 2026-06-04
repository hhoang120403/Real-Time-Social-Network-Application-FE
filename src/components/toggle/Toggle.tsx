import '@components/toggle/Toggle.scss';

interface IToggleProps {
  toggle: boolean;
  onClick: () => void;
}

const Toggle = ({ toggle, onClick }: IToggleProps) => {
  return (
    <label className="switch" data-testid="toggle">
      <input
        type="checkbox"
        checked={toggle}
        onChange={onClick}
      />
      <span className="slider round"></span>
    </label>
  );
};

export default Toggle;
