import BadgesRow from "../components/BadgesRow/BadgesRow";
import { useEffect, useState, useReducer, act } from "react";
import "../styles/Badges.css";
import BadgeDetailsModal from "../components/BadgeDetailsModal/BadgeDetailsModal";

const Badges = () => {
  const [badges, dispatch] = useReducer(reducer, {
    status: "idle",
    error: null,
    badges: null,
  });
  const [showDetails, setShowDetails] = useState(false);
  const [badgeDetails, setBadgeDetails] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const token = localStorage.getItem("token");
    async function fetchBadges() {
      const res = fetch(`${import.meta.env.VITE_API_URL}/api/badges`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal,
      })
        .then((r) => {
          if (!r.ok) throw new Error("error!");
          return r.json();
        })
        .then((d) => {
          dispatch({ type: "FETCH_SUCCESS", payload: { data: d } });
        })
        .catch((e) => {});
      return res;
    }
    dispatch({ type: "FETCH_STARTED" });
    fetchBadges();

    return () => {
      controller.abort();
    };
  }, []);

  function openModal(badge) {
    setShowDetails(true);
    setBadgeDetails(badge);
    window.scrollTo(0, 0);
    const bodyElement = document.querySelector("body");
    bodyElement.classList.add("modal-open");
  }
  function closeModal() {
    const bodyElement = document.querySelector("body");
    bodyElement.classList.remove("modal-open");
    setShowDetails(false);
  }

  return (
    <>
      <div className="badges-container">
        {badges.status === "loading" && <p>Pobieranie odznak...</p>}
        {badges.status === "success" &&
          Object.entries(badges.badges?.badgesMap ?? {}).map(
            ([key, rowBadges]) => (
              <BadgesRow
                key={key}
                title={key}
                badges={rowBadges.slice().sort((a, b) => a.id - b.id)}
                showDetailsHandler={(badge) => {
                  openModal(badge);
                }}
              />
            ),
          )}
        {badges.status === "error" && (
          <p>
            Coś poszło nie tak z pobieraniem odznak. Skontaktuj się z
            administratorem
          </p>
        )}
      </div>
      {showDetails && (
        <BadgeDetailsModal
          closeModalHandler={closeModal}
          badge={badgeDetails}
        />
      )}
    </>
  );
};
export default Badges;

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_STARTED": {
      return { status: "loading", error: null, badges: null };
    }
    case "FETCH_SUCCESS": {
      const data = action.payload.data;
      console.log(data);

      return { status: "success", error: null, badges: data };
    }
    case "FETCH_ERROR": {
      return { status: "error", error: action.payload.error, badges: null };
    }
    default: {
      return { ...state };
    }
  }
};
