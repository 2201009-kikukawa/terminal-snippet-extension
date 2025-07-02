import React from "react";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  appearance?: "primary" | "secondary" | "icon";
  className?: string;
  title?: string;
}

const Button: React.FC<ButtonProps> = ({ children, ...rest }) => {
  return <VSCodeButton {...rest}>{children}</VSCodeButton>;
};

export default Button;
