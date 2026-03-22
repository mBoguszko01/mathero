import { useState } from "react";
import "./ShopItemModal.css";

const ShopItemModal = ({ closeModalHandler, item, handlePurchase }) => {
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  async function onPurchase() {
    const result = await handlePurchase(item);

    if (result?.success && item.type === "consumable") {
      setPurchaseSuccess(true);
      setTimeout(() => {
        setPurchaseSuccess(false);
      }, 1000);
    }
  }

  return (
    <div className="modal-background">
      <div className="modal-container">
        <div className="modal-btn-container">
          <button onClick={closeModalHandler}>X</button>
        </div>

        <div className="shop-item-modal-container">
          <img src={`../${item.img_name}.png`} />
          <p>{item.name}</p>
          <p>{item.description}</p>
          <p>{item.price}🪙</p>
        </div>

        {purchaseSuccess && (
          <div className="modal-info-container">
            <p>✅ Przedmiot został użyty!</p>
          </div>
        )}

        {item.is_purchased && item.type !== "consumable" && (
          <div className="modal-info-container">
            <p>Posiadasz już ten przedmiot</p>
          </div>
        )}

        {(!item.is_purchased || item.type === "consumable") && !purchaseSuccess && (
          <div className="shop-item-modal-btns-container">
            <button onClick={closeModalHandler}>Zamknij</button>
            <button
              className="shop-item-modal-primary-btn"
              onClick={onPurchase}
            >
              Kup
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopItemModal;
