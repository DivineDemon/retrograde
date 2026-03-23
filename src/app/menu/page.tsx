import MaxWidthWrapper from "@/components/max-width-wrapper";
import MenuCard from "@/components/menu/menu-card";
import { menuItems } from "@/lib/constants";

export default function Menu() {
  return (
    <MaxWidthWrapper className="grid min-h-screen w-full grid-cols-1 gap-4 p-4 sm:p-6 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6 lg:p-8">
      {menuItems.map((card) => (
        <MenuCard key={card.id} card={card} />
      ))}
    </MaxWidthWrapper>
  );
}
