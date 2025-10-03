"use client";

import * as Text from "@/components/Text";
import { InputProps, Input as InputShadcn } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { cn } from "@/utils/lib/utils";
import { useState } from "react"; 

import { FiEye } from "react-icons/fi";
import { TbEyeClosed } from "react-icons/tb";

import InputLeftAddon from "./InputLeftAddon";
import InputLeftElement from "./InputLeftElement";
import InputRightAddon from "./InputRightAddon";
import InputRightElement from "./InputRightElement";


type InputComponentProps = InputProps & {
  id: string;
  label?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  isRequired?: boolean;
  isDisabled?: boolean;
  isInvalid?: boolean;
  errorMessage?: string;
  helperText?: string;
  classNameContainer?: string;
};

export const Base: React.FC<InputComponentProps> = ({
  id,
  label,
  leftElement,
  rightElement,
  leftAddon,
  rightAddon,
  isRequired = false,
  isInvalid = false,
  errorMessage = "This field is required",
  helperText,
  isDisabled,
  classNameContainer,
  ...rest
}) => {
  const [show, setShow] = useState<boolean>(false);

  return (
    <div className={cn("grid gap-3 w-full relative", classNameContainer)}>
      {label ? (
        <Label htmlFor={id} className="flex items-center gap-1">
          {label}
          {isRequired && <div className="text-red-500">*</div>}
        </Label>
      ) : null}
      <div className="relative justify-center">
        {leftAddon && <InputLeftAddon>{leftAddon}</InputLeftAddon>}

        {leftElement && <InputLeftElement>{leftElement}</InputLeftElement>}

        <InputShadcn
          id={id}
          disabled={isDisabled}
          className={cn(
            leftAddon ? "pl-16" : "",
            rightAddon ? "pr-16" : "",
            leftElement ? "pl-10" : "",
            rightElement ? "pr-10" : ""
          )}
          {...rest}
          type={
            rest.type === "password" ? (show ? "text" : "password") : rest.type
          }
        />

        {rightElement && <InputRightElement>{rightElement}</InputRightElement>}

        {rest.type === "password" && (
          <InputRightElement onClick={() => setShow(!show)}>
            {show ? <TbEyeClosed /> : <FiEye />}
          </InputRightElement>
        )}

        {rightAddon && <InputRightAddon>{rightAddon}</InputRightAddon>}
      </div>

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
