const menuItems = [
  {
    category: "SIGNATURE",
    title: "CRT MOCHA",
    color: "bg-white",
    text: "Dark roast, milk foam, bitter cocoa, neon cherry dust.",
    price: "¥720",
    titleColor: "text-magenta",
  },
  {
    category: "COLD BREW",
    title: "MANGA FIZZ",
    color: "bg-cyan",
    text: "Yuzu tonic, cold brew base, crackling citrus top note.",
    price: "¥640",
    titleColor: "text-ink",
  },
  {
    category: "DESSERT",
    title: "BYTE WAFFLE",
    color: "bg-yellow",
    text: "Grid-pressed waffle, vanilla whip, pixel berry jam.",
    price: "¥580",
    titleColor: "text-ink",
  },
];

export const MenuCards = () => {
  return (
    <section className="relative z-10 grid grid-cols-1 gap-4 px-4 pt-8 sm:px-6 sm:pt-9 md:grid-cols-2 md:gap-5 md:px-10 lg:grid-cols-3 lg:px-[60px] lg:pt-10">
      {menuItems.map((card) => (
        <div
          key={card.title}
          className={`${card.color} shadow-retro-sm flex flex-col gap-3 border-6 border-ink p-4 sm:p-[18px]`}
        >
          <div className="font-press-start text-[10px] leading-3 text-ink">
            {card.category}
          </div>
          <div
            className={`${card.titleColor} font-bangers text-[42px] leading-[42px] sm:text-[48px] sm:leading-[48px] md:text-[52px] md:leading-[52px]`}
          >
            {card.title}
          </div>
          <div className="font-noto text-[15px] leading-[22px] text-ink">
            {card.text}
          </div>
          <div className="font-press-start text-[12px] leading-4 text-ink">
            {card.price}
          </div>
        </div>
      ))}
    </section>
  );
};
