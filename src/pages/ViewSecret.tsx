import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Shield, Lock, MapPin, CheckCircle, XCircle, FileImage, ScanFace } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FaceCapture } from "@/components/FaceCapture";

type Step = "loading" | "location" | "face" | "granted" | "denied";

const ViewSecret = () => {
  const { secretId } = useParams();
  const [step, setStep] = useState<Step>("loading");
  const [verifying, setVerifying] = useState(false);
  const [secretInfo, setSecretInfo] = useState<any>(null);
  const [decryptedContent, setDecryptedContent] = useState("");
  const [denialMessage, setDenialMessage] = useState("");
  const [distance, setDistance] = useState<number | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [faceRequired, setFaceRequired] = useState(false);

  useEffect(() => {
    checkAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secretId]);

  const checkAccess = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("get-secret-info", {
        body: { secretId },
      });

      if (error || !data || !data.found) {
        setStep("denied");
        setDenialMessage("Secret not found.");
        return;
      }

      if (!data.available) {
        setStep("denied");
        setDenialMessage(
          data.expired
            ? "This secret has expired."
            : "This secret has reached its maximum number of views and is no longer available."
        );
        return;
      }

      setSecretInfo({ id: data.id, title: data.title });
      setFaceRequired(!!data.face_verification_enabled);
      setStep("location");
    } catch (error: any) {
      toast.error(error.message);
      setStep("denied");
      setDenialMessage(error.message);
    }
  };

  const handleSecretPayload = (encryptedContent: string, returnedFileUrl: string | null) => {
    setDecryptedContent(atob(encryptedContent));
    if (returnedFileUrl) {
      const { data: { publicUrl } } = supabase.storage
        .from("secret-files")
        .getPublicUrl(returnedFileUrl);
      setFileUrl(publicUrl);
      const extension = returnedFileUrl.split(".").pop()?.toLowerCase();
      if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")) setFileType("image");
      else if (["mp4", "webm"].includes(extension || "")) setFileType("video");
      else if (["mp3", "wav", "ogg"].includes(extension || "")) setFileType("audio");
      else if (extension === "pdf") setFileType("pdf");
    }
    setStep("granted");
  };

  const verifyLocation = async () => {
    setVerifying(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation is not supported by your browser"));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;

      const { data, error } = await supabase.functions.invoke("verify-location", {
        body: { secretId, viewerLat: latitude, viewerLng: longitude },
      });

      if (error) {
        toast.error("Failed to verify location");
        return;
      }

      if (!data.allowed) {
        setStep("denied");
        setDenialMessage(data.message);
        setDistance(data.distance);
        return;
      }

      setDistance(data.distance);

      if (faceRequired) {
        toast.success(`Location verified (${data.distance}m). Now verify your face.`);
        setPendingPayload(
          data.encryptedContent
            ? { encryptedContent: data.encryptedContent, fileUrl: data.fileUrl }
            : null
        );
        setStep("face");
      } else {
        handleSecretPayload(data.encryptedContent, data.fileUrl);
        toast.success(`Access granted! You are ${data.distance}m away.`);
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

  const [pendingPayload, setPendingPayload] = useState<{ encryptedContent: string; fileUrl: string | null } | null>(null);

  const handleFaceCapture = async (descriptor: number[]) => {
    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-face", {
        body: { secretId, descriptor },
      });
      if (error) {
        toast.error("Face verification failed");
        return;
      }
      if (data.allowed) {
        const payload = pendingPayload || {
          encryptedContent: data.encryptedContent,
          fileUrl: data.fileUrl,
        };
        handleSecretPayload(payload.encryptedContent, payload.fileUrl);
        toast.success("Face verified! Access granted.");
      } else {
        setAttemptsRemaining(data.attemptsRemaining ?? 0);
        if (data.locked) {
          setStep("denied");
          setDenialMessage(data.message);
        } else {
          toast.error(data.message);
        }
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setVerifying(false);
    }
  };

  if (step === "loading") {
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
              {step === "location" && "Step 1: Verify your location"}
              {step === "face" && "Step 2: Verify your face"}
              {step === "granted" && "Access granted"}
              {step === "denied" && "Access denied"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === "location" && (
              <>
                <Alert>
                  <MapPin className="h-4 w-4" />
                  <AlertDescription>
                    You must be within 100 meters of the designated location.
                    {faceRequired && " Face verification will be required next."}
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={verifyLocation}
                  disabled={verifying}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  {verifying ? "Verifying Location..." : "Verify Location"}
                </Button>
              </>
            )}

            {step === "face" && (
              <>
                <Alert>
                  <ScanFace className="h-4 w-4" />
                  <AlertDescription>
                    Look at the camera. Only the registered face can unlock this secret.
                    {" "}
                    <span className="font-medium">{attemptsRemaining} attempt{attemptsRemaining === 1 ? "" : "s"} remaining.</span>
                  </AlertDescription>
                </Alert>
                <FaceCapture
                  onCapture={handleFaceCapture}
                  captureLabel="Verify My Face"
                  capturedLabel="Verifying..."
                />
              </>
            )}

            {step === "granted" && (
              <div className="space-y-4">
                <Alert className="border-green-500/50 bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-500">
                    Access Granted!{distance !== null && ` You are ${distance}m from the allowed location.`}
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Secret Content:</p>
                  <div className="p-4 bg-secondary/50 border border-border rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{decryptedContent}</p>
                  </div>
                </div>

                {fileUrl && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <FileImage className="w-4 h-4" />
                      Attached Media:
                    </p>
                    <div className="p-4 bg-secondary/50 border border-border rounded-lg">
                      {fileType === "image" && (
                        <img src={fileUrl} alt="Secret attachment" className="w-full rounded-lg max-h-96 object-contain" />
                      )}
                      {fileType === "video" && (
                        <video src={fileUrl} controls className="w-full rounded-lg max-h-96" />
                      )}
                      {fileType === "audio" && <audio src={fileUrl} controls className="w-full" />}
                      {fileType === "pdf" && (
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">PDF Document</p>
                          <Button onClick={() => window.open(fileUrl, "_blank")} variant="outline" className="w-full">
                            Open PDF
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === "denied" && (
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
