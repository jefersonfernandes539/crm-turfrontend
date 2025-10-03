import clsx from "clsx";
import {
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Sheet as SheetShadcn,
} from "../ui/sheet";
import { ScrollArea } from "../ui/scroll-area";

interface SheetProps {
  isOpen: boolean;
  onOpenChange(open: boolean): void;
  title: string;
  children: React.ReactNode;
  description?: string;
  childrenTrigger: React.ReactNode;
  childrenFooter?: React.ReactNode;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
}

const roundedBySide = (side: string) => {
  switch (side) {
    case "top":
      return "rounded-b-lg";
    case "right":
      return "rounded-l-lg";
    case "bottom":
      return "rounded-t-lg";
    case "left":
      return "rounded-r-lg";
    default:
      return "rounded-none";
  }
};

const Sheet: React.FC<SheetProps> = ({
  children,
  childrenTrigger,
  childrenFooter,
  title,
  description,
  className,
  side,
  isOpen,
  onOpenChange,
}) => {
  return (
    <SheetShadcn open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{childrenTrigger}</SheetTrigger>
      <SheetContent
        side={side || "right"}
        className={clsx(
          roundedBySide(side || "right"),
          className,
          "flex flex-col"
        )}
      >
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>{title}</SheetTitle>
          {description ? (
            <SheetDescription>{description}</SheetDescription>
          ) : null}
        </SheetHeader>
        <ScrollArea className="flex-grow px-3">
          <div className="py-4">{children}</div>
        </ScrollArea>
        {childrenFooter ? (
          <SheetFooter className="flex-shrink-0">
            <SheetClose asChild>{childrenFooter}</SheetClose>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </SheetShadcn>
  );
};

export default Sheet;
