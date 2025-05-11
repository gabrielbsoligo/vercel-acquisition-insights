
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Users, Target, Network, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

const menuItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Pré-vendas (SDR)",
    href: "/acquisition/sdr",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Vendas (Closer)",
    href: "/acquisition/closer",
    icon: <Target className="h-5 w-5" />,
  },
  {
    title: "Canais de Vendas",
    href: "/acquisition/channels",
    icon: <Network className="h-5 w-5" />,
  },
  {
    title: "Lead Broker",
    href: "/acquisition/leadbroker",
    icon: <DollarSign className="h-5 w-5" />,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, toggleSidebar }) => {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "bg-sidebar border-r border-border transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <span className="text-lg font-semibold text-brandRed">Acquisition</span>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className={cn("ml-auto", collapsed && "mx-auto")}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-1 p-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
              location.pathname === item.href
                ? "bg-brandRed text-white"
                : "hover:bg-muted"
            )}
          >
            {item.icon}
            {!collapsed && <span>{item.title}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
};
