import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

interface MeatballMenuContextType {
  openMenuId: string | null;
  openMenu: (id: string) => void;
  closeMenu: () => void;
}

const MeatballMenuContext = createContext<MeatballMenuContextType | undefined>(undefined);

export const MeatballMenuProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const openMenu = useCallback((id: string) => {
    setOpenMenuId(id);
  }, []);

  const closeMenu = useCallback(() => {
    setOpenMenuId(null);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-meatball-menu="true"]')) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeMenu]);

  const contextValue = useMemo(
    () => ({
      openMenuId,
      openMenu,
      closeMenu,
    }),
    [openMenuId, openMenu, closeMenu]
  );

  return (
    <MeatballMenuContext.Provider value={contextValue}>{children}</MeatballMenuContext.Provider>
  );
};

export const useMeatballMenu = () => {
  const context = useContext(MeatballMenuContext);
  if (context === undefined) {
    throw new Error("useMeatballMenu must be used within a MeatballMenuProvider");
  }
  return context;
};
