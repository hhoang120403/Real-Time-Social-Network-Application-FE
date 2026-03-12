type SessionType = 'get' | 'set' | 'delete';

const useSessionStorage = (key: string, type: SessionType) => {
  try {
    if (type === 'get') {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }

    if (type === 'set') {
      const setValue = (value: unknown) => {
        sessionStorage.setItem(key, JSON.stringify(value));
      };
      return [setValue] as const;
    }

    if (type === 'delete') {
      const deleteValue = () => {
        sessionStorage.removeItem(key);
      };
      return [deleteValue] as const;
    }
  } catch (error) {
    console.error(error);
  }
};

export default useSessionStorage;
