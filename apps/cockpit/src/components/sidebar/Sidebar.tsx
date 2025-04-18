"use client";
import { createContext, PropsWithChildren, ReactElement, useContext, useState } from "react";

export type UseSidebarReturn = {
  isOpen: boolean;
  readonly toggle: () => void;
  readonly close: () => void;
  readonly open: () => void;
};

const SidebarContext = createContext<UseSidebarReturn | null>(null);

/** Hook to access the sidebar context. */
export function useSidebar(): UseSidebarReturn {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar() must be used within a <Sidebar> component.");
  }
  return context;
}

interface SidebarProps {
  readonly header?: ReactElement;
  readonly navigation?: ReactElement;
  readonly footer?: ReactElement;
}

export function ScSidebar(props: PropsWithChildren<SidebarProps>) {
  const { children, navigation, header, footer } = props;

  const [isOpen, setIsOpen] = useState(true);

  const contextValue = {
    isOpen: isOpen,
    toggle: () => {
      setIsOpen((prev) => !prev);
    },
    close: () => {
      setIsOpen(false);
    },
    open: () => {
      setIsOpen(true);
    },
  } satisfies UseSidebarReturn;

  return (
    <SidebarContext.Provider value={contextValue}>
      <div className="flex items-start justify-start w-full">
        <aside
          className={`absolute z-50 xl:sticky top-0 left-0 h-[100vh] p-4 transition-transform w-[350px] max-w-full overflow-hidden ${!isOpen ? "absolute! -translate-x-full" : "translate-x-0"}`}>
          <div className={`flex flex-col w-full h-full bg-surface rounded-lg overflow-y-auto`}>
            {header && <div className="w-full p-4">{header}</div>}
            {navigation && <div className="w-full p-4">{navigation}</div>}
            {footer && <div className="w-full p-4">{footer}</div>}
          </div>
        </aside>
        <main className="py-4 px-4">{children}</main>
      </div>

      <div
        className={`xl:hidden fixed top-0 left-0 w-[100vw] h-[100vh] bg-black transition-opacity ${isOpen ? "opacity-50 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => contextValue.toggle()}></div>
    </SidebarContext.Provider>
  );
}
