import { menuItems } from "@/lib/constants";
import MaxWidthWrapper from "../max-width-wrapper";
import MenuCard from "../menu/menu-card";

export const MenuCards = () => {
  return (
    <MaxWidthWrapper className="grid w-full grid-cols-1 gap-4 p-4 sm:p-6 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6 lg:p-8">
      {menuItems.slice(0, 3).map((card) => (
        <MenuCard key={card.id} card={card} />
      ))}
    </MaxWidthWrapper>
  );
};
