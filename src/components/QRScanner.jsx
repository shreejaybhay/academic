"use client";

import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, KeyRound } from "lucide-react";

export default function QRScanner() {
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const [hasCamera, setHasCamera] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [scannerError, setScannerError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [useManualInput, setUseManualInput] = useState(false);
  const [manualQrValue, setManualQrValue] = useState("");
  const scannerRef = useRef(null);

  // Detect if user is on mobile
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      setIsMobile(isMobileDevice);
    };

    checkMobile();
  }, []);

  // Handle camera scanning
  useEffect(() => {
    if (isScanning) {
      // For mobile devices, we'll try a different approach
      if (isMobile) {
        try {
          // Try direct camera access for mobile
          initMobileScanner();
        } catch (err) {
          console.error("Mobile scanner error:", err);
          // Fallback to regular scanner
          checkCamerasAndInitScanner();
        }
      } else {
        // Desktop approach
        checkCamerasAndInitScanner();
      }
    }

    return () => {
      // Clean up scanner on unmount
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (err) {
          console.error("Error clearing scanner:", err);
        }
      }
    };
  }, [isScanning]);

  const checkCamerasAndInitScanner = () => {
    // Check if camera is available
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setHasCamera(true);
          initScanner();
        } else {
          setHasCamera(false);
          setScannerError("No camera found on this device");
          setIsScanning(false);
        }
      })
      .catch((err) => {
        console.error("Error getting cameras", err);
        // On mobile, camera detection might fail but camera might still be available
        if (isMobile) {
          console.log(
            "Attempting mobile scanner despite camera detection failure"
          );
          initMobileScanner();
        } else {
          setHasCamera(false);
          setScannerError("Could not access camera: " + err.message);
          setIsScanning(false);
        }
      });
  };

  // Initialize scanner for desktop browsers
  const initScanner = () => {
    try {
      const scanner = new Html5QrcodeScanner("reader", {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 10,
        rememberLastUsedCamera: true,
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        formatsToSupport: [Html5Qrcode.FORMATS.QR_CODE],
      });

      scannerRef.current = scanner;

      const success = (decodedText) => {
        try {
          scanner.clear();
          setScanResult(decodedText);
          setIsScanning(false);
          console.log("QR Code scanned successfully:", decodedText);
        } catch (err) {
          console.error("Error in success callback:", err);
        }
      };

      const error = (err) => {
        // Only log actual errors, not permission issues
        if (err.name === "NotAllowedError") {
          setPermissionDenied(true);
          setIsScanning(false);
        } else {
          console.warn("QR Scanner error:", err);
        }
      };

      scanner.render(success, error);
    } catch (err) {
      console.error("Error initializing scanner:", err);
      setScannerError("Error initializing scanner: " + err.message);
      setIsScanning(false);
    }
  };

  // Initialize scanner specifically for mobile devices
  const initMobileScanner = async () => {
    try {
      // Create a div for the scanner if it doesn't exist
      let readerElement = document.getElementById("reader");
      if (!readerElement) {
        console.error("Reader element not found");
        return;
      }

      // Clear any existing content
      readerElement.innerHTML = '<div id="qr-reader-camera"></div>';

      // Create HTML5Qrcode instance directly instead of scanner
      const html5QrCode = new Html5Qrcode("qr-reader-camera");
      scannerRef.current = html5QrCode;

      // Try to start scanning with the back camera first
      try {
        const qrCodeSuccessCallback = (decodedText) => {
          html5QrCode.stop();
          setScanResult(decodedText);
          setIsScanning(false);
          console.log("Mobile QR Code scanned successfully:", decodedText);
        };

        const config = { fps: 10, qrbox: 250 };

        // First try to get all cameras
        const devices = await Html5Qrcode.getCameras();
        console.log("Available cameras:", devices);

        if (devices && devices.length > 0) {
          // Try to find back camera
          const backCamera = devices.find((device) =>
            /(back|rear)/i.test(device.label || "")
          );

          // Use back camera if found, otherwise use the first camera
          const cameraId = backCamera ? backCamera.id : devices[0].id;

          await html5QrCode.start(
            { deviceId: { exact: cameraId } },
            config,
            qrCodeSuccessCallback,
            (errorMessage) => {
              // Just log errors, don't stop scanning
              console.log("QR Code scanning error:", errorMessage);
            }
          );

          setHasCamera(true);
        } else {
          // If no cameras found through getCameras, try with default camera
          await html5QrCode.start(
            { facingMode: "environment" },
            config,
            qrCodeSuccessCallback,
            (errorMessage) => {
              console.log("QR Code scanning error:", errorMessage);
            }
          );

          setHasCamera(true);
        }
      } catch (err) {
        console.error("Error starting camera:", err);

        // If environment camera fails, try with user camera
        try {
          const qrCodeSuccessCallback = (decodedText) => {
            html5QrCode.stop();
            setScanResult(decodedText);
            setIsScanning(false);
          };

          await html5QrCode.start(
            { facingMode: "user" },
            { fps: 10, qrbox: 250 },
            qrCodeSuccessCallback,
            (errorMessage) => {
              console.log("QR Code scanning error:", errorMessage);
            }
          );

          setHasCamera(true);
        } catch (frontErr) {
          console.error("Error with front camera too:", frontErr);
          setHasCamera(false);
          setScannerError("Could not access any camera");
          setIsScanning(false);
        }
      }
    } catch (err) {
      console.error("Mobile scanner initialization error:", err);
      setScannerError("Error initializing mobile scanner: " + err.message);
      setIsScanning(false);
    }
  };

  const startScanning = () => {
    setScanResult(null);
    setMessage("");
    setPermissionDenied(false);
    setScannerError(null);
    setIsScanning(true);
  };

  const markAttendance = async () => {
    if (!scanResult) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qrCodeData: scanResult,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message || "Attendance marked successfully!");
        toast({
          title: "Success",
          description: "Attendance marked successfully!",
        });
      } else {
        setMessage(data.message || "Failed to mark attendance");
        toast({
          title: "Error",
          description: data.message || "Failed to mark attendance",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      setMessage("An error occurred while marking attendance");
      toast({
        title: "Error",
        description: "An error occurred while marking attendance",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-0 shadow-none">
      <CardHeader className="px-0 pt-0 pb-4">
        <CardTitle className="text-base sm:text-lg">Scan QR Code</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Scan the QR code to mark your attendance
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 space-y-4">
        {useManualInput ? (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <p className="text-sm">Enter the QR code value manually:</p>
            </div>
            <Input
              type="text"
              placeholder="Enter QR code value"
              value={manualQrValue}
              onChange={(e) => setManualQrValue(e.target.value)}
              className="text-center font-mono text-sm"
            />
            <div className="flex justify-center gap-2 mt-4 flex-wrap">
              <Button
                onClick={() => {
                  if (manualQrValue.trim()) {
                    setScanResult(manualQrValue.trim());
                    setUseManualInput(false); // Hide the manual input form
                    toast({
                      title: "Success",
                      description: "QR code value accepted",
                    });
                  } else {
                    toast({
                      title: "Error",
                      description: "Please enter a valid QR code value",
                      variant: "destructive",
                    });
                  }
                }}
                disabled={!manualQrValue.trim()}
              >
                Submit
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setUseManualInput(false);
                  setManualQrValue("");
                }}
              >
                <Camera className="mr-2 h-4 w-4" />
                Use Camera
              </Button>
            </div>
          </div>
        ) : isScanning ? (
          <div
            id="reader"
            className="w-full max-h-[350px] overflow-hidden rounded-lg"
          ></div>
        ) : scanResult ? (
          <div className="text-center p-4">
            <p className="mb-4">QR Code scanned successfully!</p>
            {message && (
              <p
                className={`text-sm ${
                  message.includes("successfully")
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {message}
              </p>
            )}
          </div>
        ) : permissionDenied ? (
          <div className="text-center p-4 text-red-500">
            <p className="mb-2">Camera permission denied</p>
            <p className="text-sm">
              Please allow camera access or use manual input
            </p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => setUseManualInput(true)}
            >
              <KeyRound className="mr-2 h-4 w-4" />
              Enter QR Code Manually
            </Button>
          </div>
        ) : !hasCamera ? (
          <div className="text-center p-4 text-red-500">
            <p className="mb-2">No camera detected</p>
            <p className="text-sm">Please use manual input instead</p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => setUseManualInput(true)}
            >
              <KeyRound className="mr-2 h-4 w-4" />
              Enter QR Code Manually
            </Button>
          </div>
        ) : scannerError ? (
          <div className="text-center p-4 text-red-500">
            <p className="mb-2">Scanner Error</p>
            <p className="text-sm">{scannerError}</p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => setUseManualInput(true)}
            >
              <KeyRound className="mr-2 h-4 w-4" />
              Enter QR Code Manually
            </Button>
          </div>
        ) : (
          <div className="text-center p-4">
            <p>Click the button below to start scanning</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4 px-0 pt-4 pb-0">
        <div className="flex justify-center gap-2 flex-wrap">
          {useManualInput ? (
            <Button variant="outline" onClick={() => setUseManualInput(false)}>
              Cancel Manual Input
            </Button>
          ) : isScanning ? (
            <Button variant="outline" onClick={() => setIsScanning(false)}>
              Cancel Scanning
            </Button>
          ) : scanResult ? (
            <Button onClick={markAttendance} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Marking Attendance...
                </>
              ) : (
                "Mark Attendance"
              )}
            </Button>
          ) : permissionDenied ? (
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setPermissionDenied(false);
                  startScanning();
                }}
              >
                Try Again
              </Button>
              <Button variant="outline" onClick={() => setUseManualInput(true)}>
                <KeyRound className="mr-2 h-4 w-4" />
                Manual Input
              </Button>
            </div>
          ) : scannerError ? (
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setScannerError(null);
                  startScanning();
                }}
              >
                Try Again
              </Button>
              <Button variant="outline" onClick={() => setUseManualInput(true)}>
                <KeyRound className="mr-2 h-4 w-4" />
                Manual Input
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button onClick={startScanning}>
                <Camera className="mr-2 h-4 w-4" />
                Start Scanning
              </Button>
              <Button variant="outline" onClick={() => setUseManualInput(true)}>
                <KeyRound className="mr-2 h-4 w-4" />
                Manual Input
              </Button>
            </div>
          )}
        </div>

        {/* Help text for mobile users */}
        {isScanning && (
          <div className="text-xs text-center text-muted-foreground space-y-1 mt-2">
            <p>Make sure your camera is enabled and point it at the QR code.</p>
            <p>
              If you're having trouble, try in a well-lit area and hold your
              device steady.
            </p>
            <p>
              Or use the{" "}
              <button
                onClick={() => {
                  setIsScanning(false);
                  setUseManualInput(true);
                }}
                className="underline text-primary font-medium"
              >
                manual input option
              </button>{" "}
              instead.
            </p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
