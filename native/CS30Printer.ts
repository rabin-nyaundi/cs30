import { NativeModulesProxy } from 'expo-modules-core';

// Import the native module
const CS30PrinterModule = NativeModulesProxy.CS30Printer;

export interface CS30PrinterInterface {
  printText(text: string): Promise<boolean>;
  getPrinterStatus(): Promise<number>;
  initializePrinter(): Promise<boolean>;
}

export default CS30PrinterModule as CS30PrinterInterface;