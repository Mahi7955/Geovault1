import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Eye, Clock, Bell, FileCheck } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iaHNsKDE4OSA5NCUgNDMlIC8gMC4wNSkiLz48L2c+PC9zdmc+')] opacity-30"></div>

      <nav className="relative border-b border-border/50 backdrop-blur-sm bg-card/30">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              SecureVault
            </span>
          </div>
          <Button onClick={() => navigate("/auth")} className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
            Get Started
          </Button>
        </div>
      </nav>

      <main className="relative">
        <section className="container mx-auto px-4 py-24 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="inline-block">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow mb-6 animate-pulse">
                <Lock className="w-10 h-10 text-primary-foreground" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
              Share Secrets Securely
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Advanced encryption with approval-based access control. 
              Share confidential information with complete oversight.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8 shadow-glow"
              >
                Start Securing Now
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-primary/20 hover:border-primary/40 text-lg px-8"
              >
                Learn More
              </Button>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Military-Grade Security Features
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all shadow-soft hover:shadow-glow">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AES Encryption</h3>
              <p className="text-muted-foreground">
                All secrets are encrypted with military-grade algorithms before storage
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all shadow-soft hover:shadow-glow">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Access Approval</h3>
              <p className="text-muted-foreground">
                Viewers must request permission before accessing any secret
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all shadow-soft hover:shadow-glow">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Auto-Destruction</h3>
              <p className="text-muted-foreground">
                Secrets automatically expire after view limits or time expires
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all shadow-soft hover:shadow-glow">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-time Notifications</h3>
              <p className="text-muted-foreground">
                Instant alerts when someone requests access to your secrets
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all shadow-soft hover:shadow-glow">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                <FileCheck className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Audit Logs</h3>
              <p className="text-muted-foreground">
                Comprehensive logging of all access attempts and approvals
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card/80 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all shadow-soft hover:shadow-glow">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Geo-Restrictions</h3>
              <p className="text-muted-foreground">
                Limit access to specific regions or IP ranges for added security
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-24 text-center">
          <div className="max-w-3xl mx-auto p-12 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to secure your secrets?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands who trust SecureVault for confidential information sharing
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-12 shadow-glow"
            >
              Create Free Account
            </Button>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-border/50 backdrop-blur-sm bg-card/30 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 SecureVault. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
