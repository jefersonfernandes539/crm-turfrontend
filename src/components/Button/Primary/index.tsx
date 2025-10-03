import { Spinner } from "@/components";
import { Button, ButtonProps } from "@/components/ui/button";

import React from "react";

type Props = ButtonProps & {
  children?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  isDisabled?: boolean;
  loadingIcon?: React.ReactNode;
  textLoading?: string;
};

export const Primary = React.forwardRef<HTMLButtonElement, Props>(
  (
    {
      children,
      leftIcon,
      rightIcon,
      isLoading,
      loadingIcon,
      textLoading,
      isDisabled,
      ...rest
    },
    ref
  ) => {
    return (
      <Button ref={ref} disabled={isDisabled || isLoading} {...rest}>
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
  }
);

Primary.displayName = "Primary";
