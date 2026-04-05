import useEffectOnce from '@hooks/useEffectOnce';
import useLocalStorage from '@hooks/useLocalStorage';
import useSessionStorage from '@hooks/useSessionStorage';
import { userService } from '@services/api/user/user.service';
import { useCallback, useState } from 'react';
import type { IUser } from '@root/types/user';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@redux/store';
import { addUser } from '@redux/reducers/user/user.reducer';
import { Utils } from '@services/utils/utils.service';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@redux/store';
import { getConversationList } from '@redux/api/chat';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { profile, token } = useSelector((state: RootState) => state.user);
  const [userData, setUserData] = useState<IUser | null>(null);
  const [tokenIsValid, setTokenIsValid] = useState<boolean>(false);
  const keepLoggedIn = useLocalStorage('keepLoggedIn', 'get');
  const pageReload = useSessionStorage('pageReload', 'get');
  const [deleteStorageUsername] = useLocalStorage('username', 'delete');
  const [setLoggedIn] = useLocalStorage('keepLoggedIn', 'set');
  const [deleteSessionPageReload] = useSessionStorage('pageReload', 'delete');
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const checkUser = useCallback(async () => {
    try {
      const response = await userService.checkCurrentUser();
      if (response.data.user) {
        dispatch(getConversationList());
        setUserData(response.data.user);
        setTokenIsValid(true);
        dispatch(addUser({ token: response.data.token, profile: response.data.user }));
      }
    } catch (error) {
      setTokenIsValid(false);
      setTimeout(async () => {
        Utils.clearStore({ dispatch, deleteStorageUsername, deleteSessionPageReload, setLoggedIn });
        await userService.logoutUser();
        navigate('/');
      }, 1000);
    }
  }, [dispatch, navigate, deleteStorageUsername, deleteSessionPageReload, setLoggedIn]);

  useEffectOnce(() => {
    checkUser();
  });

  if (keepLoggedIn || (!keepLoggedIn && userData) || (profile && token) || pageReload) {
    if (!tokenIsValid) return <></>;
    else return <>{children}</>;
  } else {
    return (
      <>
        <Navigate to="/" />
      </>
    );
  }
};

export default ProtectedRoute;
