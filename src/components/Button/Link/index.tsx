import NextLink from "next/link";

import { cn } from "@/utils/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";

type Props = ButtonProps & {
  href: string;
  children: React.ReactNode;
};

export const Link: React.FC<Props> = ({ href, children, ...rest }) => {
  return (
    <NextLink href={href}>
      <Button
        variant="link"
        {...rest}
        className={cn("px-0 py-0", rest.className)}
      >
        {children}
      </Button>
    </NextLink>
  );
};
