import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { Product } from './types';

interface QRCodeDisplayProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  product,
  open,
  onOpenChange,
}) => {
  const { t } = useTranslation();
  const qrRef = useRef<HTMLDivElement>(null);

  if (!product) return null;

  const qrValue = `BC:PRODUCT:${product.id}`;

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const data = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    canvas.width = 300;
    canvas.height = 300;
    
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 300, 300);
      const link = document.createElement('a');
      link.download = `qr-${product.sku || product.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(data)));
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${product.name}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: system-ui, sans-serif;
            }
            .qr-container {
              text-align: center;
              padding: 20px;
            }
            .product-name {
              font-size: 18px;
              font-weight: 600;
              margin-top: 16px;
            }
            .product-sku {
              font-size: 14px;
              color: #666;
              margin-top: 4px;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            ${svgData}
            <div class="product-name">${product.name}</div>
            ${product.sku ? `<div class="product-sku">SKU: ${product.sku}</div>` : ''}
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('products.qrCode', 'Kod QR produktu')}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4 py-4">
          <div ref={qrRef} className="bg-white p-4 rounded-lg">
            <QRCodeSVG
              value={qrValue}
              size={200}
              level="H"
              includeMargin
            />
          </div>
          
          <div className="text-center">
            <p className="font-semibold text-foreground">{product.name}</p>
            {product.sku && (
              <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
            )}
            {product.ean && (
              <p className="text-sm text-muted-foreground">EAN: {product.ean}</p>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              {t('products.downloadQR', 'Pobierz PNG')}
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              {t('products.printQR', 'Drukuj')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeDisplay;
