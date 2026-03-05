import { useState, useEffect } from 'react';
import './Register.scss';
import Input from '../../../components/input/Input';
import Button from '../../../components/button/Button';
import { Utils } from '../../../services/utils/utils.service';
import { authService } from '../../../services/api/auth/auth.service';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const [hasError, setHasError] = useState(false);
  const [user, setUser] = useState(null);

  const registerUser = async (event: React.SubmitEvent<HTMLFormElement>) => {
    setLoading(true);
    event.preventDefault();
    try {
      const avatarColor = Utils.avatarColor();
      const avatarImage = Utils.generateAvatarImage(username, avatarColor);
      const result = await authService.signUp({ username, email, password, avatarColor, avatarImage });

      console.log(result);

      // 1 - set logged in to true in local
      // 2 - set username in local storage
      // 3 - dispatch user to redux

      setUser(result.data.user);
      setAlertType('alert-success');
      setHasError(false);
    } catch (error: any) {
      setLoading(false);
      setHasError(true);
      setAlertType('alert-error');
      setErrorMessage(error?.response?.data.message);
    }
  };

  useEffect(() => {
    if (loading && !user) return;
    if (user) {
      console.log('Navigate to streams page');
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
      <form className="auth-form" onSubmit={registerUser}>
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

          {/* email field */}
          <Input
            id="email"
            name="email"
            type="text"
            value={email}
            labelText="Email"
            placeholder="Enter your email"
            style={{ border: `${hasError ? '1px solid #fa9b8a' : ''}` }}
            handleChange={(e) => setEmail(e.target.value)}
          />

          {/* password field */}
          <Input
            id="password"
            name="password"
            type="password"
            value={password}
            labelText="Password"
            placeholder="Enter your password"
            style={{ border: `${hasError ? '1px solid #fa9b8a' : ''}` }}
            handleChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* button component */}
        <Button
          label={`${loading ? 'Creating account...' : 'Register'}`}
          className="auth-button button"
          disabled={!username || !email || !password || loading}
        />
      </form>
    </div>
  );
};

export default Register;
