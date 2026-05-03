import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="page-shell min-h-screen">
      <div className="mx-auto min-h-screen max-w-[1800px] lg:pl-[22rem]">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex min-h-screen min-w-0 flex-1 flex-col px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
          <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
          <div className="flex-1">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
