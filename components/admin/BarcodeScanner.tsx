'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, Type, ScanBarcode } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

// Native BarcodeDetector type isn't shipped in TS lib.dom yet — hand-declare
// the minimal slice we use.
interface DetectedBarcode {
  rawValue: string;
  format: string;
}
interface BarcodeDetectorInstance {
  detect(source: ImageBitmapSource): Promise<DetectedBarcode[]>;
}
interface BarcodeDetectorCtor {
  new (opts?: { formats?: string[] }): BarcodeDetectorInstance;
}
declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorCtor;
  }
}

const isBarcodeDetectorSupported = () =>
  typeof window !== 'undefined' && typeof window.BarcodeDetector === 'function';

const DETECT_FORMATS = [
  'ean_13', 'ean_8',
  'upc_a', 'upc_e',
  'code_128', 'code_39', 'code_93',
  'codabar',
  'itf',
  'qr_code',
] as const;

type Props = {
  open: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
};

export default function BarcodeScanner({ open, onClose, onScan }: Props) {
  const supported = isBarcodeDetectorSupported();
  const [mode, setMode] = useState<'camera' | 'manual'>(supported ? 'camera' : 'manual');
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [manualValue, setManualValue] = useState('');

  const videoRef    = useRef<HTMLVideoElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const rafRef      = useRef<number | null>(null);
  const detectorRef = useRef<BarcodeDetectorInstance | null>(null);
  const stoppedRef  = useRef(false);

  const cleanup = useCallback(() => {
    stoppedRef.current = true;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    detectorRef.current = null;
    setScanning(false);
  }, []);

  // Reset state every time the modal opens.
  // Teardown on close is handled by the camera effect's return-cleanup —
  // no explicit cleanup() call here.
  useEffect(() => {
    if (!open) return;
    const resetOpen = () => {
      setError(null);
      setManualValue('');
      setMode(supported ? 'camera' : 'manual');
      stoppedRef.current = false;
    };
    resetOpen();
  }, [open, supported]);

  // Camera + scan loop.
  useEffect(() => {
    if (!open || mode !== 'camera') return;
    const reportUnsupported = () =>
      setError('Barcode scanning is not available in this browser. Switch to manual entry.');
    if (!supported) {
      reportUnsupported();
      return;
    }

    let cancelled = false;
    stoppedRef.current = false;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (cancelled || stoppedRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play().catch(() => {});
        }
        const Ctor = window.BarcodeDetector!;
        detectorRef.current = new Ctor({ formats: [...DETECT_FORMATS] });
        setScanning(true);
        tick();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Camera unavailable';
        setError(`${msg}. You can type the barcode below instead.`);
        setScanning(false);
      }
    };

    const tick = async () => {
      if (stoppedRef.current) return;
      const video = videoRef.current;
      const det   = detectorRef.current;
      if (!video || !det || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      try {
        const results = await det.detect(video);
        if (results.length > 0 && !stoppedRef.current) {
          onScan(results[0].rawValue);
          cleanup();
          return;
        }
      } catch {
        // Transient detection errors are ignored — keep scanning.
      }
      if (!stoppedRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    start();
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [open, mode, supported, onScan, cleanup]);

  const submitManual = () => {
    const v = manualValue.trim();
    if (!v) return;
    onScan(v);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Scan barcode"
      size="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
          {mode === 'manual' && (
            <Button variant="primary" size="sm" onClick={submitManual} disabled={!manualValue.trim()}>
              <ScanBarcode className="w-3.5 h-3.5" />
              Look up
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex gap-1.5">
          <Button
            variant={mode === 'camera' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setMode('camera')}
            disabled={!supported}
            type="button"
            title={supported ? 'Use the camera' : 'Camera scanner not supported in this browser'}
          >
            <Camera className="w-3.5 h-3.5" />
            Camera
          </Button>
          <Button
            variant={mode === 'manual' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setMode('manual')}
            type="button"
          >
            <Type className="w-3.5 h-3.5" />
            Type it
          </Button>
        </div>

        {mode === 'camera' && (
          <div
            className="relative bg-black rounded-lg overflow-hidden"
            style={{ aspectRatio: '4 / 3' }}
          >
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="w-full h-full object-cover"
            />
            {scanning && !error && (
              <>
                <div className="absolute inset-x-8 inset-y-12 border-2 border-cyber/80 rounded-lg pointer-events-none" />
                <div className="absolute bottom-2 left-2 right-2 text-center text-white/80 text-[10px] tracking-wider">
                  Hold the barcode inside the frame
                </div>
              </>
            )}
            {error && (
              <div className="absolute inset-0 grid place-items-center p-4 text-center">
                <div className="text-white text-[12px] leading-relaxed">{error}</div>
              </div>
            )}
            {!scanning && !error && (
              <div className="absolute inset-0 grid place-items-center text-white/70 text-[11px]">
                Initialising camera…
              </div>
            )}
          </div>
        )}

        {mode === 'manual' && (
          <Input
            label="Barcode"
            value={manualValue}
            onChange={(e) => setManualValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                submitManual();
              }
            }}
            placeholder="CYB-001-2026"
            hint="Type or paste a barcode and press Enter."
            autoFocus
          />
        )}

        <p className="text-[11px] text-gray-500">
          {mode === 'camera' ? (
            <>Point the back camera at a product barcode. Detection happens automatically.</>
          ) : (
            <>No camera permission, unsupported browser, or just faster — type the barcode here.</>
          )}
        </p>
      </div>
    </Modal>
  );
}
