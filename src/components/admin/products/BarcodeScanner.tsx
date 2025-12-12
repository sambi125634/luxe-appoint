import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface BarcodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (code: string, format: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  open,
  onOpenChange,
  onScan,
}) => {
  const { t } = useTranslation();
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startScanner = async () => {
    if (!containerRef.current) return;

    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText, decodedResult) => {
          // Play sound on successful scan
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQAZAH3m5spZAABD3d/YfQAAQdrb2IgAADbR0c6aBAA6z9HQmgIALMTGyaQJACW5vb+wHAAeo7G0ty8AFZymqb1AAAqMmpq0VAAAeIqIn3cAAGNzX4CYAABhWEpqiwAAa2dXZHsAAHRvYGpuAAB6dnJwZgAAdHFxdXAAAGlobHd/AABMUVhrhwAAOj5CS3YAAC4wMT9nAAApKCctVQAAKykkJ0kAACwnHyNBAAA=');
          audio.volume = 0.3;
          audio.play().catch(() => {});

          const format = decodedResult.result.format?.formatName || 'QR_CODE';
          onScan(decodedText, format);
          stopScanner();
          onOpenChange(false);
        },
        () => {} // Ignore errors during scanning
      );

      setIsScanning(true);
      setHasCamera(true);
    } catch (err) {
      console.error('Failed to start scanner:', err);
      setHasCamera(false);
      toast.error(t('products.cameraError', 'Nie można uruchomić kamery. Sprawdź uprawnienia.'));
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error('Failed to stop scanner:', err);
      }
    }
  };

  useEffect(() => {
    if (open) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        startScanner();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      stopScanner();
    }
  }, [open]);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        stopScanner();
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            {t('products.scannerTitle', 'Skaner produktów')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          {hasCamera ? (
            <>
              <div 
                id="qr-reader" 
                ref={containerRef}
                className="w-full max-w-sm rounded-lg overflow-hidden bg-muted"
                style={{ minHeight: '300px' }}
              />
              <p className="text-sm text-muted-foreground text-center">
                {t('products.pointCamera', 'Skieruj kamerę na kod QR lub kreskowy produktu')}
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 py-8">
              <CameraOff className="h-16 w-16 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center">
                {t('products.noCameraAccess', 'Brak dostępu do kamery. Sprawdź uprawnienia przeglądarki.')}
              </p>
              <Button variant="outline" onClick={startScanner}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('products.tryAgain', 'Spróbuj ponownie')}
              </Button>
            </div>
          )}

          <div className="text-xs text-muted-foreground text-center">
            {t('products.supportedFormats', 'Obsługiwane formaty: QR Code, EAN-13, EAN-8, Code128, UPC-A')}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BarcodeScanner;
