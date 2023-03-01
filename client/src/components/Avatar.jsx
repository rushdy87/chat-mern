const Avatar = ({ userId, username, online }) => {
  if (!username) return;
  const colors = [
    'bg-red-200',
    'bg-green-200',
    'bg-purple-200',
    'bg-blue-200',
    'bg-yellow-200',
    'bg-teal-200',
  ];

  const color = colors[parseInt(userId, 16) % colors.length];
  return (
    <div
      className={`w-10 h-10 ${color} rounded-full relative flex items-center justify-center opacity-70`}
    >
      <div className="font-bold text-2xl">{username[0]}</div>
      {online ? (
        <div className="absolute w-3 h-3 bg-green-400 bottom-0 right-0 rounded-full border border-white" />
      ) : (
        <div className="absolute w-3 h-3 bg-gray-400 bottom-0 right-0 rounded-full border border-white" />
      )}
    </div>
  );
};

export default Avatar;
