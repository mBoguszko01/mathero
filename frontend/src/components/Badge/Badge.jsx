import "./Badge.css";
const Badge = ({ badgeData, showDetailsHandler }) => {
  const {
    id,
    name,
    isUnlocked
  } = badgeData;
  return (
    <div className="badge-container" key={id} onClick={()=>{showDetailsHandler(badgeData)}}>
      <img
        src={"../avatar1.png"}
        alt={`badge ${name} icon`}
        className={isUnlocked ? "badge-unlocked" : "badge-locked"}
      />
      <span className="badge-name">{name}</span>
    </div>
  );
}
export default Badge;
