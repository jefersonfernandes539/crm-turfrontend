import { DetailedHTMLProps, HTMLAttributes } from "react";

import { cn } from "@/utils/lib/utils";

interface InputElementProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  children: React.ReactNode;
}

const InputRightAddon: React.FC<InputElementProps> = ({
  children,
  ...rest
}) => {
  return (
    <div
      className={cn(
        "absolute inset-y-0 right-0 flex items-center bg-gray-200 px-3 border border-l-0 rounded-r-md text-gray-600",
        rest.className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export default InputRightAddon;
