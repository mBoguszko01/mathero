import Badge from '../Badge/Badge';
import './BadgesRow.css';

const titleMap = {
  level: 'Łowca punktów doświadczenia',
  tasks: 'Mistrz Zadań',
  money: 'Bogacz'
};

const BadgesRow = ({ badges, title, showDetailsHandler }) => {
  return (
    <>
      <p className="badge-row-title">{titleMap[title]}</p>
      <div className="badges-row">
        {badges.map((el, index) => (
          <Badge
            badgeData={el}
            key={index}
            showDetailsHandler={showDetailsHandler}
          />
        ))}
      </div>
    </>
  );
};

export default BadgesRow;
