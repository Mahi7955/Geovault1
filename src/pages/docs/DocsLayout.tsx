import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, BookOpen, Server, Database, Lock, Users, FileText, Rocket, AlertCircle, HelpCircle, Code, Shield, Download } from "lucide-react";
import html2pdf from "html2pdf.js";
import { toast } from "sonner";

// Import all documentation pages
import Introduction from "./Introduction";
import QuickStart from "./QuickStart";
import Architecture from "./Architecture";
import DatabaseDoc from "./Database";
import Security from "./Security";
import API from "./API";

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
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    toast.info("Preparing comprehensive PDF export...");

    try {
      // Create a temporary container with all documentation content
      const printContainer = document.createElement("div");
      printContainer.style.position = "absolute";
      printContainer.style.left = "-9999px";
      printContainer.style.width = "210mm"; // A4 width
      printContainer.style.fontFamily = "Arial, sans-serif";
      printContainer.style.color = "#1a1a1a";
      printContainer.style.backgroundColor = "#ffffff";
      document.body.appendChild(printContainer);

      // Add title page
      const titlePage = document.createElement("div");
      titlePage.innerHTML = `
        <div style="text-align: center; padding: 100px 40px; page-break-after: always;">
          <div style="width: 80px; height: 80px; margin: 0 auto 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 40px;">🔒</span>
          </div>
          <h1 style="font-size: 48px; font-weight: bold; margin-bottom: 20px; color: #1a1a1a;">SecureVault</h1>
          <h2 style="font-size: 24px; color: #666; margin-bottom: 40px;">Complete Documentation</h2>
          <p style="font-size: 14px; color: #999; margin-bottom: 10px;">Generated on ${new Date().toLocaleDateString()}</p>
          <p style="font-size: 12px; color: #aaa;">Comprehensive guide covering all features and implementation details</p>
        </div>
      `;
      printContainer.appendChild(titlePage);

      // Add table of contents
      const tocPage = document.createElement("div");
      tocPage.innerHTML = `
        <div style="padding: 40px; page-break-after: always;">
          <h2 style="font-size: 32px; font-weight: bold; margin-bottom: 30px; color: #1a1a1a; border-bottom: 3px solid #667eea; padding-bottom: 10px;">Table of Contents</h2>
          <div style="font-size: 14px; line-height: 2;">
            <div style="margin-bottom: 20px;">
              <div style="font-weight: bold; font-size: 16px; color: #667eea; margin-bottom: 10px;">Getting Started</div>
              <div style="margin-left: 20px;">
                <div>1. Introduction to SecureVault</div>
                <div>2. Quick Start Guide</div>
              </div>
            </div>
            <div style="margin-bottom: 20px;">
              <div style="font-weight: bold; font-size: 16px; color: #667eea; margin-bottom: 10px;">Architecture</div>
              <div style="margin-left: 20px;">
                <div>3. System Architecture</div>
              </div>
            </div>
            <div style="margin-bottom: 20px;">
              <div style="font-weight: bold; font-size: 16px; color: #667eea; margin-bottom: 10px;">Database</div>
              <div style="margin-left: 20px;">
                <div>4. Database Design</div>
              </div>
            </div>
            <div style="margin-bottom: 20px;">
              <div style="font-weight: bold; font-size: 16px; color: #667eea; margin-bottom: 10px;">API Documentation</div>
              <div style="margin-left: 20px;">
                <div>5. API Reference</div>
              </div>
            </div>
            <div style="margin-bottom: 20px;">
              <div style="font-weight: bold; font-size: 16px; color: #667eea; margin-bottom: 10px;">Security</div>
              <div style="margin-left: 20px;">
                <div>6. Security Overview</div>
              </div>
            </div>
          </div>
        </div>
      `;
      printContainer.appendChild(tocPage);

      // Define all documentation pages to export
      const docPages = [
        { component: Introduction, title: "Introduction to SecureVault" },
        { component: QuickStart, title: "Quick Start Guide" },
        { component: Architecture, title: "System Architecture" },
        { component: DatabaseDoc, title: "Database Design" },
        { component: API, title: "API Documentation" },
        { component: Security, title: "Security Overview" },
      ];

      // Render each documentation page
      for (let i = 0; i < docPages.length; i++) {
        const pageSection = document.createElement("div");
        pageSection.style.padding = "40px";
        pageSection.style.pageBreakAfter = i < docPages.length - 1 ? "always" : "auto";
        
        // Add section number and title at the top
        const sectionHeader = document.createElement("div");
        sectionHeader.innerHTML = `
          <div style="margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb;">
            <span style="color: #667eea; font-weight: bold; font-size: 14px;">SECTION ${i + 1}</span>
          </div>
        `;
        pageSection.appendChild(sectionHeader);

        // Render the React component to HTML
        const componentContainer = document.createElement("div");
        const root = createRoot(componentContainer);
        const PageComponent = docPages[i].component;
        
        // Render and wait for it to complete
        await new Promise<void>((resolve) => {
          root.render(<PageComponent />);
          setTimeout(() => {
            pageSection.appendChild(componentContainer);
            resolve();
          }, 100);
        });

        printContainer.appendChild(pageSection);
      }

      // Wait a bit for all content to render
      await new Promise(resolve => setTimeout(resolve, 500));

      // Configure PDF options
      const options = {
        margin: [15, 15, 15, 15] as [number, number, number, number],
        filename: `SecureVault-Complete-Documentation-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: "jpeg" as const, quality: 0.95 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          letterRendering: true,
          logging: false,
          backgroundColor: "#ffffff"
        },
        jsPDF: { 
          unit: "mm", 
          format: "a4", 
          orientation: "portrait" as const,
          compress: true
        },
        pagebreak: { 
          mode: ["avoid-all", "css", "legacy"],
          before: ".page-break-before",
          after: ".page-break-after",
          avoid: ["img", "pre", "code"]
        },
      };

      toast.info("Generating PDF... This may take a moment.");

      // Generate PDF
      await html2pdf().set(options).from(printContainer).save();
      
      // Cleanup
      document.body.removeChild(printContainer);
      
      toast.success("Complete documentation exported successfully!");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

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

      {/* Export PDF Button - Fixed position */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleExportPDF}
          disabled={isExporting}
          size="lg"
          className="shadow-lg"
        >
          <Download className="w-5 h-5 mr-2" />
          {isExporting ? "Exporting..." : "Export Complete Docs as PDF"}
        </Button>
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
