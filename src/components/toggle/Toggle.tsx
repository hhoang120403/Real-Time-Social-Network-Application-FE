import { useState } from 'react';
import '@components/toggle/Toggle.scss';

interface IToggleProps {
  toggle: boolean;
  onClick: () => void;
}

const Toggle = ({ toggle, onClick }: IToggleProps) => {
  const [toggleValue, setToggleValue] = useState(toggle);

  return (
    <label className="switch" htmlFor="switch" data-testid="toggle" onClick={onClick}>
      <input
        id="switch"
        type="checkbox"
        checked={toggleValue}
        onChange={() => setToggleValue((toggleValue) => !toggleValue)}
      />
      <span className="slider round"></span>
    </label>
  );
};

export default Toggle;
