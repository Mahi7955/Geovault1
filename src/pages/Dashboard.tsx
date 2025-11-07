import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Shield, Plus, Key, LogOut, Eye, Clock, Search, FileKey, Activity, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/StatCard";
import { ShareSecretDialog } from "@/components/ShareSecretDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Secret {
  id: string;
  title: string;
  remaining_views: number;
  max_views: number;
  expire_at: string;
  is_active: boolean;
  created_at: string;
  file_url: string | null;
}


const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [filteredSecrets, setFilteredSecrets] = useState<Secret[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
      // Load user's secrets
      const { data: secretsData, error: secretsError } = await supabase
        .from("secrets")
        .select("*")
        .order("created_at", { ascending: false });

      if (secretsError) throw secretsError;

      setSecrets(secretsData || []);
      setFilteredSecrets(secretsData || []);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredSecrets(secrets);
    } else {
      const filtered = secrets.filter(secret =>
        secret.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSecrets(filtered);
    }
  };

  const handleDeleteSecret = async (secretId: string, fileUrl: string | null) => {
    try {
      // Delete file from storage if it exists
      if (fileUrl) {
        const { error: storageError } = await supabase.storage
          .from('secret-files')
          .remove([fileUrl]);
        
        if (storageError) {
          console.error("Error deleting file:", storageError);
        }
      }

      // Delete secret from database
      const { error: deleteError } = await supabase
        .from('secrets')
        .delete()
        .eq('id', secretId);

      if (deleteError) throw deleteError;

      toast.success("Secret deleted successfully");
      loadData(); // Refresh the list
    } catch (error: any) {
      console.error("Error deleting secret:", error);
      toast.error(error.message);
    }
  };

  const stats = {
    total: secrets.length,
    active: secrets.filter(s => s.is_active).length,
    totalViews: secrets.reduce((acc, s) => acc + (s.max_views - s.remaining_views), 0)
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Secrets" value={stats.total} icon={FileKey} />
          <StatCard title="Active Secrets" value={stats.active} icon={Shield} gradient="from-accent to-primary" />
          <StatCard title="Total Views" value={stats.totalViews} icon={Activity} gradient="from-primary via-accent to-primary" />
        </div>

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
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search secrets..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-secondary/50 border-border focus:border-primary"
              />
            </div>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : filteredSecrets.length === 0 ? (
              <p className="text-muted-foreground">
                {searchQuery ? "No secrets match your search." : "No secrets yet. Create your first one!"}
              </p>
            ) : (
              <div className="space-y-3">
                {filteredSecrets.map((secret) => (
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
                        <div className="flex items-center gap-2">
                          <ShareSecretDialog secretId={secret.id} />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-destructive/20 hover:bg-destructive/10 hover:border-destructive/40"
                              >
                                <Trash2 className="w-4 h-4 mr-2 text-destructive" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Secret</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{secret.title}"? This action cannot be undone and will permanently delete the secret and any attached files.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteSecret(secret.id, secret.file_url)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <Badge variant={secret.is_active ? "default" : "secondary"}>
                            {secret.is_active ? "Active" : "Expired"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
