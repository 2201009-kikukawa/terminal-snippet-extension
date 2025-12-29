import React from "react";
import { Button as ShadButton, type ButtonProps as ShadButtonProps } from "../ui/button";

type Appearance = "primary" | "secondary" | "icon" | "link" | "ghost";

interface ButtonProps extends Omit<ShadButtonProps, "variant" | "size"> {
  appearance?: Appearance;
}

const appearanceToVariant: Record<Appearance, ShadButtonProps["variant"]> = {
  primary: "default",
  secondary: "secondary",
  icon: "ghost",
  link: "link",
  ghost: "ghost",
};

const appearanceToSize: Partial<Record<Appearance, ShadButtonProps["size"]>> = {
  icon: "icon",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ appearance = "primary", ...rest }, ref) => {
    const variant = appearanceToVariant[appearance] ?? "default";
    const size = appearanceToSize[appearance];

    return <ShadButton ref={ref} variant={variant} size={size} {...rest} />;
  }
);

Button.displayName = "Button";

export default Button;
