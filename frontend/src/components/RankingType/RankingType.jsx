const RankingType = ({name, icon, clickHandler, rankingId}) => {
  return (
    <div className="ranking-type" onClick={()=>{clickHandler(rankingId)}}>
      <p className="ranking-type-icon">{icon}</p>
      <p>{name}</p>
    </div>
  );
};
export default RankingType;
