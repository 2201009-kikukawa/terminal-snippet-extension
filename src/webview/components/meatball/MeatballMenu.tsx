import * as React from "react";
import { useMeatballMenu } from "./MeatballMenuContext";
import { MenuItem } from "../../types";
import { DATA_MENU_AREA } from "./MeatballMenuContext";
import { VSCODE_THEME_COLORS } from "../../const/VscodeColor";
import Option from "../common/Option";

interface MeatballMenuProps {
  id: string;
  menuItems: MenuItem[];
}

const MeatballMenu: React.FC<MeatballMenuProps> = ({ id, menuItems }) => {
  const { openMenuId, openMenu, closeMenu } = useMeatballMenu();
  const isOpen = openMenuId === id;

  return (
    <div style={{ position: "relative", display: "inline-block" }} data-menu-area={DATA_MENU_AREA}>
      <button
        onClick={() => openMenu(id)}
        style={{
          background: "none",
          border: "none",
          fontSize: "16px",
          cursor: "pointer",
          padding: "4px 8px",
          color: VSCODE_THEME_COLORS.dropdownForeground,
        }}>
        ⋯
      </button>
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            backgroundColor: VSCODE_THEME_COLORS.dropdownBackground,
            border: "1px solid " + VSCODE_THEME_COLORS.dropdownBorder,
            borderRadius: "5px",
            minWidth: "120px",
            zIndex: 1000,
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
            display: "flex",
            flexDirection: "column",
            padding: "4px 0",
          }}>
          {menuItems.map((item, index) => (
            <Option
              key={index}
              className="justify-center"
              onClick={() => {
                item.onClick();
                closeMenu();
              }}>
              {item.label}
            </Option>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeatballMenu;
