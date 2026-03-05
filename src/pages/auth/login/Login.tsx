import { FaArrowRight } from 'react-icons/fa';
import './Login.scss';
import Input from '../../../components/input/Input';
import Button from '../../../components/button/Button';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authService } from '../../../services/api/auth/auth.service';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [alertType, setAlertType] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [user, setUser] = useState('');

  const loginUser = async (event: React.SubmitEvent<HTMLFormElement>) => {
    setLoading(true);
    event.preventDefault();

    try {
      const result = await authService.signIn({ username, password });

      console.log(result);

      // 1 - set logged in to true in local
      // 2 - set username in local storage
      // 3 - dispatch user to redux

      setUser(result.data.user);
      setKeepLoggedIn(keepLoggedIn);
      setHasError(false);
      setAlertType('alert-success');
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
      console.log('Navigate to streams page from login page');
      setLoading(false);
    }
  }, [loading, user]);

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
