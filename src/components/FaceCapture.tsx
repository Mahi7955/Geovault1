import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw, Loader2, CheckCircle } from "lucide-react";
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
}

export const FaceCapture = ({
  onCapture,
  captureLabel = "Capture Face",
  autoCapture = false,
  capturedLabel = "Face captured",
}: FaceCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [working, setWorking] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setWorking(true);
        await loadModels();
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 480, height: 360, facingMode: "user" },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
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
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!ready || !autoCapture || done) return;
    const t = setTimeout(() => {
      handleCapture();
    }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, autoCapture]);

  const handleCapture = async () => {
    if (!videoRef.current || working) return;
    setWorking(true);
    setError(null);
    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

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

  const handleRetake = () => {
    setDone(false);
    setError(null);
  };

  return (
    <div className="space-y-3">
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

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex gap-2">
        {!done ? (
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
            variant="outline"
            onClick={handleRetake}
            className="flex-1"
          >
            <RefreshCw className="w-4 h-4" />
            Retake
          </Button>
        )}
      </div>
    </div>
  );
};
