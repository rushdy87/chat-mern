import { useState, useEffect, useCallback, useContext, useRef } from 'react';
import _ from 'lodash';
import { UserContext } from '../context/userContext';
import { Logo, Contect } from './';
import axios from 'axios';

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState(null);
  const [offlinePeople, setOfflinePeople] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const { userId: id } = useContext(UserContext);

  const ref = useRef();

  const showOnline = useCallback((peopleArray) => {
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  }, []);

  const handleMessage = useCallback(
    (event) => {
      const messageData = JSON.parse(event.data);
      // console.log(event, messageData);
      if ('online' in messageData) {
        showOnline(messageData.online);
      } else if ('text' in messageData) {
        setMessages((prev) => {
          return _.uniqBy([...prev, { ...messageData }], '_id');
        });
      }
    },
    [showOnline]
  );

  useEffect(() => {
    connectToWebSocket();
  }, []);

  const connectToWebSocket = () => {
    const newWs = new WebSocket('ws://localhost:3001');

    setWs(newWs);

    newWs.addEventListener('message', handleMessage);
    newWs.addEventListener('close', () => {
      setTimeout(() => {
        console.log('Disconnected.. Tring to reconnect. ');
        connectToWebSocket();
      }, 1000);
    });
  };

  useEffect(() => {
    axios.get('/users').then(({ data }) => {
      let offlinePeopleArray = [];
      if (onlinePeople) {
        offlinePeopleArray = data
          .filter((p) => p._id !== id)
          .filter((p) => !Object.keys(onlinePeople).includes(p._id));
      } else {
        offlinePeopleArray = data;
      }
      const people = {};
      offlinePeopleArray.forEach(({ _id, username }) => {
        people[_id] = username;
      });
      setOfflinePeople(people);
    });
  }, [onlinePeople, id]);

  useEffect(() => {
    if (selectedUserId) {
      axios
        .get(`/messages/${selectedUserId}`)
        .then(({ data }) => {
          setMessages(data);
        })
        .catch((error) => console.log(error));
    }
  }, [selectedUserId]);

  const hedleSendSubmit = (event) => {
    event.preventDefault();
    if (event.target[0].value) {
      const newMess = {
        _id: Date.now(),
        sender: id,
        recipient: selectedUserId,
        text: event.target[0].value,
      };
      ws.send(JSON.stringify(newMess));
      setNewMessage('');
      setMessages((prev) => [...prev, newMess]);
    }
    ref.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  const renderOnlineUsers =
    onlinePeople &&
    Object.keys(onlinePeople).map((userId) => {
      if (id === userId) return null;
      return (
        <Contect
          userId={userId}
          selectedUserId={selectedUserId}
          setSelectedUserId={setSelectedUserId}
          people={onlinePeople}
          key={userId}
          online={true}
        />
      );
    });

  const renderOfflineUsers =
    offlinePeople &&
    Object.keys(offlinePeople).map((userId) => {
      return (
        <Contect
          userId={userId}
          selectedUserId={selectedUserId}
          setSelectedUserId={setSelectedUserId}
          people={offlinePeople}
          key={userId}
        />
      );
    });

  return (
    <div className="flex h-screen">
      <div className="bg-white w-1/4 pt-4">
        <Logo />
        {renderOnlineUsers}
        <div>
          <h2 className="p-2 text-2xl border bg-blue-600 w-1/3 text-center text-yellow-100">
            Offline:
          </h2>
          {renderOfflineUsers}
        </div>
      </div>

      <div className="flex flex-col bg-blue-50 w-3/4 p-3">
        <div className="flex-grow">
          {!selectedUserId ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-300">
                &larr; selecte Person from the sidebar
              </div>
            </div>
          ) : (
            <div className="relative h-full">
              <div className="overflow-y-scroll absolute inset-0">
                {messages.map((m, index) => (
                  <div
                    key={index}
                    className={`${
                      m.sender === id ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div
                      className={`inline-block text-left p-2 my-2 rounded-md text-sm ${
                        m.sender === id
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-500'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={ref}></div>
              </div>
            </div>
          )}
        </div>
        {selectedUserId && (
          <form className="flex gap-2" onSubmit={hedleSendSubmit}>
            <input
              type="text"
              className="bg-white border p-2 flex-grow rounded-sm"
              placeholder="type your message here"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-500 p-3 text-white rounded-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Chat;
