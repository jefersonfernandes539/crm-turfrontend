import { DetailedHTMLProps, HTMLAttributes } from "react";

import { cn } from "@/utils/lib/utils";

interface InputElementProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  children: React.ReactNode;
}

const InputLeftAddon: React.FC<InputElementProps> = ({ children, ...rest }) => {
  return (
    <div
      className={cn(
        "absolute inset-y-0 left-0 flex items-center bg-gray-200 px-3 border border-r-0 rounded-l-md text-gray-600",
        rest.className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export default InputLeftAddon;
