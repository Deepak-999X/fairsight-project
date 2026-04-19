/**
 * FairSight AI — PageShell Component
 * Layout wrapper: Navbar + optional Sidebar + main content area.
 */

import { useState } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

interface PageShellProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export function PageShell({ children, showSidebar = false }: PageShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-gray">
      <Navbar />

      {showSidebar && (
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
      )}

      <main
        className={`pt-16 transition-all duration-300 ${
          showSidebar && sidebarOpen ? "ml-60" : "ml-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
