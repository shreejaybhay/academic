"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Download, ZoomIn, ZoomOut, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function QRGenerator({ sessionData }) {
  const [size, setSize] = useState(256);
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Adjust QR code size for mobile
      if (window.innerWidth < 768) {
        setSize(Math.min(window.innerWidth - 100, 256));
      } else {
        setSize(256);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const downloadQRCode = () => {
    try {
      // Create a text file with the QR code value
      const qrValue = sessionData.qrCodeData;
      const blob = new Blob([qrValue], { type: "text/plain" });
      const url = URL.createObjectURL(blob);

      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = `qr-code-${sessionData.subject.replace(
        /\s+/g,
        "-"
      )}.txt`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "QR code value downloaded as text file",
      });
    } catch (error) {
      console.error("Error downloading QR code:", error);
      toast({
        title: "Error",
        description: "Failed to download QR code: " + error.message,
        variant: "destructive",
      });
    }
  };

  const shareQRCode = async () => {
    try {
      if (!navigator.share) {
        toast({
          title: "Error",
          description: "Sharing is not supported on this device",
          variant: "destructive",
        });
        return;
      }

      // Share just the text (more reliable than sharing files)
      await navigator.share({
        title: `QR Code for ${sessionData.subject}`,
        text: `Session: ${sessionData.subject}\nQR Code Value: ${sessionData.qrCodeData}\n\nUse this code to mark your attendance.`,
      });

      toast({
        title: "Success",
        description: "QR code information shared successfully",
      });
    } catch (error) {
      console.error("Error sharing QR code:", error);
      if (error.name !== "AbortError") {
        toast({
          title: "Error",
          description: "Failed to share QR code: " + error.message,
          variant: "destructive",
        });
      }
    }
  };

  if (!sessionData) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
        <CardTitle className="text-lg sm:text-xl">Session QR Code</CardTitle>
        <CardDescription className="text-xs sm:text-sm space-y-1 mt-2">
          <p>
            <span className="font-medium">Subject:</span> {sessionData.subject}
          </p>
          <p>
            <span className="font-medium">Date:</span>{" "}
            {new Date(sessionData.date).toLocaleString()}
          </p>
          <p>
            <span className="font-medium">Expires:</span>{" "}
            {new Date(sessionData.expiresAt).toLocaleString()}
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 py-4 sm:py-6 flex flex-col items-center gap-4">
        <div className="border p-4 rounded-lg bg-white">
          <QRCodeSVG
            id="qr-svg"
            value={sessionData.qrCodeData}
            size={size}
            level="H"
            includeMargin
          />
        </div>

        <div className="text-xs sm:text-sm text-center text-muted-foreground w-full">
          <p className="font-medium mb-1">QR Code Value:</p>
          <p className="font-mono text-xs break-all bg-muted p-2 rounded-md overflow-x-auto">
            {sessionData.qrCodeData}
          </p>
          <p className="mt-2 text-xs">
            You can manually enter this value if scanning doesn't work
          </p>
        </div>

        <div className="w-full max-w-xs flex items-center gap-2">
          <ZoomOut className="h-4 w-4 text-muted-foreground" />
          <Slider
            value={[size]}
            min={128}
            max={400}
            step={8}
            onValueChange={(value) => setSize(value[0])}
            className="flex-1"
          />
          <ZoomIn className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardContent>
      <CardFooter className="px-4 sm:px-6 py-4 sm:py-6 flex flex-col sm:flex-row gap-2 justify-center">
        <Button onClick={downloadQRCode} className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Download QR Code
        </Button>

        {navigator && navigator.share && (
          <Button
            variant="outline"
            onClick={shareQRCode}
            className="w-full sm:w-auto"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share QR Code
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
