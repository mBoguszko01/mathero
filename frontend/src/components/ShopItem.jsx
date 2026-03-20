const ShopItem = ({ item }) => {
  const isAvatar = item?.description?.startsWith("avatar");
  console.log(isAvatar);
  return (
    <div className="shop-item">
      <img src={`../${item.img_name}.png`} />
      <p>{item.name}</p>
      <p>{item.price}🪙</p>
    </div>
  );
};
export default ShopItem;
