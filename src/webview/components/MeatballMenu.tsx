import * as React from "react";
import { useState } from "react";
import { MenuItem } from "../types";

interface MeatballMenuProps {
  menuItems: MenuItem[];
  isOpen: boolean;
  onToggle: () => void;
}

const MeatballMenu: React.FC<MeatballMenuProps> = ({ menuItems, isOpen, onToggle }) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={onToggle}
        style={{
          background: "none",
          border: "none",
          fontSize: "16px",
          cursor: "pointer",
          padding: "4px 8px",
          color: "var(--vscode-dropdown-foreground)",
        }}>
        ⋯
      </button>
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            backgroundColor: "var(--vscode-dropdown-background)",
            border: "1px solid var(--vscode-dropdown-border)",
            borderRadius: "5px",
            minWidth: "120px",
            zIndex: 1000,
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
          }}>
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick();
                onToggle();
              }}
              onMouseEnter={() => setHoveredItem(item.label)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                display: "block",
                width: "100%",
                background:
                  hoveredItem === item.label ? "var(--vscode-list-hoverBackground)" : "transparent",
                border: "none",
                padding: "8px 12px",
                textAlign: "center",
                cursor: "pointer",
                color: "var(--vscode-dropdown-foreground)",
                transition: "background-color 0.1s ease",
              }}>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeatballMenu;
