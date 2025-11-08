import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, BookOpen, Server, Database, Lock, Users, FileText, Rocket, AlertCircle, HelpCircle, Code, Shield } from "lucide-react";

const docSections = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", path: "/docs/introduction", icon: BookOpen },
      { title: "Quick Start", path: "/docs/quick-start", icon: Rocket },
      { title: "Project Overview", path: "/docs/overview", icon: FileText },
    ],
  },
  {
    title: "Architecture",
    items: [
      { title: "System Architecture", path: "/docs/architecture", icon: Server },
      { title: "Technology Stack", path: "/docs/tech-stack", icon: Code },
      { title: "Frontend Structure", path: "/docs/frontend", icon: BookOpen },
      { title: "Backend Infrastructure", path: "/docs/backend", icon: Database },
    ],
  },
  {
    title: "Features",
    items: [
      { title: "Core Features", path: "/docs/features", icon: BookOpen },
      { title: "Secret Management", path: "/docs/secret-management", icon: Lock },
      { title: "Location Verification", path: "/docs/location-verification", icon: Server },
      { title: "File Attachments", path: "/docs/file-attachments", icon: FileText },
      { title: "Audit System", path: "/docs/audit-system", icon: AlertCircle },
    ],
  },
  {
    title: "Database",
    items: [
      { title: "Database Design", path: "/docs/database", icon: Database },
      { title: "Schema Reference", path: "/docs/schema", icon: Code },
      { title: "RLS Policies", path: "/docs/rls-policies", icon: Lock },
      { title: "Migrations", path: "/docs/migrations", icon: FileText },
    ],
  },
  {
    title: "API Documentation",
    items: [
      { title: "API Overview", path: "/docs/api", icon: Server },
      { title: "Edge Functions", path: "/docs/edge-functions", icon: Code },
      { title: "Authentication API", path: "/docs/auth-api", icon: Lock },
      { title: "Storage API", path: "/docs/storage-api", icon: Database },
    ],
  },
  {
    title: "Security",
    items: [
      { title: "Security Overview", path: "/docs/security", icon: Lock },
      { title: "Encryption", path: "/docs/encryption", icon: Lock },
      { title: "Access Control", path: "/docs/access-control", icon: Users },
      { title: "Best Practices", path: "/docs/security-best-practices", icon: AlertCircle },
    ],
  },
  {
    title: "Guides",
    items: [
      { title: "User Guide", path: "/docs/user-guide", icon: Users },
      { title: "Admin Guide", path: "/docs/admin-guide", icon: Users },
      { title: "Deployment Guide", path: "/docs/deployment", icon: Rocket },
      { title: "Configuration", path: "/docs/configuration", icon: FileText },
    ],
  },
  {
    title: "Help",
    items: [
      { title: "Troubleshooting", path: "/docs/troubleshooting", icon: AlertCircle },
      { title: "FAQ", path: "/docs/faq", icon: HelpCircle },
      { title: "Support", path: "/docs/support", icon: Users },
    ],
  },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="w-64 border-r border-border bg-card/30">
      <div className="p-6 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <span className="font-bold text-xl">SecureVault</span>
        </Link>
        <p className="text-sm text-muted-foreground mt-1">Documentation</p>
      </div>
      <ScrollArea className="h-[calc(100vh-88px)]">
        <div className="p-4">
          {docSections.map((section) => (
            <div key={section.title} className="mb-6">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-2">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link key={item.path} to={item.path}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className="w-full justify-start text-sm"
                        size="sm"
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {item.title}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default function DocsLayout() {
  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8 md:p-12">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
