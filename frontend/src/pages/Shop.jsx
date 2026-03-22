import ShopRow from "../components/ShopRow";
import ShopItemModal from "../components/ShopItemModal/ShopItemModal";
import { useDispatch } from "react-redux";
import { updateInfoAfterPruchase } from "../store/userSlice";
import { useEffect, useReducer, useState } from "react";
import "../styles/Shop.css";
const Shop = () => {
  const [shopItems, dispatch] = useReducer(reducer, {
    status: "idle",
    error: null,
    consumable: null,
    permanent: null,
  });
  const storeDispatch = useDispatch();
  const [showDetails, setShowDetails] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  function openModal(item) {
    setShowDetails(true);
    setSelectedItem(item);
    window.scrollTo(0, 0);
    const bodyElement = document.querySelector("body");
    bodyElement.classList.add("modal-open");
  }
  function closeModal() {
    const bodyElement = document.querySelector("body");
    bodyElement.classList.remove("modal-open");
    setShowDetails(false);
  }
  async function handlePurchase(item) {
    const controller = new AbortController();
    const signal = controller.signal;
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/shop/purchase/${item.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            itemId: item.id,
          }),
          signal,
        },
      );

      if (!res.ok) throw new Error("Purchase failed");

      const data = await res.json();
      storeDispatch(
        updateInfoAfterPruchase({
          exp: data.data.user.exp,
          level: data.data.user.level,
          money: data.data.user.money,
        }),
      );
      if (selectedItem.type === "permanent") {
        setSelectedItem((prev) => ({
          ...prev,
          is_purchased: true,
        }));
        dispatch({
          type: "PURCHASE_PERMANENT_ITEM",
          payload: { itemId: item.id },
        });
      }
      setSelectedItem((prev) =>
        prev ? { ...prev, is_purchased: true } : prev,
      );

      return { success: true };
    } catch (err) {
      console.error(err);
      
    }

    return () => controller.abort();
  }

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
        .catch((e) => {
          console.error(e);
        });
      return res;
    }
    dispatch({ type: "FETCH_STARTED" });
    fetchShopItems();

    return () => {
      controller.abort();
    };
  }, []);
  return (
    <>
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
              showDetailsHandler={openModal}
              handlePurchase={handlePurchase}
            />
            <ShopRow
              rowName="Avatary"
              items={shopItems.permanent}
              showDetailsHandler={openModal}
              handlePurchase={handlePurchase}
            />
          </div>
        )}
      </div>
      {showDetails && (
        <ShopItemModal
          closeModalHandler={closeModal}
          item={selectedItem}
          handlePurchase={handlePurchase}
        />
      )}
    </>
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
    case "PURCHASE_PERMANENT_ITEM": {
      const purchasedItemId = action.payload.itemId;
      return {
        ...state,
        permanent: state.permanent?.map((item) =>
          item.id === purchasedItemId ? { ...item, is_purchased: true } : item,
        ),
      };
    }
    default: {
      return { ...state };
    }
  }
};
