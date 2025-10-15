import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, Eye, Lock, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ViewSecret = () => {
  const { secretId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requesterEmail, setRequesterEmail] = useState("");
  const [justification, setJustification] = useState("");
  const [secretInfo, setSecretInfo] = useState<any>(null);
  const [accessStatus, setAccessStatus] = useState<"none" | "pending" | "approved" | "rejected">("none");
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

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setAccessStatus("none");
        setLoading(false);
        return;
      }

      // Check if user is the owner
      const { data: ownerSecret } = await supabase
        .from("secrets")
        .select("owner_id")
        .eq("id", secretId)
        .eq("owner_id", user.id)
        .maybeSingle();

      if (ownerSecret) {
        toast.error("You cannot view your own secret");
        navigate("/dashboard");
        return;
      }

      // Check for existing access request
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", user.id)
        .single();

      const userEmail = profile?.email || "";
      setRequesterEmail(userEmail);

      const { data: existingRequest } = await supabase
        .from("access_requests")
        .select("status")
        .eq("secret_id", secretId)
        .eq("requester_email", userEmail)
        .maybeSingle();

      if (existingRequest) {
        setAccessStatus(existingRequest.status as any);
        
        if (existingRequest.status === "approved") {
          // Check whitelist - must have remaining views to access
          const { data: whitelist, error: whitelistError } = await supabase
            .from("whitelists")
            .select("remaining_views")
            .eq("secret_id", secretId)
            .eq("requester_email", userEmail)
            .gt("remaining_views", 0)
            .maybeSingle();

          if (!whitelistError && whitelist && whitelist.remaining_views > 0) {
            await loadSecret();
          } else {
            toast.error("Access has expired or is no longer available");
          }
        } else if (existingRequest.status === "rejected") {
          toast.error("Your access request was rejected");
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSecret = async () => {
    try {
      const { data: secret, error } = await supabase
        .from("secrets")
        .select("encrypted_content, title")
        .eq("id", secretId)
        .single();

      if (error) throw error;

      // Simple decryption (matches the btoa encryption)
      const decrypted = atob(secret.encrypted_content);
      setDecryptedContent(decrypted);

      // Update remaining views
      await supabase.rpc("deactivate_expired_secrets");
      
      // Log the view
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", user!.id)
        .single();

      await supabase.from("audit_logs").insert({
        secret_id: secretId,
        viewer_email: profile?.email || "",
        action: "viewed",
        viewer_ip: "",
      });

      // Decrease whitelist views
      const { data: currentWhitelist } = await supabase
        .from("whitelists")
        .select("remaining_views")
        .eq("secret_id", secretId)
        .eq("requester_email", profile?.email || "")
        .single();
      
      if (currentWhitelist) {
        await supabase
          .from("whitelists")
          .update({ remaining_views: currentWhitelist.remaining_views - 1 })
          .eq("secret_id", secretId)
          .eq("requester_email", profile?.email || "");
      }

      toast.success("Secret loaded successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from("access_requests")
        .insert({
          secret_id: secretId,
          requester_email: requesterEmail,
          justification: justification,
          status: "pending",
        });

      if (error) throw error;

      toast.success("Access request submitted!");
      setAccessStatus("pending");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
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
        {decryptedContent ? (
          <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Eye className="w-6 h-6 text-primary" />
                {secretInfo?.title}
              </CardTitle>
              <CardDescription>
                This secret will self-destruct after viewing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                <pre className="whitespace-pre-wrap break-words text-sm">{decryptedContent}</pre>
              </div>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This secret has been logged. Remaining views: {secretInfo?.remaining_views - 1}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        ) : accessStatus === "pending" ? (
          <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Lock className="w-6 h-6 text-yellow-500" />
                Access Request Pending
              </CardTitle>
              <CardDescription>
                Your request is awaiting approval from the secret owner
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You will be notified once the owner reviews your request.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        ) : accessStatus === "rejected" ? (
          <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Lock className="w-6 h-6 text-red-500" />
                Access Denied
              </CardTitle>
              <CardDescription>
                Your access request was rejected by the secret owner
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Lock className="w-6 h-6 text-primary" />
                Request Access to Secret
              </CardTitle>
              <CardDescription>
                {secretInfo?.title ? `Secret: ${secretInfo.title}` : "Provide your details to request access"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRequestAccess} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Your Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={requesterEmail}
                    onChange={(e) => setRequesterEmail(e.target.value)}
                    required
                    className="bg-secondary/50 border-border focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="justification">Why do you need access? (optional)</Label>
                  <Textarea
                    id="justification"
                    placeholder="Provide a reason for your access request..."
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    rows={4}
                    className="bg-secondary/50 border-border focus:border-primary resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Request Access"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default ViewSecret;
