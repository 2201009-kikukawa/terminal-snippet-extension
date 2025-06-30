import { VSCodeOption } from "@vscode/webview-ui-toolkit/react";
import * as React from "react";
import { useMeatballMenu } from "./MeatballMenuContext";
import { MenuItem } from "../../types";
import { vscodeThemeColors } from "../../types/VscodeColor";

interface MeatballMenuProps {
  id: string;
  menuItems: MenuItem[];
}

const MeatballMenu: React.FC<MeatballMenuProps> = ({ id, menuItems }) => {
  const { openMenuId, openMenu, closeMenu } = useMeatballMenu();
  const isOpen = openMenuId === id;

  return (
    <div style={{ position: "relative", display: "inline-block" }} data-meatball-menu="true">
      <button
        onClick={() => openMenu(id)}
        style={{
          background: "none",
          border: "none",
          fontSize: "16px",
          cursor: "pointer",
          padding: "4px 8px",
          color: vscodeThemeColors.dropdownForeground,
        }}>
        ⋯
      </button>
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            backgroundColor: vscodeThemeColors.dropdownBackground,
            border: "1px solid " + vscodeThemeColors.dropdownBorder,
            borderRadius: "5px",
            minWidth: "120px",
            zIndex: 1000,
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
            display: "flex",
            flexDirection: "column",
            padding: "4px 0",
          }}>
          {menuItems.map((item, index) => (
            <VSCodeOption
              key={index}
              style={{
                width: "100%",
                justifyContent: "center",
              }}
              onClick={() => {
                item.onClick();
                closeMenu();
              }}>
              {item.label}
            </VSCodeOption>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeatballMenu;
