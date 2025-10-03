import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/utils/lib/utils";

type Props = ButtonProps & {
  children: React.ReactNode;
};

export const Underline: React.FC<Props> = ({ children, ...rest }) => {
  return (
    <Button
      variant="link"
      {...rest}
      className={cn("px-0 py-0", rest.className)}
    >
      {children}
    </Button>
  );
};
