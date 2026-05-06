import "./Badge.css";
const Badge = ({ badgeData, showDetailsHandler }) => {
  const { id, name, isUnlocked, isHighlighted } = badgeData;
  const badgeContainerClass = isHighlighted ? "badge-container badge-highlighted" : "badge-container";
  return (
    <div
      className={badgeContainerClass}
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
