const ShopItem = ({ item, showDetailsHandler }) => {
  const classes = item.is_purchased ? "shop-item purchased" : "shop-item";
  return (
    <div className={classes} onClick={() => showDetailsHandler(item)}>
      <img src={`../${item.img_name}.png`} />
      <p>{item.name}</p>
      <p>{item.price}🪙</p>
      {item.is_purchased ? <p>Posiadasz już ten przedmiot</p> : <></>}
    </div>
  );
};
export default ShopItem;
