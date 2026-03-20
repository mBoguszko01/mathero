import ShopRow from "../components/ShopRow";
import { useEffect, useState, useReducer } from "react";
import "../styles/Shop.css";
const Shop = () => {
  const [shopItems, dispatch] = useReducer(reducer, {
    status: "idle",
    error: null,
    consumable: null,
    permanent: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const token = localStorage.getItem("token");
    async function fetchShopItems() {
      const res = fetch(`${import.meta.env.VITE_API_URL}/api/shop/items`, {
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
    fetchShopItems();

    return () => {
      controller.abort();
    };
  }, []);
  return (
    <div className="shop-wrapper">
      {shopItems.status === "loading" && <p>Ładowanie sklepu.</p>}
      {shopItems.status === "error" && (
        <p>{`Błąd podczas pobierania przedmiotów ze sklepu: ${shopItems.error}`}</p>
      )}
      {shopItems.status === "success" && (
        <div className="shop-container">
          <ShopRow
            rowName="Przedmioty jednorazwego użytku"
            items={shopItems.consumable}
          />
          <ShopRow rowName="Avatary" items={shopItems.permanent} />
        </div>
      )}
    </div>
  );
};
export default Shop;

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_STARTED": {
      return {
        status: "loading",
        error: null,
        consumable: null,
        permanent: null,
      };
    }
    case "FETCH_SUCCESS": {
      const data = action.payload.data.data;

      const consumable = data
        .filter((item) => item.type === "consumable")
        .sort((a, b) => a.price - b.price);
      const permanent = data
        .filter((item) => item.type === "permanent")
        .sort((a, b) => a.price - b.price);

      return {
        status: "success",
        error: null,
        consumable,
        permanent,
      };
    }
    case "FETCH_ERROR": {
      return {
        status: "error",
        error: action.payload.error,
        consumable: null,
        permanent: null,
      };
    }
    default: {
      return { ...state };
    }
  }
};
