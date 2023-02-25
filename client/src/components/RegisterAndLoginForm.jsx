import { useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/userContext';

const RegisterAndLoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginOrRegister, setIsLoginOrRegister] = useState('Register');

  const { setUsername: setLogedInUserName, setUserId } =
    useContext(UserContext);

  const handleChange = (event) => {
    switch (event.target.name) {
      case 'username':
        setUsername(event.target.value);
        break;
      case 'password':
        setPassword(event.target.value);
        break;

      default:
        break;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const url = isLoginOrRegister === 'Login' ? '/login' : '/register';
    try {
      const { data } = await axios.post(url, { username, password });
      setLogedInUserName(username);
      setUserId(data.id);
    } catch (error) {
      console.log(error);
    }
    setUsername('');
    setPassword('');
  };

  return (
    <div className="bg-blue-50 h-screen flex items-center">
      <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="username"
          className="block w-full rounded-sm p-2 mb-2 border"
          value={username}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="password"
          className="block w-full rounded-sm p-2 mb-2 border"
          value={password}
          onChange={handleChange}
        />
        <button className="bg-blue-500 text-white block w-full rounded-sm p-2">
          {isLoginOrRegister}
        </button>
        {isLoginOrRegister === 'Register' ? (
          <div className="text-center mt-2">
            Already a member?{' '}
            <button onClick={() => setIsLoginOrRegister('Login')}>
              Login here
            </button>
          </div>
        ) : (
          <div className="text-center mt-2">
            Don't have an account?{' '}
            <button onClick={() => setIsLoginOrRegister('Register')}>
              Register
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default RegisterAndLoginForm;
