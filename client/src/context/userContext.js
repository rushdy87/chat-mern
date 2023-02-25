import { useState, useEffect, createContext } from 'react';
import axios from 'axios';

export const UserContext = createContext({});

export const UserContextProvider = ({ children }) => {
  const [username, setUsername] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    axios
      .get('/profile')
      .then(({ data }) => {
        setUsername(data.username);
        setUserId(data.userId);
      })
      .catch((error) => console.log(error));
  }, []);

  const value = { username, setUsername, userId, setUserId };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
