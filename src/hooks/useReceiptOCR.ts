
import { useState } from 'react';
import { createWorker } from 'tesseract.js';

interface ExtractedData {
  store?: string;
  total?: string;
  date?: string;
}

export const useReceiptOCR = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  const scanReceipt = async (imageFile: File): Promise<ExtractedData> => {
    setIsScanning(true);
    setProgress(0);

    try {
      console.log('Creating OCR worker with English language...');
      
      // Correct syntax for Tesseract.js v5+
      // The logger function now needs to be passed as part of the worker options
      const worker = await createWorker({
        logger: m => {
          console.log('OCR progress:', m);
          if (m.status === 'recognizing text') {
            setProgress(m.progress * 100);
          }
        }
      });

      // Load language separately after worker creation
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      
      console.log('OCR worker created, recognizing text...');
      
      // Recognize text from the image
      const { data } = await worker.recognize(imageFile);
      console.log('OCR completed');
      
      await worker.terminate();
      
      const text = data.text;
      console.log('Extracted text:', text);

      // Try to extract data from the OCR result
      const extractedData: ExtractedData = {};
      
      // Try to find total amount (looking for patterns like $123.45 or 123.45)
      const totalMatch = text.match(/\$?\s*(\d+\.\d{2})/);
      if (totalMatch) {
        extractedData.total = totalMatch[1];
      }

      // Try to find date (simple date formats)
      const dateMatch = text.match(/\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/);
      if (dateMatch) {
        extractedData.date = dateMatch[0];
      }

      // Try to find store name (usually at the top of receipt)
      const lines = text.split('\n');
      if (lines.length > 0) {
        extractedData.store = lines[0].trim();
      }

      return extractedData;
    } catch (error) {
      console.error('OCR Error:', error);
      throw error;
    } finally {
      setIsScanning(false);
    }
  };

  return {
    scanReceipt,
    isScanning,
    progress
  };
};
