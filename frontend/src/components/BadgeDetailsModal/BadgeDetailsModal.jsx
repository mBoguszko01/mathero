import "./BadgeDetailsModal.css";
function BadgeDetailsModal({ closeModalHandler, badge, setAsHighlighted, unsetAsHighlighted }) {
  const nameMap = {
    silver: "drewnianą",
    gold: "srebrną",
    diamond: "złotą",
  };
  const isHighlighted = badge.isHighlighted;
  return (
    <div className="modal-background">
      <div className="modal-container">
        <div className="modal-btn-container">
          <button onClick={closeModalHandler}>X</button>
        </div>

        <div className="modal-info-container">
          <img src={badge.icon_url} alt={`badge ${badge.name} icon`} />
          <p className="modal-badge-name">{badge.name}</p>
          <p className="modal-badge-description">{badge.description}</p>
          {badge.displayDetails && (
            <div className="modal-badge-progress-container">
              <progress
                max={badge.requirement_value}
                value={badge.progress_value}
                className="modal-badge-progress"
              />
              <p className="modal-badge-progress-text">
                {badge.progress_value}/{badge.requirement_value} (
                {(badge.progress_value / badge.requirement_value) * 100}%)
              </p>
              {!isHighlighted && <button onClick={()=>{setAsHighlighted(badge.id)}}>Oznacz jako wyróżniona odznaka</button>}
              {isHighlighted && <button onClick={()=>{unsetAsHighlighted(badge.id)}}>Odznacz jako wyróżniona odznaka</button>}
            </div>
          )}
          {badge.displayDetails === false && (
            <p className="modal-badge-cant-display-details-info">
              Odblokuj <b>{nameMap[badge.rarity]}</b> odznakę tej kategorii aby
              obejrzeć szczegóły.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default BadgeDetailsModal;
