import Badge from "../Badge/Badge";
import "./BadgesRow.css";

const titleMap = {
  level: "Łowca punktów doświadczenia",
  tasks: "Niepokonany rozwiązywacz zadań",
};

const BadgesRow = ({ badges, title }) => {
  return (
    <>
    <p className="badge-row-title">{titleMap[title]}</p>
      <div className="badges-row">
        {badges.map((el) => (
          <Badge badgeData={el} />
        ))}
      </div>
    </>
  );
};

export default BadgesRow;
