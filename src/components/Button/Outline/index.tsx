import React from "react";

import { Spinner } from "@/components";
import { Button, ButtonProps } from "@/components/ui/button";

type Props = ButtonProps & {
  children?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  loadingIcon?: React.ReactNode;
  textLoading?: string;
};

export const Outline: React.FC<Props> = ({
  children,
  leftIcon,
  rightIcon,
  isLoading,
  loadingIcon,
  textLoading,
  ...rest
}) => {
  return (
    <Button variant="outline" disabled={isLoading} {...rest}>
      {isLoading ? (
        <div className="flex items-center justify-center">
          {textLoading && <span className="ml-2">{textLoading}</span>}
          {loadingIcon || <Spinner.Base />}
        </div>
      ) : (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </Button>
  );
};
