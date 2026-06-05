import { useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import TasksPopUpStats from "../components/TasksPopUpStats";
import "../styles/Tasks.css";
import { useDispatch } from "react-redux";
import { updateStreak, updateInfoAfterSession } from "../store/userSlice";

const initialStats = { exp: 0, coins: 0, correctAnswers: 0, leveledUp: false };

const Tasks = () => {
  const [params] = useSearchParams();
  const dispatch = useDispatch();

  const classLevel = params.get("class");
  const topic = params.get("topic");
  const subtopic = params.get("subtopic");

  const [tasks, setTasks] = useState(null);
  const [possibleAswers, setPossibleAnswers] = useState([]);
  const [countAnswered, setCountAnswered] = useState(0);
  const [, setCountCorrect] = useState(0);
  const [question, setQuestion] = useState("");
  const [showCorrect, setShowCorrect] = useState(false);
  const [wrongAnswer, setWrongAnswer] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [isLocked, setIsLocked] = useState(false);

  const [stats, setStats] = useState(initialStats);

  const [info, setInfo] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [sessionResults, setSessionResults] = useState([]);
  const sessionStartRef = useRef(null);
  const questionStartRef = useRef(null);
  const reactionTimesRef = useRef([]);

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
    if (tasks?.tasks[countAnswered]) {
      const now = Date.now();
      if (!sessionStartRef.current) {
        sessionStartRef.current = now;
      }
      questionStartRef.current = now;
    }
  }, [tasks, countAnswered]);

  useEffect(() => {
    setIsLocked(false);
    setWrongAnswer(null);
    setCorrectAnswer(null);
  }, [question]);

  if (!tasks) return <p>Pobieranie zadań...</p>;

  const tasksList = tasks.tasks || [];
  const totalTasks = tasksList.length;

  const selectAnswerHandler = (ans) => {
    if (isLocked || totalTasks === 0) return;
    setIsLocked(true);
    const answeredAt = Date.now();
    const reactionTimeMs = questionStartRef.current
      ? answeredAt - questionStartRef.current
      : 0;
    reactionTimesRef.current = [...reactionTimesRef.current, reactionTimeMs];

    const currentTask = tasksList[countAnswered];
    if (!currentTask) return;

    const correctAnswer = currentTask.correct_answer;

    const isCorrect = ans == correctAnswer;

    const updatedResults = [
      ...sessionResults,
      { task_id: currentTask.id, correct: isCorrect },
    ];

    setSessionResults(updatedResults);

    if (isCorrect) {
      setCorrectAnswer(ans);
      setShowCorrect(true);
      setInfo("Super! To prawidłowa odpowiedź");

      setTimeout(() => {
        setShowCorrect(false);
        setCorrectAnswer(null);
        setCountCorrect((prev) => prev + 1);

        if (countAnswered < totalTasks - 1) {
          setCountAnswered((prev) => prev + 1);
        } else {
          finalizeSession(updatedResults);
        }
      }, 1500);
    } else {
      setWrongAnswer(ans);
      setShowCorrect(true);
      setInfo(`Niestety. Prawidłowa odpowiedź to: ${correctAnswer}`);

      setTimeout(() => {
        setShowCorrect(false);
        setWrongAnswer(null);

        if (countAnswered < totalTasks - 1) {
          setCountAnswered((prev) => prev + 1);
        } else {
          finalizeSession(updatedResults);
        }
      }, 1500);
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

      const sessionDurationSeconds = sessionStartRef.current
        ? Math.round((Date.now() - sessionStartRef.current) / 1000)
        : 0;
      const avgReactionTimeSeconds =
        reactionTimesRef.current.length > 0
          ? Number(
              (
                reactionTimesRef.current.reduce((sum, time) => sum + time, 0) /
                reactionTimesRef.current.length /
                1000
              ).toFixed(2),
            )
          : 0;

      const payload = {
        class_level: Number(classLevel),
        category_id: Number(topic),
        subcategory_id: Number(subtopic),
        results: results ?? sessionResults,
        device_type: getDeviceType(),
        time_of_day: getTimeOfDay(),
        session_duration: sessionDurationSeconds,
        avg_reaction_time: avgReactionTimeSeconds,
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
        const leveledUp =  data?.earned?.leveledUp;
        setStats({
          exp: data?.earned?.exp || 0,
          coins: data?.earned?.coins || 0,
          correctAnswers: data?.earned?.correctAnswers || 0,
          leveledUp
        });
        dispatch(
          updateInfoAfterSession({
            exp: data?.earned?.exp || 0,
            coins: data?.earned?.coins || 0,
            leveledUp
          })
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
    setCorrectAnswer(null);
    setIsLocked(false);

    setStats({ ...initialStats });

    setInfo(null);
    setShowSummary(false);
    setSessionResults([]);
    sessionStartRef.current = null;
    questionStartRef.current = null;
    reactionTimesRef.current = [];
    setReloadKey((prev) => prev + 1);
  };

  return (
    <>
      {showSummary && (
        <TasksPopUpStats
          exp={stats.exp}
          coins={stats.coins}
          correctAnswers={stats.correctAnswers}
          leveledUp={stats.leveledUp}
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
          <progress value={Math.min(countAnswered + 1, totalTasks)} max={totalTasks} />
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
                    : correctAnswer == ans
                      ? "tasks-answer tasks-correct-selected-answer"
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

function getDeviceType() {
  const width = window.innerWidth;

  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

function getTimeOfDay() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 22) return "evening";
  return "night";
}

export default Tasks;
