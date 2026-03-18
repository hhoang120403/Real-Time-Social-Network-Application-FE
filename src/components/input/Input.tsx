import React, { forwardRef } from 'react';
import './Input.scss';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  labelText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { labelText, className, id, name, ...rest } = props;

  return (
    <div className="form-row">
      {labelText && (
        <label htmlFor={name} className="form-label">
          {labelText}
        </label>
      )}

      <input ref={ref} id={id} name={name} className={`form-input ${className ?? ''}`} autoComplete="off" {...rest} />
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
