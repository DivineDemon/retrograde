import { cn } from "@/lib/utils";

export const SITE_PAGE_PADDING = "px-4 sm:px-6 lg:px-10";

type MaxWidthWrapperProps = {
  children: React.ReactNode;
  className?: string;
};

const MaxWidthWrapper = ({ children, className }: MaxWidthWrapperProps) => {
  return (
    <div className={cn("mx-auto w-full max-w-[1440px]", className)}>
      {children}
    </div>
  );
};

export default MaxWidthWrapper;
