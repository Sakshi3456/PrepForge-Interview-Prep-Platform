import { useState } from "react";
import Sidebar from "./Sidebar";

function PageLayout({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-[#f5f7fb]">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="flex-1 overflow-auto min-w-0">
        {children}
      </div>
    </div>
  );
}

export default PageLayout;