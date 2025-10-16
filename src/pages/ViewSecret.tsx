import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield, Lock, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ViewSecret = () => {
  const { secretId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [secretInfo, setSecretInfo] = useState<any>(null);
  const [decryptedContent, setDecryptedContent] = useState("");

  useEffect(() => {
    checkAccess();
  }, [secretId]);

  const checkAccess = async () => {
    try {
      // Check if secret exists and is active
      const { data: secret, error: secretError } = await supabase
        .from("secrets")
        .select("id, title, is_active, expire_at, remaining_views")
        .eq("id", secretId)
        .maybeSingle();

      if (secretError || !secret) {
        toast.error("Secret not found");
        return;
      }

      if (!secret.is_active) {
        toast.error("This secret is no longer available");
        return;
      }

      setSecretInfo(secret);
      setLoading(false);
    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading secret...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iaHNsKDE4OSA5NCUgNDMlIC8gMC4wNSkiLz48L2c+PC9zdmc+')] opacity-30"></div>

      <nav className="relative border-b border-border/50 backdrop-blur-sm bg-card/30">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            SecureVault
          </span>
        </div>
      </nav>

      <main className="relative container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Lock className="w-6 h-6 text-primary" />
              {secretInfo?.title}
            </CardTitle>
            <CardDescription>
              Ready to view this secret
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Location verification will be required to access this secret.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ViewSecret;
