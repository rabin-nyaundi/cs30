export interface PrinterStatus {
    statusCode: number;
    statusText: string;
    isReady: boolean;
    isPaperOut: boolean;
  }
  
  export interface CS30PrinterConstants {
    STATUS_OK: number;
    STATUS_PAPER_OUT: number;
    STATUS_BUSY: number;
    STATUS_OVERHEAT: number;
  }
  
  export interface CS30PrinterModule extends CS30PrinterConstants {
    /**
     * Initialize the printer SDK
     * @returns Promise<boolean> - true if initialization successful
     */
    initializePrinter(): Promise<boolean>;
  
    /**
     * Get current printer status
     * @returns Promise<PrinterStatus> - detailed printer status
     */
    getPrinterStatus(): Promise<PrinterStatus>;
  
    /**
     * Print plain text
     * @param text - text to print
     * @returns Promise<boolean> - true if print successful
     */
    printText(text: string): Promise<boolean>;
  
    /**
     * Print formatted receipt
     * @param receiptData - formatted receipt string
     * @returns Promise<boolean> - true if print successful
     */
    printReceipt(receiptData: string): Promise<boolean>;
  }
  
  export interface ReceiptData {
    receiptNumber: string;
    date: string;
    time: string;
    officer: string;
    badgeNumber: string;
  }
  
  export interface OffenderDetails {
    name: string;
    idNumber?: string;
    licenseNumber: string;
    phoneNumber?: string;
    vehicleRegistration?: string;
    location?: string;
  }
  
  export interface SelectedOffense {
    name: string;
    code: string;
    fine: number;
  }
  
  export interface PaymentDetails {
    transactionId: string;
    method: string;
  }
  
  export interface PrintData {
    receiptData: ReceiptData;
    selectedOffense: SelectedOffense;
    paymentMethod: string;
    paymentDetails: PaymentDetails;
    offenderDetails: OffenderDetails;
  }