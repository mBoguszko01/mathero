import "../styles/LessonsTopics.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import SelectingTopicList from "../components/SelectingTopicList";

const normalizeClassLevels = (levels) => {
  if (Array.isArray(levels)) {
    return levels.map(Number);
  }

  if (typeof levels === "string") {
    return levels
      .replace(/[{}]/g, "")
      .split(",")
      .filter((level) => level.trim() !== "")
      .map((level) => Number(level.trim()));
  }

  return [];
};

const hasClassLevel = (levels, selectedClass) =>
  normalizeClassLevels(levels).includes(Number(selectedClass));

const LessonsTopics = () => {
  const navigate = useNavigate();
  const classes = [
    { name: "Przedszkolaki", level: 0 },
    { name: "Klasa 1", level: 1 },
    { name: "Klasa 2", level: 2 },
    { name: "Klasa 3", level: 3 },
    { name: "Klasa 4", level: 4 },
    { name: "Klasa 5", level: 5 },
    { name: "Klasa 6", level: 6 },
    { name: "Klasa 7", level: 7 },
    { name: "Klasa 8", level: 8 },
  ];

  const [selectedClass, setSelectedClass] = useState(null);
  const [allTopics, setAllTopics] = useState(null);
  const [subtopicsArray, setSubtopicsArray] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);
  const [topicsError, setTopicsError] = useState("");

  const topicsArray = useMemo(() => {
    if (selectedClass === null || !allTopics) {
      return null;
    }

    return allTopics.filter((topic) =>
      hasClassLevel(topic.class_levels, selectedClass)
    );
  }, [allTopics, selectedClass]);

  const setMainTopic = (topic) => {
    setSelectedTopic(topic);
    const subtopics = topic.subcategories || [];
    const subtopicsForSelectedClass = subtopics.filter((sub) =>
      hasClassLevel(sub.class_levels, selectedClass)
    );

    setSubtopicsArray(
      subtopicsForSelectedClass.length > 0 ? subtopicsForSelectedClass : subtopics
    );
  };

  const deselectTopic = () => {
    setSelectedTopic(null);
  };

  const setSubTopic = (subtopic) => {
    setSelectedSubtopic(subtopic);
    navigate(
      `/app/tasks?class=${selectedClass}&topic=${selectedTopic.id}&subtopic=${subtopic.id}`
    );
  };

  const setClass = (classObj) => {
    setSelectedClass(classObj.level);
    setSelectedTopic(null);
    setSelectedSubtopic(null);
    setSubtopicsArray(null);
  };

  useEffect(() => {
    let isActive = true;

    fetch(`${import.meta.env.VITE_API_URL}/api/categories/full`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Nie udało się pobrać tematów lekcji.");
        }

        return res.json();
      })
      .then((data) => {
        if (isActive) {
          setAllTopics(data);
          setTopicsError("");
        }
      })
      .catch((err) => {
        console.error(err);
        if (isActive) {
          setAllTopics([]);
          setTopicsError("Nie udało się pobrać tematów lekcji.");
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div>
      <h1>Wybierz temat lekcji:</h1>
      <div className="lessons-topics-wrapper">
        {topicsError && <div>{topicsError}</div>}
        {selectedClass === null && (
          <SelectingTopicList list={classes} handleClick={setClass} />
        )}
        {selectedTopic === null && selectedClass !== null && !topicsError && (
          <SelectingTopicList
            list={topicsArray}
            handleClick={setMainTopic}
            isLoading={!allTopics}
          />
        )}
        {selectedTopic !== null && selectedSubtopic === null && (
          <SelectingTopicList
            list={subtopicsArray}
            handleClick={setSubTopic}
            goBackHandler={deselectTopic}
          />
        )}
      </div>
    </div>
  );
};

export default LessonsTopics;
