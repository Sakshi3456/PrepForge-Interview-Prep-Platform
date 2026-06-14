import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";

export default function Layout() {
  const [isOpen, setIsOpen] = useState(true);

  return (
          <div className={`grid h-screen overflow-hidden bg-[#030712] antialiased text-slate-100 ${
          isOpen ? "grid-cols-[260px_1fr]" : "grid-cols-[88px_1fr]"
        }`}>
    
      <Sidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      <div className="main-content min-w-0 overflow-x-hidden flex flex-col">
        <main className="p-6 md:p-8 w-full flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}