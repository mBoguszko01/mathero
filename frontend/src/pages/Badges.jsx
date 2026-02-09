import Badge from "../components/Badge/Badge.jsx";
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

  const badgeData = {
    id: 1,
    name: "Mistrz matematyki",
    description: "Rozwiązuj zadania każdego rodzaju",
    icon_url: "../avatar1.png",
    requirement_type: "rozwiązanych zadań",
    requirement_value: "100",
    value: "53",
    category_id: "5",
    rarity: "rare",
  };
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
          dispatch({ type: "FETCH_SUCCESS", payload: {data: d}});
        })
        .catch((e) => {

        });
      return res;
    }
    dispatch({ type: "FETCH_STARTED"});
    fetchBadges();

    return () => {
      controller.abort();
    };
  }, []);
  useEffect(()=>{
    console.log(badges);
  }, [badges])
  return (
    <div className="badges-container">
      <Badge badgeData={badgeData} />
      <Badge badgeData={badgeData} />
      <Badge badgeData={badgeData} />
      <Badge badgeData={badgeData} />
      <Badge badgeData={badgeData} />
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

      return { status: "success", error: null,  badges: data};
    }
    case "FETCH_ERROR": {
      return { status: "error", error: action.payload.error, badges: null };
    }
    default: {
      return { ...state };
    }
  }
};
