import { useEffect, useState } from 'react';

const useDetectOutsideClick = (ref: any, initialState: boolean) => {
  const [isActive, setIsActive] = useState(initialState);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsActive(!isActive);
      }
    };

    if (isActive) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, isActive]);

  return [isActive, setIsActive];
};

export default useDetectOutsideClick;
