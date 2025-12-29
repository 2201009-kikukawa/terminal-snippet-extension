import React from "react";
import { Input, type InputProps } from "../ui/input";

type TextFieldProps = InputProps;

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>((props, ref) => {
  return <Input ref={ref} {...props} />;
});

TextField.displayName = "TextField";

export default TextField;
