import React from "react";
import { Film, LayoutDashboard, Calendar, DollarSign, AlertTriangle, ListChecks, Bot, History } from "lucide-react";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  href?: string;
}

function SidebarItem({ icon: Icon, label, isActive, href }: SidebarItemProps) {
  const baseClass = `w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors text-sm font-medium ${
    isActive
      ? "bg-slate-800 text-slate-100"
      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
  }`;

  if (href) {
    return (
      <a href={href} className={baseClass}>
        <Icon className="w-4 h-4" />
        {label}
      </a>
    );
  }

  return (
    <button className={baseClass}>
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

export function ApplicationShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-200 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-950/50 flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="flex items-center gap-2 text-indigo-400">
            <Film className="w-6 h-6" />
            <span className="font-bold text-lg tracking-wide text-slate-100">CinePilot<span className="text-indigo-500">AI</span></span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Workspace
          </div>
          <SidebarItem icon={LayoutDashboard} label="Command Center" isActive />
          <SidebarItem icon={Calendar} label="Schedule" />
          <SidebarItem icon={DollarSign} label="Budget" />
          <SidebarItem icon={AlertTriangle} label="Risks" />

          <div className="px-3 mt-6 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Intelligence
          </div>
          <SidebarItem icon={Bot} label="Agents" />
          <SidebarItem icon={ListChecks} label="Continuity" />
          <SidebarItem icon={History} label="Decisions" href="#decisions" />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="text-xs text-slate-500 flex justify-between items-center">
            <span>System Status</span>
            <span className="flex items-center gap-1.5 text-emerald-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Online
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-900/40 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-slate-900/0 to-slate-900/0 pointer-events-none" />
        <div className="flex-1 overflow-y-auto z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
