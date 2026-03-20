import "../styles/Ranking.css";
import RankingType from "../components/RankingType/RankingType";
import { useNavigate } from "react-router-dom";

const rankingsArray = [
  { id: "exp", name: "Najwyższy poziom doświadczenia", icon: "✨" },
  { id: "streak", name: "Najdłuższa seria", icon: "🔥" },
  { id: "coins", name: "Najwięcej zarobionych monet", icon: "🤑" },
];

const Ranking = () => {
  const navigate = useNavigate();
  function openRankingHandler(id) {
    console.log(id);
    navigate(`/app/ranking-details?ranking-type-id=${id}`);
  }
  return (
    <div className="ranking-types-list">
      {rankingsArray.map((rankingType) => (
        <RankingType
          name={rankingType.name}
          icon={rankingType.icon}
          rankingId={rankingType.id}
          clickHandler={openRankingHandler}
        />
      ))}
    </div>
  );
};
export default Ranking;
