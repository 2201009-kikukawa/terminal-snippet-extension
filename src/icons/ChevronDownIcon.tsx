import { CSSProperties, SVGProps } from "react";

interface ChevronDownIconProps extends SVGProps<SVGSVGElement> {
  width?: string | number;
  height?: string | number;
  style?: CSSProperties;
}

const ChevronDownIcon: React.FC<ChevronDownIconProps> = ({
  width = "20",
  height = "20",
  style,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="currentColor"
      style={{ verticalAlign: "middle", ...style }}
      {...props}>
      <path d="M4.646 6.646a.5.5 0 0 1 .708 0L8 9.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z" />
    </svg>
  );
};

export default ChevronDownIcon;
