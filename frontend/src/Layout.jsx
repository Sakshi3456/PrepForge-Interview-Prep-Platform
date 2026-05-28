import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";

export default function Layout() {
  // Global visibility state stays persistent across page switches
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="min-h-screen w-full bg-[#030712] flex overflow-x-hidden antialiased text-slate-100">
      
      {/* Sidebar Component stays securely mounted */}
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* Dynamic Area: Expands to cover 100% of the remaining horizontal canvas */}
      <div className="flex-1 min-w-0 flex flex-col transition-all duration-300 ease-in-out">
        <main className="p-6 md:p-8 max-w-[1600px] w-full mx-auto flex-1">
          {/* This renders whatever child route is active */}
          <Outlet />
        </main>
      </div>

    </div>
  );
}