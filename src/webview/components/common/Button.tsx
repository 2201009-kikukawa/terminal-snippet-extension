import React from "react";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ onClick, children }) => {
  return <VSCodeButton onClick={onClick}>{children}</VSCodeButton>;
};

export default Button;
