import React from "react";
import { VSCodeOption } from "@vscode/webview-ui-toolkit/react";

interface OptionProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

const Option: React.FC<OptionProps> = ({ children, ...rest }) => {
  return <VSCodeOption {...rest}>{children}</VSCodeOption>;
};

export default Option;
