import BadgesRow from "../components/BadgesRow/BadgesRow";
import { useEffect, useState, useReducer, act } from "react";
import "../styles/Badges.css";

//badge structure: id, name, description, icon_url, requirement_type, requirement_value, category_id, rarity

//W TYM WIDOKU POKAZUJĘ INFORMACJĘ CZY ODBLOKWANE CZY NIE.
const Badges = () => {
  const [badges, dispatch] = useReducer(reducer, {
    status: "idle",
    error: null,
    badges: null,
  });

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
  useEffect(() => {
    console.log(badges.badges?.badgesMap);
  }, [badges]);

  return (
    <div className="badges-container">
      {badges.status === "loading" && <p>Pobieranie odznak...</p>}
      {badges.status === "success" &&
        Object.entries(badges.badges?.badgesMap ?? {}).map(
          ([key, rowBadges]) => (
            <BadgesRow key={key} title={key} badges={rowBadges} />
          ),
        )}
      {badges.status === "error" && (
        <p>
          Coś poszło nie tak z pobieraniem odznak. Skontaktuj się z
          administratorem
        </p>
      )}
    </div>
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
