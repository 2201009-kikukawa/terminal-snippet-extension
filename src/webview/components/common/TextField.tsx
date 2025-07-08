import React from "react";
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";

interface TextFieldProps {
  value: string;
  placeholder: string;
  onInput: (e: any) => void;
  className?: string;
}

const TextField: React.FC<TextFieldProps> = ({ value, placeholder, onInput, className }) => {
  return (
    <VSCodeTextField
      value={value}
      placeholder={placeholder}
      className={className}
      onInput={onInput}
    />
  );
};

export default TextField;
