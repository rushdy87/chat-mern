import { Avatar } from './';
const Contect = ({
  userId,
  selectedUserId,
  setSelectedUserId,
  people,
  online,
}) => {
  return (
    <div
      className={`border-b border-gray-100 flex items-center ${
        userId === selectedUserId && 'bg-blue-50'
      }`}
      onClick={() => {
        setSelectedUserId(userId);
      }}
    >
      {userId === selectedUserId && (
        <div className="w-1 bg-blue-500 h-12 rounded-r-md" />
      )}
      <div className="flex items-center gap-2 cursor-pointer py-2 pl-4">
        {userId && (
          <Avatar online={online} userId={userId} username={people[userId]} />
        )}
        <span className="text-gray-800">{people[userId]}</span>
      </div>
    </div>
  );
};

export default Contect;
