import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import TasksPopUpStats from "../components/TasksPopUpStats";
import "../styles/Tasks.css";
import { useDispatch } from "react-redux";
import { updateStreak, updateInfoAfterSession } from "../store/userSlice";

const initialStats = { exp: 0, coins: 0, correctAnswers: 0 };

const Tasks = () => {
  const [params] = useSearchParams();
  const dispatch = useDispatch();

  const classLevel = params.get("class");
  const topic = params.get("topic");
  const subtopic = params.get("subtopic");

  const [tasks, setTasks] = useState(null);
  const [possibleAswers, setPossibleAnswers] = useState([]);
  const [countAnswered, setCountAnswered] = useState(0);
  const [countCorrect, setCountCorrect] = useState(0);
  const [question, setQuestion] = useState("");
  const [showCorrect, setShowCorrect] = useState(false);
  const [wrongAnswer, setWrongAnswer] = useState(null);
  const [isLocked, setIsLocked] = useState(false);

  const [stats, setStats] = useState(initialStats);

  const [info, setInfo] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [sessionResults, setSessionResults] = useState([]);

  useEffect(() => {
    fetch(
      `${
        import.meta.env.VITE_API_URL
      }/api/tasks/random?class=${classLevel}&topic=${topic}&subtopic=${subtopic}`,
    )
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch(console.error);
  }, [classLevel, topic, subtopic, reloadKey]);

  useEffect(() => {
    setQuestion(tasks?.tasks[countAnswered]?.question || "");
    setPossibleAnswers(tasks?.tasks[countAnswered]?.possible_answers || []);
  }, [tasks, countAnswered]);

  useEffect(() => {
    setIsLocked(false);
    setWrongAnswer(null);
  }, [question]);

  if (!tasks) return <p>Pobieranie zadań...</p>;

  const selectAnswerHandler = (ans) => {
    if (isLocked) return;
    setIsLocked(true);

    const currentTask = tasks.tasks[countAnswered];
    const correctAnswer = currentTask.correct_answer;

    const isCorrect = ans == correctAnswer;

    setSessionResults((prev) => [
      ...prev,
      { task_id: currentTask.id, correct: isCorrect },
    ]);

    if (isCorrect) {
      setShowCorrect(true);
      setInfo("Super! To prawidłowa odpowiedź");

      setTimeout(() => {
        setShowCorrect(false);
        setCountCorrect((prev) => prev + 1);

        if (countAnswered < 4) {
          setCountAnswered((prev) => prev + 1);
        } else {
          finalizeSession([
            ...sessionResults,
            { task_id: currentTask.id, correct: isCorrect },
          ]);
        }
      }, 100);
    } else {
      setWrongAnswer(ans);
      setShowCorrect(true);
      setInfo(`Niestety. Prawidłowa odpowiedź to: ${correctAnswer}`);

      setTimeout(() => {
        setShowCorrect(false);
        setWrongAnswer(null);

        if (countAnswered < 4) {
          setCountAnswered((prev) => prev + 1);
        } else {
          finalizeSession([
            ...sessionResults,
            { task_id: currentTask.id, correct: isCorrect },
          ]);
        }
      }, 100);
    }
  };

  const finalizeSession = async (results) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("Brak tokenu – użytkownik niezalogowany?");
        setShowSummary(true);
        return;
      }

      const payload = {
        class_level: Number(classLevel),
        category_id: Number(topic),
        subcategory_id: Number(subtopic),
        results: results ?? sessionResults,
      };

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/tasks/session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        console.error("Błąd zapisu sesji:", data);
      } else {
        console.log("Sesja zapisana:", data);

        if (data.user.didUpdateStreak) {
          dispatch(updateStreak());
        }

        setStats({
          exp: data?.earned?.exp || 0,
          coins: data?.earned?.coins || 0,
          correctAnswers: data?.earned?.correctAnswers || 0,
        });
        dispatch(
          updateInfoAfterSession({
            exp: data?.earned?.exp || 0,
            coins: data?.earned?.coins || 0,
          }),
        );
      }
    } catch (err) {
      console.error("Błąd połączenia z backendem:", err);
    } finally {
      setShowSummary(true);
    }
  };

  const resetSession = () => {
    setTasks(null);
    setPossibleAnswers([]);
    setCountAnswered(0);
    setCountCorrect(0);
    setQuestion("");
    setShowCorrect(false);
    setWrongAnswer(null);
    setIsLocked(false);

    setStats({ ...initialStats });

    setInfo(null);
    setShowSummary(false);
    setSessionResults([]);
    setReloadKey((prev) => prev + 1);
  };

  return (
    <>
      {showSummary && (
        <TasksPopUpStats
          exp={stats.exp}
          coins={stats.coins}
          correctAnswers={stats.correctAnswers}
          onRetry={resetSession}
        />
      )}

      {showCorrect && (
        <div className="tasks-correct-answer">
          <span>{info}</span>
        </div>
      )}

      <div className="tasks-wrapper">
        <div className="tasks-container">
          <progress value={countAnswered + 1} max="5" />
          <div className="tasks-question-container">
            <span className="tasks-question">{question}</span>
          </div>
          <div className="tasks-answers-grid">
            {possibleAswers.map((ans, index) => (
              <div
                key={index}
                className={
                  wrongAnswer == ans
                    ? "tasks-answer tasks-wrong-answer"
                    : "tasks-answer"
                }
                onClick={() => selectAnswerHandler(ans)}
              >
                {ans}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Tasks;
