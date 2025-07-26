import CS30Printer from "../native/CS30Printer";

interface PrintData {
  receiptData: {
    receiptNumber: string
    date: string
    time: string
    officer: string
    badgeNumber: string
  }
  selectedOffense: {
    name: string
    code: string
    fine: number
  }
  paymentMethod: string
  paymentDetails: any
  offenderDetails: {
    name: string
    idNumber: string
    licenseNumber: string
    phoneNumber: string
    vehicleRegistration: string
    location: string
  }
}

export class SmartPOSPrinter {
  /**
   * Initialize the SmartPOS SDK
   */
  static async initializeSDK(): Promise<boolean> {
    try {
      if (!CS30Printer) {
        console.error("CS30Printer module not found");
        return false;
      }
      console.log("Initializing CS30Printer SDK...");
      const result = await CS30Printer.initializePrinter();
      console.log("SDK initialization result:", result);
      return result;
    } catch (error) {
      console.error("Failed to initialize SmartPOS SDK:", error);
      return false;
    }
  }

  /**
   * Check printer status
   */
  static async getPrinterStatus(): Promise<number> {
    try {
      if (!CS30Printer) {
        console.error("CS30Printer module not found");
        return -1;
      }
      console.log("Getting printer status...");
      const status = await CS30Printer.getPrinterStatus();
      console.log("Printer status:", status);
      return status;
    } catch (error) {
      console.error("Failed to get printer status:", error);
      return -1;
    }
  }

  /**
   * Print receipt using SmartPOS thermal printer
   */
  static async printReceipt(data: PrintData): Promise<boolean> {
    try {
      if (!CS30Printer) {
        console.error("CS30Printer module not found");
        return false;
      }

      console.log("Starting receipt print...");
      const receiptContent = this.formatReceiptContent(data);
      console.log("Printing receipt content:", receiptContent);

      const result = await CS30Printer.printText(receiptContent);
      console.log("Print result:", result);
      return result;
    } catch (error) {
      console.error("Print error:", error);
      throw error;
    }
  }

  /**
   * Print plain text
   */
  static async printText(text: string): Promise<boolean> {
    try {
      if (!CS30Printer) {
        console.error("CS30Printer module not found");
        return false;
      }
      console.log("Printing text:", text);
      const result = await CS30Printer.printText(text);
      console.log("Print text result:", result);
      return result;
    } catch (error) {
      console.error("Print text error:", error);
      throw error;
    }
  }

  /**
   * Format receipt content for thermal printing (32 characters wide)
   */
  private static formatReceiptContent(data: PrintData): string {
    const { receiptData, selectedOffense, paymentMethod, paymentDetails, offenderDetails } = data

    let content = ""

    // Header - centered
    content += this.centerText("TRAFFIC OFFENSE RECEIPT")
    content += this.centerText("================================")
    content += "\n"

    // Receipt details
    content += `Receipt No: ${receiptData.receiptNumber}\n`
    content += `Date: ${receiptData.date}\n`
    content += `Time: ${receiptData.time}\n`
    content += "\n"

    // Offender details
    content += "OFFENDER DETAILS\n"
    content += "--------------------------------\n"
    content += `Name: ${offenderDetails.name}\n`
    if (offenderDetails.licenseNumber && offenderDetails.licenseNumber !== "N/A") {
      content += `License: ${offenderDetails.licenseNumber}\n`
    }
    content += "\n"

    // Payment details
    content += "PAYMENT DETAILS\n"
    content += "--------------------------------\n"
    content += `Method: ${paymentMethod}\n`
    if (paymentDetails?.transactionId) {
      content += `Transaction: ${paymentDetails.transactionId}\n`
    }
    content += "Status: PAID\n"
    content += "\n"

    // Offense details
    content += "SELECTED OFFENSES\n"
    content += "--------------------------------\n"

    // Handle multiple offenses
    const offenses = selectedOffense.name.split(", ")
    const codes = selectedOffense.code.split(", ")

    if (offenses.length > 1) {
      offenses.forEach((offense, index) => {
        content += `${offense}\n`
        if (codes[index]) {
          content += `  Code: ${codes[index]}\n`
        }
      })
    } else {
      content += `${selectedOffense.name}\n`
      content += `Code: ${selectedOffense.code}\n`
    }

    content += "--------------------------------\n"
    content += `TOTAL PAID: KES ${selectedOffense.fine.toLocaleString()}\n`
    content += "\n"

    // Officer details
    content += "OFFICER DETAILS\n"
    content += "--------------------------------\n"
    content += `Officer: ${receiptData.officer}\n`
    content += `Badge: ${receiptData.badgeNumber}\n`
    content += "\n"

    // Footer
    content += this.centerText("--------------------------------")
    content += this.centerText("Official Traffic Offense Receipt")
    content += this.centerText("Keep as proof of payment")
    content += this.centerText("--------------------------------")
    content += "\n\n\n"

    return content
  }

  /**
   * Center text for 32-character thermal printer
   */
  private static centerText(text: string): string {
    const maxWidth = 32
    const padding = Math.max(0, Math.floor((maxWidth - text.length) / 2))
    return " ".repeat(padding) + text + "\n"
  }

  /**
   * Format text to fit printer width
   */
  private static formatLine(label: string, value: string): string {
    const maxWidth = 32
    const totalLength = label.length + value.length

    if (totalLength <= maxWidth) {
      const spaces = maxWidth - totalLength
      return label + " ".repeat(spaces) + value + "\n"
    } else {
      return label + "\n" + value + "\n"
    }
  }
}