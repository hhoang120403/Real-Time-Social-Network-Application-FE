import React from 'react';
import './Input.scss';

interface IInputProps {
  id?: string;
  name: string;
  type: string;
  value?: any;
  className?: string;
  labelText?: string;
  placeholder?: string;
  handleChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input = (props: IInputProps) => {
  const { id, name, type, value, className, labelText, placeholder, handleChange } = props;

  return (
    <>
      <div className="form-row">
        {labelText && (
          <label htmlFor={id} className="form-label">
            {labelText}
          </label>
        )}

        <input
          id={id}
          type={type}
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`form-input ${className}`}
          autoComplete="off"
        />
      </div>
    </>
  );
};

export default Input;
