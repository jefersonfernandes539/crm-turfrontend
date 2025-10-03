import { DetailedHTMLProps, HTMLAttributes } from "react";

import { cn } from "@/utils/lib/utils";

interface InputElementProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  children: React.ReactNode;
}

const InputLeftElement: React.FC<InputElementProps> = ({
  children,
  ...rest
}) => {
  return (
    <div
      className={cn(
        "absolute inset-y-0 left-3 flex items-center cursor-pointer",
        rest.className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export default InputLeftElement;
