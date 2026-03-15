import { FaArrowRight } from 'react-icons/fa';
import '@pages/auth/login/Login.scss';
import Input from '@components/input/Input';
import Button from '@components/button/Button';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authService } from '@services/api/auth/auth.service';
import useLocalStorage from '@hooks/useLocalStorage';
import { Utils } from '@services/utils/utils.service';
import useSessionStorage from '@hooks/useSessionStorage';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@redux/store';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [alertType, setAlertType] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [user, setUser] = useState('');
  const [setStoredUsername] = useLocalStorage('username', 'set');
  const [setLoggedIn] = useLocalStorage('keepLoggedIn', 'set');
  const [pageReload] = useSessionStorage('pageReload', 'set');
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const loginUser = async (event: React.SubmitEvent<HTMLFormElement>) => {
    setLoading(true);
    event.preventDefault();

    try {
      const result = await authService.signIn({ username, password });

      setStoredUsername(username);
      setLoggedIn(keepLoggedIn);
      setHasError(false);
      setAlertType('alert-success');
      Utils.dispatchUser(result, pageReload, dispatch, setUser);
    } catch (error: any) {
      setLoading(false);
      setHasError(true);
      setAlertType('alert-error');
      setErrorMessage(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    if (loading && !user) return;
    if (user) {
      navigate('/app/social/streams');
    }
  }, [loading, user, navigate]);

  return (
    <div className="auth-inner">
      {hasError && errorMessage && (
        <div className={`alerts ${alertType}`} role="alert">
          {errorMessage}
        </div>
      )}
      <form className="auth-form" onSubmit={loginUser}>
        <div className="form-input-container">
          {/* username field */}
          <Input
            id="username"
            name="username"
            type="text"
            value={username}
            labelText="Username"
            placeholder="Enter your username"
            style={{ border: `${hasError ? '1px solid #fa9b8a' : ''}` }}
            handleChange={(e) => setUsername(e.target.value)}
          />

          {/* password field */}
          <Input
            id="password"
            name="password"
            type="password"
            value={password}
            labelText="Password"
            placeholder="Enter your password"
            style={{ border: `${hasError ? '1px solid ##fa9b8a' : ''}` }}
            handleChange={(e) => setPassword(e.target.value)}
          />

          <label className="checkmark-container" htmlFor="checkbox">
            <Input
              id="checkbox"
              type="checkbox"
              name="checkbox"
              value={keepLoggedIn}
              handleChange={() => setKeepLoggedIn(!keepLoggedIn)}
            />
            Keep me signed in
          </label>
        </div>

        {/* button component */}
        <Button
          label={loading ? 'Signing in...' : 'Login'}
          className="auth-button button"
          disabled={loading || !username || !password}
        />

        {/* forgot password */}
        <Link to="/forgot-password">
          <span className="forgot-password">
            Forgot password? <FaArrowRight className="arrow-right" />
          </span>
        </Link>
      </form>
    </div>
  );
};

export default Login;
