
import { useState } from 'react';
import * as Tesseract from 'tesseract.js';

interface OCRResult {
  text: string;
  confidence: number;
}

export const useReceiptOCR = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OCRResult | null>(null);

  const scanReceiptImage = async (imageUrl: string) => {
    try {
      setIsScanning(true);
      setProgress(0);
      setError(null);
      setResult(null);

      console.log("Starting OCR scan on image:", imageUrl);

      // Configure and create the worker
      const worker = await Tesseract.createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(m.progress * 100);
          }
          console.log(m);
        },
      });

      console.log("Worker created successfully");

      // Perform the OCR recognition
      const { data } = await worker.recognize(imageUrl);
      
      console.log("OCR complete, result:", data);

      // Process the result
      if (data) {
        setResult({
          text: data.text,
          confidence: data.confidence,
        });
      } else {
        throw new Error("No OCR result data returned");
      }

      // Terminate the worker
      await worker.terminate();
      console.log("Worker terminated");

    } catch (err) {
      console.error("OCR Error:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsScanning(false);
    }
  };

  return {
    scanReceiptImage,
    isScanning,
    progress,
    error,
    result,
  };
};
