import { Home, Rocket, Compass, TrendingUp, User, FileText } from "lucide-react";
import { useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { motion } from "framer-motion";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: Rocket, label: "Launch", path: "/launch" },
  { icon: Compass, label: "Discover", path: "/discover" },
  { icon: TrendingUp, label: "Markets", path: "/markets" },
  { icon: User, label: "Creator", path: "/creator" },
  { icon: FileText, label: "Docs", path: "/docs" },
];

export function AppSidebar() {
  const [location, navigate] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div 
          className="w-12 h-12 rounded-md bg-gradient-to-br from-solana-mint via-solana-aqua to-solana-purple flex items-center justify-center hover-elevate cursor-pointer transition-all duration-200"
          onClick={() => navigate("/")}
        >
          <span className="text-lg font-bold text-black">SL</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;

                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                      data-testid={`nav-${item.label.toLowerCase()}`}
                    >
                      <a href={item.path} onClick={(e) => { e.preventDefault(); navigate(item.path); }}>
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 rounded-md glow-mint"
                            layoutId="activeNav"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="mt-auto p-4 border-t border-sidebar-border flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-success" title="Connected" />
      </div>
    </Sidebar>
  );
}
