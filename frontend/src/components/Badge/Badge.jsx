import "./Badge.css";
const Badge = ({ badgeData, isUnlocked }) => {
  const {
    id,
    name,
    description,
    icon_url,
    requirement_type,
    requirement_value,
    value,
    category_id,
    rarity,
  } = badgeData;

  return (
    <div className="badge-container" key={id}>
      <img
        src={icon_url}
        alt={`badge ${name} icon`}
        className={isUnlocked ? "badge-unlocked" : "badge-locked"}
      />
      <span className="badge-name">{name}</span>
      <span className="badge-details">
        {value} z {requirement_value} {requirement_type}
      </span>
    </div>
  );
}
export default Badge;
