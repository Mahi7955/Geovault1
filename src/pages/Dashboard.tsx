import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield, Plus, Key, LogOut, Eye, Clock, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Secret {
  id: string;
  title: string;
  remaining_views: number;
  max_views: number;
  expire_at: string;
  is_active: boolean;
  created_at: string;
}

interface AccessRequest {
  id: string;
  requester_email: string;
  justification: string;
  status: string;
  created_at: string;
  secret_id: string;
  secrets: {
    title: string;
    max_views: number;
  };
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadData();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [secretsRes, requestsRes] = await Promise.all([
        supabase.from("secrets").select("*").order("created_at", { ascending: false }),
        supabase
          .from("access_requests")
          .select("*, secrets(title, max_views)")
          .eq("status", "pending")
          .order("created_at", { ascending: false })
      ]);

      if (secretsRes.error) throw secretsRes.error;
      if (requestsRes.error) throw requestsRes.error;

      setSecrets(secretsRes.data || []);
      setRequests(requestsRes.data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleRequestAction = async (requestId: string, status: "approved" | "rejected", request: AccessRequest) => {
    try {
      const { error } = await supabase
        .from("access_requests")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", requestId);

      if (error) throw error;

      // If approved, create whitelist entry
      if (status === "approved") {
        const { error: whitelistError } = await supabase
          .from("whitelists")
          .insert({
            secret_id: request.secret_id,
            requester_email: request.requester_email,
            allowed_views: request.secrets.max_views || 1,
            remaining_views: request.secrets.max_views || 1,
          });

        if (whitelistError) throw whitelistError;
      }

      toast.success(`Request ${status}!`);
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iaHNsKDE4OSA5NCUgNDMlIC8gMC4wNSkiLz48L2c+PC9zdmc+')] opacity-30"></div>

      <nav className="relative border-b border-border/50 backdrop-blur-sm bg-card/30">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              SecureVault
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="border-primary/20">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="relative container mx-auto px-4 py-8 space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-primary" />
                    Your Secrets
                  </CardTitle>
                  <CardDescription>Manage your encrypted secrets</CardDescription>
                </div>
                <Button
                  onClick={() => navigate("/create-secret")}
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Secret
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : secrets.length === 0 ? (
                <p className="text-muted-foreground">No secrets yet. Create your first one!</p>
              ) : (
                <div className="space-y-3">
                  {secrets.map((secret) => (
                    <Card key={secret.id} className="bg-secondary/30 border-border/50 hover:border-primary/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{secret.title}</h4>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {secret.remaining_views}/{secret.max_views} views
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Expires {new Date(secret.expire_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <Badge variant={secret.is_active ? "default" : "secondary"}>
                            {secret.is_active ? "Active" : "Expired"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent" />
                Access Requests
              </CardTitle>
              <CardDescription>Pending requests from viewers</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : requests.length === 0 ? (
                <p className="text-muted-foreground">No pending requests</p>
              ) : (
                <div className="space-y-3">
                  {requests.map((request) => (
                    <Card key={request.id} className="bg-secondary/30 border-border/50">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-sm mb-1">
                              Secret: {request.secrets.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-1">
                              From: {request.requester_email}
                            </p>
                            {request.justification && (
                              <p className="text-xs text-muted-foreground italic">
                                "{request.justification}"
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleRequestAction(request.id, "approved", request)}
                              className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRequestAction(request.id, "rejected", request)}
                              className="flex-1"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
