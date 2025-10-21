import * as React from "react";

interface DragHandleIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  onHandleClick?: (e: React.MouseEvent) => void;
}

const DragHandleIcon = ({ onHandleClick, ...props }: DragHandleIconProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onHandleClick) {
      onHandleClick(e);
    }
  };

  return (
    <span {...props} onClick={handleClick}>
      <svg
        viewBox="0 0 20 20"
        width="16"
        height="16"
        fill="currentColor"
        style={{ cursor: "grab" }}>
        <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
      </svg>
    </span>
  );
};

export default DragHandleIcon;
