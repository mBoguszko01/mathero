import "../styles/LessonsTopics.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import SelectingTopicList from "../components/SelectingTopicList";

const LessonsTopics = () => {
  const navigate = useNavigate();
  const classes = [
    { name: "Klasa 1" },
    { name: "Klasa 2" },
    { name: "Klasa 3" },
    { name: "Klasa 4" },
    { name: "Klasa 5" },
    { name: "Klasa 6" },
    { name: "Klasa 7" },
    { name: "Klasa 8" },
  ];
  const [selectedClass, setSelectedClass] = useState(null);
  const [allTopics, setAllTopics] = useState([]);
  const [topicsArray, setTopicsArray] = useState(null);
  const [subtopicsArray, setSubtopicsArray] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);
  const setMainTopic = (topic) => {
    setSelectedTopic(topic);
    setSubtopicsArray(
      topic.subcategories.filter((sub) =>
        sub.class_levels.includes(selectedClass)
      )
    );
  };
  const deselectTopic = () => {
    setSelectedTopic(null);
  };
  const setSubTopic = (subtopic) => {
    setSelectedSubtopic(subtopic);
    navigate(`/app/tasks?class=${selectedClass}&topic=${selectedTopic.id}&subtopic=${subtopic.id}`);
  };
  const setClass = (classObj) => {
    const classNumber = parseInt(classObj.name.split(" ")[1]);
    setTopicsArray(
      allTopics.filter((topic) => topic.class_levels.includes(classNumber))
    );
    setSelectedClass(classNumber);
    setSelectedTopic(null);
    setSelectedSubtopic(null);
  };

   useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/categories/full`)
      .then((res) => res.json())
      .then((data) => setAllTopics(data))
      .catch((err) => console.error(err));
  }, []);


  if (!allTopics) {
    return <div>Ładowanie tematów lekcji...</div>;
  }

  return (
    <div>
      <h1>Wybierz temat lekcji:</h1>
      <div className="lessons-topics-wrapper">
        {selectedClass === null && (
          <SelectingTopicList list={classes} handleClick={setClass} />
        )}
        {selectedTopic === null && selectedClass !== null && (
          <SelectingTopicList list={topicsArray} handleClick={setMainTopic} />
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
