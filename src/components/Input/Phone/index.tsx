"use client";

import { Text } from "@/components";

import { cn } from "@/utils/lib/utils";
import { Label } from "@/components/ui/label";
import { PhoneInput, PhoneInputProps } from "@/components/ui/phone-input";

type PhoneComponentProps = PhoneInputProps & {
  id: string;
  label?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  helperText?: string;
  classNameContainer?: string;
};

export const Phone: React.FC<PhoneComponentProps> = ({
  id,
  label,
  isRequired = false,
  isInvalid = false,
  isDisabled = false,
  errorMessage = "This field is required",
  helperText,
  classNameContainer,
  ...rest
}) => {
  return (
    <div className={cn("grid gap-3 w-full relative", classNameContainer)}>
      {label ? (
        <Label htmlFor={id} className="flex items-center gap-1">
          {label}
          {isRequired && <div className="text-red-500">*</div>}
        </Label>
      ) : null}

      <PhoneInput disabled={isDisabled} {...rest} />

      {!isInvalid && helperText ? (
        <Text.Base className="text-sm font-medium ">
          {helperText.toLowerCase()}
        </Text.Base>
      ) : null}

      {isInvalid ? (
        <Text.Base className="text-red-500 text-sm font-medium">
          {errorMessage.toLowerCase()}
        </Text.Base>
      ) : null}
    </div>
  );
};
