import React from "react";
import Button from "./Button";
import { cn } from "../../lib/utils";

interface OptionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const Option: React.FC<OptionProps> = ({ children, className, ...rest }) => {
  return (
    <Button
      appearance="ghost"
      className={cn(
        "w-full justify-start rounded-sm px-2 py-1 text-left text-sm hover:bg-[var(--accent)]/10",
        className
      )}
      {...rest}>
      {children}
    </Button>
  );
};

export default Option;
