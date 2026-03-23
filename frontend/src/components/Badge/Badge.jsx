import "./Badge.css";
const Badge = ({ badgeData, showDetailsHandler }) => {
  const { id, name, isUnlocked } = badgeData;

  console.log(badgeData);
  return (
    <div
      className="badge-container"
      key={id}
      onClick={() => {
        showDetailsHandler(badgeData);
      }}
    >
      <img
        src={badgeData.icon_url}
        alt={`badge ${name} icon`}
        className={isUnlocked ? "badge-unlocked" : "badge-locked"}
      />
      <span className="badge-name">{name}</span>
    </div>
  );
};
export default Badge;
