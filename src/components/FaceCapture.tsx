import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw, Loader2, CheckCircle, Upload } from "lucide-react";
import { toast } from "sonner";

const MODEL_URL = "https://justadudewhohacks.github.io/face-api.js/models";

let modelsLoaded = false;
let modelsLoadingPromise: Promise<void> | null = null;

async function loadModels() {
  if (modelsLoaded) return;
  if (modelsLoadingPromise) return modelsLoadingPromise;
  modelsLoadingPromise = (async () => {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
  })();
  return modelsLoadingPromise;
}

interface FaceCaptureProps {
  onCapture: (descriptor: number[]) => void;
  captureLabel?: string;
  autoCapture?: boolean;
  capturedLabel?: string;
  allowUpload?: boolean;
}

type Mode = "camera" | "upload";

export const FaceCapture = ({
  onCapture,
  captureLabel = "Capture Face",
  autoCapture = false,
  capturedLabel = "Face captured",
  allowUpload = false,
}: FaceCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [mode, setMode] = useState<Mode>("camera");
  const [ready, setReady] = useState(false);
  const [working, setWorking] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      setWorking(true);
      setError(null);
      await loadModels();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 360, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setReady(true);
    } catch (e: any) {
      setError(e?.message || "Camera access failed");
    } finally {
      setWorking(false);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setReady(false);
  };

  useEffect(() => {
    let cancelled = false;
    if (mode === "camera") {
      (async () => {
        if (cancelled) return;
        await startCamera();
      })();
    } else {
      stopCamera();
      // ensure models are loaded for upload extraction
      loadModels().catch(() => {});
    }
    return () => {
      cancelled = true;
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    if (mode !== "camera" || !ready || !autoCapture || done) return;
    const t = setTimeout(() => {
      handleCapture();
    }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, autoCapture, mode]);

  const extractDescriptor = async (input: HTMLVideoElement | HTMLImageElement) => {
    // Larger inputSize improves accuracy, especially for uploaded photos.
    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: 416,
      scoreThreshold: 0.5,
    });
    const detection = await faceapi
      .detectSingleFace(input, options)
      .withFaceLandmarks()
      .withFaceDescriptor();
    return detection;
  };

  const handleCapture = async () => {
    if (!videoRef.current || working) return;
    setWorking(true);
    setError(null);
    try {
      const detection = await extractDescriptor(videoRef.current);
      if (!detection) {
        setError("No face detected. Please center your face and try again.");
        toast.error("No face detected");
        return;
      }
      const descriptor = Array.from(detection.descriptor);
      setDone(true);
      onCapture(descriptor);
      toast.success(capturedLabel);
    } catch (e: any) {
      setError(e?.message || "Failed to capture face");
    } finally {
      setWorking(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setWorking(true);
    setError(null);
    try {
      await loadModels();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });
      setUploadPreview(dataUrl);

      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = () => reject(new Error("Failed to load image"));
        i.src = dataUrl;
      });

      const detection = await extractDescriptor(img);
      if (!detection) {
        setError("No face detected in the photo. Try a clearer, front-facing photo.");
        toast.error("No face detected in photo");
        return;
      }
      const descriptor = Array.from(detection.descriptor);
      setDone(true);
      onCapture(descriptor);
      toast.success(capturedLabel);
    } catch (e: any) {
      setError(e?.message || "Failed to process photo");
    } finally {
      setWorking(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRetake = () => {
    setDone(false);
    setError(null);
    setUploadPreview(null);
  };

  return (
    <div className="space-y-3">
      {allowUpload && (
        <div className="flex gap-2 p-1 bg-secondary/50 rounded-lg">
          <button
            type="button"
            onClick={() => {
              if (mode === "camera") return;
              handleRetake();
              setMode("camera");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              mode === "camera"
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Camera className="w-4 h-4" />
            Webcam
          </button>
          <button
            type="button"
            onClick={() => {
              if (mode === "upload") return;
              handleRetake();
              setMode("upload");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              mode === "upload"
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload Photo
          </button>
        </div>
      )}

      {mode === "camera" ? (
        <div className="relative rounded-lg overflow-hidden border border-border bg-black aspect-[4/3]">
          <video
            ref={videoRef}
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 text-sm text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading camera & models...
            </div>
          )}
          {done && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full border border-green-500/50">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">{capturedLabel}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden border border-border bg-secondary/30 aspect-[4/3] flex items-center justify-center">
          {uploadPreview ? (
            <img
              src={uploadPreview}
              alt="Selected face"
              className="w-full h-full object-contain"
            />
          ) : (
            <label
              htmlFor="face-upload-input"
              className="flex flex-col items-center justify-center gap-2 text-muted-foreground cursor-pointer p-6 text-center"
            >
              <Upload className="w-8 h-8" />
              <span className="text-sm">Click to upload a clear, front-facing photo</span>
              <span className="text-xs">JPEG, PNG, WebP</span>
            </label>
          )}
          <input
            ref={fileInputRef}
            id="face-upload-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {done && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full border border-green-500/50">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">{capturedLabel}</span>
              </div>
            </div>
          )}
          {working && !uploadPreview && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 text-sm text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Processing...
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex gap-2">
        {!done ? (
          mode === "camera" ? (
            <Button
              type="button"
              onClick={handleCapture}
              disabled={!ready || working}
              className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              {working ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  {captureLabel}
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={working}
              className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              {working ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  {uploadPreview ? "Choose Different Photo" : "Choose Photo"}
                </>
              )}
            </Button>
          )
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={handleRetake}
            className="flex-1"
          >
            <RefreshCw className="w-4 h-4" />
            {mode === "camera" ? "Retake" : "Choose Another"}
          </Button>
        )}
      </div>
    </div>
  );
};
