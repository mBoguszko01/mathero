const RankingUser = ({ rankingUser, index, rankingDetails, columnsAmmountStyle }) => {
  const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉";
  return (
    <div className={`ranking-user-container ${columnsAmmountStyle}`}>
      <p>{index + 1}</p>
      <div className="ranking-user-info">
        <img src={`${rankingUser.avatar}`} alt="users profile picture" />
        <p>{rankingUser.username}</p>
      </div>
      {rankingDetails.map(detail => detail)}
      <p className="ranking-user-medal">{medal}</p>
    </div>
  );
};
export default RankingUser;
