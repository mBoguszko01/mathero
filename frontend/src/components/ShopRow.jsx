import ShopItem from "./ShopItem";
const ShopRow = ({ rowName, items }) => {
  console.log(items);
  return (
    <div>
      <h3>{rowName}</h3>
      <div className="shop-row">
        {items.map((item) => (
          <ShopItem item={item} />
        ))}
      </div>
    </div>
  );
};
export default ShopRow;
