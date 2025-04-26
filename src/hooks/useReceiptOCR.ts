import { useState } from 'react';
import * as Tesseract from 'tesseract.js';

interface OCRResult {
  text: string;
  store?: string;
  date?: string;
  items?: { name: string; price: string; quantity: string }[];
}

export const useReceiptOCR = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OCRResult | null>(null);

  const scanReceiptImage = async (file: File) => {
    try {
      setIsScanning(true);
      setProgress(0);
      setError(null);
      setResult(null);

      console.log("Starting OCR scan on image:", file.name);

      const scanResult = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(m.progress * 100);
          }
        },
      });

      const text = scanResult?.data.text;
      const lines = text.split('\n');

      // log text for debugging purposes
      console.log("Extracted text:", text);

      // Extract store name (first non-empty line)
      const storeName = lines.find((line) => line.trim().length > 0);

      // Extract date (matches MM/DD/YYYY or similar formats)
      const dateMatch = text.match(/\d{2}[/-]\d{2}[/-]\d{4}/);
      const date = dateMatch ? new Date(dateMatch[0]) : null;

      // Extract items
      const items: { name: string; price: string; quantity: string }[] = [];
      const ignoredKeywords = [
        'subtotal',
        'total',
        'tax',
        'tip',
        '%',
        'gratuity',
        'cash',
        'change',
        'balance',
        'card',
        'credit',
        'debit',
        'grand tota]'
      ];

      lines.forEach((line) => {
        const lowerLine = line.toLowerCase().trim();
        if (!lowerLine || ignoredKeywords.some((kw) => lowerLine.includes(kw))) return;

        const priceMatch = line.match(/\$?\s*(\d+\.\d{2})/);
        if (priceMatch) {
          const price = parseFloat(priceMatch[1]);
          let name = line.substring(0, priceMatch.index).trim().replace(/^\d+\s*/, '');
          const qtyMatch = line.match(/^\d+/);
          const quantity = qtyMatch ? qtyMatch[0] : '1';

          if (name && !isNaN(price)) {
            items.push({ name, price: price.toString(), quantity });
          }
        }
      });
      console.log("Extracted items:", items);

      return {
        text,
        store: storeName?.trim() || null,
        date: date && !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : null,
        items: items.length > 0 ? items : undefined,
      };

    } catch (err) {
      console.error('OCR Error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
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
