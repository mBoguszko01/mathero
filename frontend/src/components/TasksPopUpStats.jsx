import { Link } from "react-router";
import { useSelector } from "react-redux";

const TasksPopUpStats = ({
  exp,
  coins,
  correctAnswers,
  didLevelUp,
  onRetry,
}) => {
  const user = useSelector((state) => state.user.data);
  return (
    <div className="popup-background">
      <div className="popup-container">
        <h1>Gratulacje!</h1>
        <p>Udzieliłeś {correctAnswers} poprawnych odpowiedzi.</p>
        <p>
          Udało Ci się zdobyć {exp}✨ punktów doświadczenia
          {coins > 0 ? ` oraz ${coins}🪙 monet!` : ""}
        </p>
        <p>
          {didLevelUp
            ? `Gratulacje! Osiągnąłeś ${user.level} poziom doświadczenia!`
            : `Do nastętpnego poziomu brakuje Ci jeszcze ${
                user.level * 100 - user.exp
              } punktów doświadczenia.`}
        </p>
      </div>
      <button className="popup-btn popup-btn-primary" onClick={onRetry}>
        Rozwiąż jeszcze raz
      </button>
      <Link to="/app/home" className="popup-btn popup-btn-secondary">Strona główna</Link>
    </div>
  );
};
export default TasksPopUpStats;
