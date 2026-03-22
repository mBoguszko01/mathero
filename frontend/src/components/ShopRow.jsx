import ShopItem from "./ShopItem";
const ShopRow = ({ rowName, items, showDetailsHandler }) => {
  console.log(items);
  return (
    <div>
      <h3>{rowName}</h3>
      <div className="shop-row">
        {items.map((item) => (
          <ShopItem item={item} showDetailsHandler={showDetailsHandler} />
        ))}
      </div>
    </div>
  );
};
export default ShopRow;
