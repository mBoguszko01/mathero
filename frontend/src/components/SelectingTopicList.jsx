const SelectingTopicList = ({ list, handleClick, goBackHandler }) => {
  if (!list || list.length === 0) {
    return <div>Brak dostępnych tematów.</div>;
  }
  return (
    <>{goBackHandler && <button onClick={goBackHandler} className="back-button">Wstecz</button>}
      {list.map((el) => (
      <div
        key={el.name}
        className="lessons-topics-wrapper-element"
        onClick={() => handleClick(el)}
      >
        {el.name}
      </div>
      ))}
    </>
  );
};
export default SelectingTopicList;
