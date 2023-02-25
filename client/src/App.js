import { useContext } from 'react';
import axios from 'axios';
import { UserContext } from './context/userContext';
import { Chat, RegisterAndLoginForm } from './components';

function App() {
  const { username } = useContext(UserContext);

  axios.defaults.baseURL = 'http://localhost:3001';
  axios.defaults.withCredentials = true;

  return username ? <Chat /> : <RegisterAndLoginForm />;
}

export default App;
