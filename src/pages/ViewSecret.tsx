import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Shield, Lock, AlertCircle, MapPin, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ViewSecret = () => {
  const { secretId } = useParams();
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [secretInfo, setSecretInfo] = useState<any>(null);
  const [decryptedContent, setDecryptedContent] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [denialMessage, setDenialMessage] = useState("");
  const [distance, setDistance] = useState<number | null>(null);

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
        setLoading(false);
        return;
      }

      if (!secret.is_active) {
        toast.error("This secret is no longer available");
        setLoading(false);
        return;
      }

      setSecretInfo(secret);
      setLoading(false);
    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const verifyLocation = async () => {
    setVerifying(true);
    try {
      // Get user's current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation is not supported by your browser"));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;

      // Call edge function to verify location
      const { data, error } = await supabase.functions.invoke('verify-location', {
        body: {
          secretId,
          viewerLat: latitude,
          viewerLng: longitude
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        toast.error("Failed to verify location");
        return;
      }

      if (data.allowed) {
        setAccessGranted(true);
        setDistance(data.distance);
        setDecryptedContent(atob(data.encryptedContent));
        toast.success(`Access granted! You are ${data.distance}m away.`);
      } else {
        setAccessDenied(true);
        setDenialMessage(data.message);
        setDistance(data.distance);
      }
    } catch (error: any) {
      if (error.code === 1) {
        toast.error("Location access denied. Please enable location services.");
      } else {
        toast.error(error.message);
      }
    } finally {
      setVerifying(false);
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
          <CardContent className="space-y-6">
            {!accessGranted && !accessDenied && (
              <>
                <Alert>
                  <MapPin className="h-4 w-4" />
                  <AlertDescription>
                    Location verification is required to access this secret. You must be within 100 meters of the designated location.
                  </AlertDescription>
                </Alert>
                <Button 
                  onClick={verifyLocation}
                  disabled={verifying}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  {verifying ? "Verifying Location..." : "Verify Location & View Secret"}
                </Button>
              </>
            )}

            {accessGranted && (
              <div className="space-y-4">
                <Alert className="border-green-500/50 bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-500">
                    Access Granted! You are {distance}m from the allowed location.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Secret Content:</p>
                  <div className="p-4 bg-secondary/50 border border-border rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{decryptedContent}</p>
                  </div>
                </div>
              </div>
            )}

            {accessDenied && (
              <Alert className="border-red-500/50 bg-red-500/10">
                <XCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-500">
                  {denialMessage}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ViewSecret;
