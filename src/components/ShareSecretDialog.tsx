import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface ShareSecretDialogProps {
  secretId: string;
}

export const ShareSecretDialog = ({ secretId }: ShareSecretDialogProps) => {
  const [copied, setCopied] = useState(false);
  const secretUrl = `${window.location.origin}/secret/${secretId}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(secretUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-primary/20">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Secret</DialogTitle>
          <DialogDescription>
            Share this link or QR code with anyone you want to give access to this secret.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input value={secretUrl} readOnly className="flex-1" />
            <Button size="icon" onClick={handleCopy} className="shrink-0">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <div className="flex justify-center p-4 bg-white rounded-lg">
            <QRCodeSVG value={secretUrl} size={200} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
