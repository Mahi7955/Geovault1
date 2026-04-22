import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, ArrowLeft, Lock, Copy, Check, Upload, X, FileImage, FileVideo, FileAudio, ScanFace } from "lucide-react";
import { PasswordStrength } from "@/components/PasswordStrength";
import { Switch } from "@/components/ui/switch";
import { FaceCapture } from "@/components/FaceCapture";

const CreateSecret = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [secretId, setSecretId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    maxViews: 1,
    expirationHours: 24
  });
  const [restrictedLat, setRestrictedLat] = useState<number | null>(null);
  const [restrictedLng, setRestrictedLng] = useState<number | null>(null);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [faceEnabled, setFaceEnabled] = useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState<number[] | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error("Please sign in to create a secret");
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const getCurrentLocation = async () => {
    setFetchingLocation(true);
    try {
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

      setRestrictedLat(position.coords.latitude);
      setRestrictedLng(position.coords.longitude);
      toast.success("Location captured successfully!");
    } catch (error: any) {
      if (error.code === 1) {
        toast.error("Location access denied. Please enable location services.");
      } else {
        toast.error("Failed to get location: " + error.message);
      }
    } finally {
      setFetchingLocation(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (50MB max)
    if (file.size > 52428800) {
      toast.error("File size must be less than 50MB");
      return;
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm',
      'audio/mpeg', 'audio/wav', 'audio/ogg',
      'application/pdf'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error("File type not supported");
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }

    toast.success("File selected");
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className="w-5 h-5" />;
    if (type.startsWith('video/')) return <FileVideo className="w-5 h-5" />;
    if (type.startsWith('audio/')) return <FileAudio className="w-5 h-5" />;
    return <Upload className="w-5 h-5" />;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!restrictedLat || !restrictedLng) {
      toast.error("Please select a location on the map");
      return;
    }

    if (faceEnabled && !faceDescriptor) {
      toast.error("Please capture the receiver's face");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let fileUrl = null;

      // Upload file if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('secret-files')
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        fileUrl = fileName;
        toast.success("File uploaded successfully");
      }

      // Simple encryption (in production, use proper encryption library)
      const encrypted = btoa(formData.content);
      const keyHash = btoa(Math.random().toString());

      const expireAt = new Date();
      expireAt.setHours(expireAt.getHours() + formData.expirationHours);

      const { data, error } = await supabase
        .from("secrets")
        .insert({
          owner_id: user.id,
          title: formData.title,
          encrypted_content: encrypted,
          encryption_key_hash: keyHash,
          max_views: formData.maxViews,
          remaining_views: formData.maxViews,
          expire_at: expireAt.toISOString(),
          geo_restrictions: { latitude: restrictedLat, longitude: restrictedLng },
          file_url: fileUrl,
          face_verification_enabled: faceEnabled,
          face_descriptor: faceEnabled && faceDescriptor ? (faceDescriptor as any) : null,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Secret created with location restriction!");
      setSecretId(data.id);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/secret/${secretId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (secretId) {
    const shareLink = `${window.location.origin}/secret/${secretId}`;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iaHNsKDE4OSA5NCUgNDMlIC8gMC4wNSkiLz48L2c+PC9zdmc+')] opacity-30"></div>
        
        <nav className="relative border-b border-border/50 backdrop-blur-sm bg-card/30">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SecureVault
              </span>
            </div>
          </div>
        </nav>

        <main className="relative container mx-auto px-4 py-8 max-w-2xl">
          <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-center">
                <Check className="w-6 h-6 text-green-500" />
                Secret Created Successfully!
              </CardTitle>
              <CardDescription className="text-center">
                Share this link with your intended recipient
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Shareable Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={shareLink}
                    readOnly
                    className="bg-secondary/50 border-border font-mono text-sm"
                  />
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    className="shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Recipients must be within 100 meters of your current location to view
                </p>
              </div>

              <div className="pt-4 border-t border-border/50">
                <Button
                  onClick={() => navigate("/dashboard")}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                >
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iaHNsKDE4OSA5NCUgNDMlIC8gMC4wNSkiLz48L2c+PC9zdmc+')] opacity-30"></div>

      <nav className="relative border-b border-border/50 backdrop-blur-sm bg-card/30">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              SecureVault
            </span>
          </div>
        </div>
      </nav>

      <main className="relative container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Lock className="w-6 h-6 text-primary" />
              Create New Secret
            </CardTitle>
            <CardDescription>
              Encrypt and securely share your confidential information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Secret Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., API Keys, Password, Confidential Note"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="bg-secondary/50 border-border focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Secret Content</Label>
                <Textarea
                  id="content"
                  placeholder="Enter your confidential information here..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={6}
                  className="bg-secondary/50 border-border focus:border-primary resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label>Attach Media File (Optional)</Label>
                <div className="space-y-3">
                  {!selectedFile ? (
                    <div className="relative">
                      <Input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleFileChange}
                        accept="image/*,video/*,audio/*,application/pdf"
                      />
                      <Label
                        htmlFor="file-upload"
                        className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors bg-secondary/30"
                      >
                        <Upload className="w-6 h-6 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Click to upload image, video, audio or PDF (max 50MB)
                        </span>
                      </Label>
                    </div>
                  ) : (
                    <div className="relative p-4 border border-border rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-3">
                        {filePreview ? (
                          <img src={filePreview} alt="Preview" className="w-16 h-16 object-cover rounded" />
                        ) : (
                          <div className="w-16 h-16 flex items-center justify-center bg-primary/10 rounded">
                            {getFileIcon(selectedFile.type)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={removeFile}
                          className="shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Supported: Images (JPEG, PNG, GIF, WebP), Videos (MP4, WebM), Audio (MP3, WAV, OGG), PDF
                  </p>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maxViews">Maximum Views</Label>
                  <Input
                    id="maxViews"
                    type="number"
                    min="1"
                    value={formData.maxViews}
                    onChange={(e) => setFormData({ ...formData, maxViews: parseInt(e.target.value) })}
                    required
                    className="bg-secondary/50 border-border focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expirationHours">Expiration (hours)</Label>
                  <Input
                    id="expirationHours"
                    type="number"
                    min="1"
                    value={formData.expirationHours}
                    onChange={(e) => setFormData({ ...formData, expirationHours: parseInt(e.target.value) })}
                    required
                    className="bg-secondary/50 border-border focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-destructive font-semibold">Restricted Location (Required)</Label>
                <Button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={fetchingLocation}
                  className="w-full mb-4 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  {fetchingLocation ? "Getting Your Location..." : "Use My Current Location"}
                </Button>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      placeholder="e.g., 28.6139"
                      value={restrictedLat || ""}
                      onChange={(e) => setRestrictedLat(parseFloat(e.target.value))}
                      required
                      className="bg-secondary/50 border-border focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      placeholder="e.g., 77.2090"
                      value={restrictedLng || ""}
                      onChange={(e) => setRestrictedLng(parseFloat(e.target.value))}
                      required
                      className="bg-secondary/50 border-border focus:border-primary"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Click the button above to automatically use your current location, or enter coordinates manually. Viewers must be within 100 meters to access the secret.
                </p>
              </div>

              <div className="space-y-3 p-4 border border-border rounded-lg bg-secondary/30">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2 text-base">
                      <ScanFace className="w-4 h-4 text-primary" />
                      Face Verification
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Only the registered face will be able to open this secret.
                    </p>
                  </div>
                  <Switch
                    checked={faceEnabled}
                    onCheckedChange={(v) => {
                      setFaceEnabled(v);
                      if (!v) setFaceDescriptor(null);
                    }}
                  />
                </div>

                {faceEnabled && (
                  <div className="pt-2">
                    <FaceCapture
                      onCapture={(d) => setFaceDescriptor(d)}
                      allowUpload
                      captureLabel="Capture Receiver's Face"
                      capturedLabel="Face registered"
                    />
                    {faceDescriptor && (
                      <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Face descriptor saved (will be required to view)
                      </p>
                    )}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Encrypted Secret"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateSecret;
