import { DetailedHTMLProps, HTMLAttributes } from "react";

import { cn } from "@/utils/lib/utils";

interface InputRightElementProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  children: React.ReactNode;
}

const InputRightElement: React.FC<InputRightElementProps> = ({
  children,
  ...rest
}) => {
  return (
    <div
      className={cn(
        "absolute inset-y-0 flex items-center right-3 cursor-pointer",
        rest.className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export default InputRightElement;
