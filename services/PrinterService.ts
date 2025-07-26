import { NativeModules, Platform } from 'react-native';
import type { 
  CS30PrinterModule, 
  PrinterStatus, 
  PrintData 
} from '../types/CS30Printer';

// Get the native module
const CS30Printer = NativeModules.CS30Printer as CS30PrinterModule;

export class PrinterService {
  private static instance: PrinterService;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): PrinterService {
    if (!PrinterService.instance) {
      PrinterService.instance = new PrinterService();
    }
    return PrinterService.instance;
  }

  /**
   * Check if printer module is available
   */
  public isAvailable(): boolean {
    return Platform.OS === 'android' && !!CS30Printer;
  }

  /**
   * Initialize the printer
   */
  public async initialize(): Promise<boolean> {
    try {
      if (!this.isAvailable()) {
        console.warn('Printer module not available on this platform');
        return false;
      }

      console.log('Initializing printer...');
      const result = await CS30Printer.initializePrinter();
      this.isInitialized = result;
      
      if (result) {
        console.log('Printer initialized successfully');
      } else {
        console.error('Failed to initialize printer');
      }
      
      return result;
    } catch (error) {
      console.error('Printer initialization error:', error);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Get printer status
   */
  public async getStatus(): Promise<PrinterStatus | null> {
    try {
      if (!this.isAvailable()) {
        return null;
      }

      const status = await CS30Printer.getPrinterStatus();
      console.log('Printer status:', status);
      return status;
    } catch (error) {
      console.error('Failed to get printer status:', error);
      return null;
    }
  }

  /**
   * Check if printer is ready to print
   */
  public async isReady(): Promise<boolean> {
    const status = await this.getStatus();
    return status?.isReady ?? false;
  }

  /**
   * Print plain text
   */
  public async printText(text: string): Promise<boolean> {
    try {
      if (!this.isAvailable()) {
        console.warn('Printer not available');
        return false;
      }

      if (!this.isInitialized) {
        console.log('Printer not initialized, initializing...');
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Failed to initialize printer');
        }
      }

      console.log('Printing text...');
      const result = await CS30Printer.printText(text);
      
      if (result) {
        console.log('Text printed successfully');
      } else {
        console.error('Failed to print text');
      }
      
      return result;
    } catch (error) {
      console.error('Print text error:', error);
      throw error;
    }
  }

  /**
   * Print formatted receipt
   */
  public async printReceipt(data: PrintData): Promise<boolean> {
    try {
      const receiptContent = this.formatReceiptContent(data);
      return await this.printText(receiptContent);
    } catch (error) {
      console.error('Print receipt error:', error);
      throw error;
    }
  }

  /**
   * Format receipt content for thermal printing
   */
  private formatReceiptContent(data: PrintData): string {
    const { receiptData, selectedOffense, paymentMethod, paymentDetails, offenderDetails } = data;
    
    let content = '';
    const lineWidth = 32;
    const separator = '='.repeat(lineWidth);
    const dash = '-'.repeat(lineWidth);

    // Header
    content += this.centerText('TRAFFIC OFFENSE RECEIPT', lineWidth) + '\n';
    content += this.centerText(separator, lineWidth) + '\n\n';

    // Receipt details
    content += 'RECEIPT DETAILS\n';
    content += dash + '\n';
    content += `Receipt No: ${receiptData.receiptNumber}\n`;
    content += `Date: ${receiptData.date}\n`;
    content += `Time: ${receiptData.time}\n\n`;

    // Offender details
    content += 'OFFENDER INFORMATION\n';
    content += dash + '\n';
    content += `Name: ${offenderDetails.name}\n`;
    if (offenderDetails.licenseNumber && offenderDetails.licenseNumber !== 'N/A') {
      content += `License: ${offenderDetails.licenseNumber}\n`;
    }
    if (offenderDetails.vehicleRegistration) {
      content += `Vehicle: ${offenderDetails.vehicleRegistration}\n`;
    }
    content += '\n';

    // Offense details
    content += 'OFFENSE DETAILS\n';
    content += dash + '\n';
    
    // Handle multiple offenses
    const offenses = selectedOffense.name.split(', ');
    const codes = selectedOffense.code.split(', ');

    if (offenses.length > 1) {
      offenses.forEach((offense, index) => {
        content += `${offense}\n`;
        if (codes[index]) {
          content += `  Code: ${codes[index]}\n`;
        }
      });
    } else {
      content += `${selectedOffense.name}\n`;
      content += `Code: ${selectedOffense.code}\n`;
    }
    
    content += dash + '\n';
    content += `TOTAL FINE: KES ${selectedOffense.fine.toLocaleString()}\n\n`;

    // Payment details
    content += 'PAYMENT INFORMATION\n';
    content += dash + '\n';
    content += `Method: ${paymentMethod}\n`;
    if (paymentDetails.transactionId) {
      content += `Transaction: ${paymentDetails.transactionId}\n`;
    }
    content += 'Status: PAID\n\n';

    // Officer details
    content += 'OFFICER DETAILS\n';
    content += dash + '\n';
    content += `Officer: ${receiptData.officer}\n`;
    content += `Badge: ${receiptData.badgeNumber}\n\n`;

    // Footer
    content += this.centerText(separator, lineWidth) + '\n';
    content += this.centerText('OFFICIAL RECEIPT', lineWidth) + '\n';
    content += this.centerText('Keep as proof of payment', lineWidth) + '\n';
    content += this.centerText(separator, lineWidth) + '\n';

    return content;
  }

  /**
   * Center text within specified width
   */
  private centerText(text: string, width: number): string {
    const padding = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(padding) + text;
  }

  /**
   * Get printer constants
   */
  public getConstants() {
    if (!this.isAvailable()) {
      return null;
    }
    
    return {
      STATUS_OK: CS30Printer.STATUS_OK,
      STATUS_PAPER_OUT: CS30Printer.STATUS_PAPER_OUT,
      STATUS_BUSY: CS30Printer.STATUS_BUSY,
      STATUS_OVERHEAT: CS30Printer.STATUS_OVERHEAT,
    };
  }
}