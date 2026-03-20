import RankingUser from "../components/RankingUser/RankingUser";
import "../styles/Ranking.css";
import { useEffect, useReducer } from "react";
import { useSearchParams } from "react-router-dom";

const RankingDetails = () => {
  const [params] = useSearchParams();
  const rankingTypeId = params.get("ranking-type-id");
  const [ranking, dispatch] = useReducer(reducer, {
    status: "idle",
    error: null,
    ranking: null,
  });
  useEffect(() => {
    const rankingTypeMap = {
      exp: "top-exp",
      streak: "highest-streak",
      coins: "top-earnings",
    };
    const controller = new AbortController();
    const signal = controller.signal;
    const token = localStorage.getItem("token");
    async function fetchRanking() {
      const res = fetch(
        `${import.meta.env.VITE_API_URL}/api/users/rankings/${rankingTypeMap[rankingTypeId]}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal,
        },
      )
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
    fetchRanking();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    console.log(ranking?.ranking?.data);
  }, [ranking]);
  const columnNames = {
    exp: [<p>Nr</p>, <p>Gracz</p>, <p>Poziom</p>, <p>Punkty doświadczenia</p>],
    streak: [<p>Nr</p>, <p>Gracz</p>, <p>Seria</p>],
    coins: [<p>Nr</p>, <p>Gracz</p>, <p>Monety</p>],
  };
  const columnsAmmount = columnNames[rankingTypeId].length === 4 ? "ranking-4-cols" : "ranking-3-cols"

  return (
    <>
      {ranking?.status === "success" && (
        <div className="ranking-wrapper">
          <div className={`ranking-columns-names ${columnsAmmount}`}>
            {columnNames[rankingTypeId].map((col) => col)}
          </div>
          <div className="ranking-container">
            {ranking.ranking.data.map((rankingUser, index) => {
              const rankingDetails = {
                exp: [<p>{rankingUser.level}</p>, <p>{rankingUser.exp}</p>],
                streak: [<p>{rankingUser.highest_streak}</p>],
                coins: [<p>{rankingUser.total_earnings}</p>],
              };
              return (
                <RankingUser
                  index={index}
                  rankingUser={rankingUser}
                  rankingDetails={rankingDetails[rankingTypeId]}
                  columnsAmmountStyle = {columnsAmmount}
                />
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};
export default RankingDetails;

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_STARTED": {
      return { status: "loading", error: null, ranking: null };
    }
    case "FETCH_SUCCESS": {
      const data = action.payload.data;
      return { status: "success", error: null, ranking: data };
    }
    case "FETCH_ERROR": {
      return { status: "error", error: action.payload.error, ranking: null };
    }
    default: {
      return { ...state };
    }
  }
};
