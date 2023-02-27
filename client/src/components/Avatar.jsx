const Avatar = ({ username }) => {
  if (!username) return;
  const colors = [
    'bg-red-200',
    'bg-green-200',
    'bg-purple-200',
    'bg-blue-200',
    'bg-yellow-200',
    'bg-teal-200',
  ];

  const color = colors[Math.floor(Math.random() * 6)];
  return (
    <div
      className={`w-8 h-8 ${color} rounded-full flex items-center justify-center opacity-70`}
    >
      {username[0]}
    </div>
  );
};

export default Avatar;
