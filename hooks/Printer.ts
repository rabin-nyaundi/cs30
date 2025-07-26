import { useState, useEffect, useCallback } from 'react';
import { PrinterService } from '../services/PrinterService';
import type { PrinterStatus, PrintData } from '../types/CS30Printer';

export interface UsePrinterReturn {
  // State
  isAvailable: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  status: PrinterStatus | null;
  error: string | null;
  
  // Actions
  initialize: () => Promise<boolean>;
  getStatus: () => Promise<void>;
  printText: (text: string) => Promise<boolean>;
  printReceipt: (data: PrintData) => Promise<boolean>;
  clearError: () => void;
}

export const usePrinter = (): UsePrinterReturn => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<PrinterStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const printerService = PrinterService.getInstance();
  const isAvailable = printerService.isAvailable();

  // Initialize printer
  const initialize = useCallback(async (): Promise<boolean> => {
    if (!isAvailable) {
      setError('Printer not available on this platform');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await printerService.initialize();
      setIsInitialized(result);
      
      if (!result) {
        setError('Failed to initialize printer');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown initialization error';
      setError(errorMessage);
      setIsInitialized(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAvailable, printerService]);

  // Get printer status
  const getStatus = useCallback(async (): Promise<void> => {
    if (!isAvailable) return;

    setIsLoading(true);
    setError(null);

    try {
      const printerStatus = await printerService.getStatus();
      setStatus(printerStatus);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get printer status';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isAvailable, printerService]);

  // Print text
  const printText = useCallback(async (text: string): Promise<boolean> => {
    if (!isAvailable) {
      setError('Printer not available');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await printerService.printText(text);
      
      if (!result) {
        setError('Failed to print text');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Print failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAvailable, printerService]);

  // Print receipt
  const printReceipt = useCallback(async (data: PrintData): Promise<boolean> => {
    if (!isAvailable) {
      setError('Printer not available');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await printerService.printReceipt(data);
      
      if (!result) {
        setError('Failed to print receipt');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Receipt print failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAvailable, printerService]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-initialize on mount if available
  useEffect(() => {
    if (isAvailable && !isInitialized) {
      initialize();
    }
  }, [isAvailable, isInitialized, initialize]);

  return {
    // State
    isAvailable,
    isInitialized,
    isLoading,
    status,
    error,
    
    // Actions
    initialize,
    getStatus,
    printText,
    printReceipt,
    clearError,
  };
};