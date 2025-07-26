package com.rabinnyaundi.posprintdemo

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments
import com.zcs.sdk.DriverManager
import com.zcs.sdk.Printer
import com.zcs.sdk.SdkResult
import com.zcs.sdk.print.PrnStrFormat
import com.zcs.sdk.print.PrnTextFont
import com.zcs.sdk.print.PrnTextStyle
import android.text.Layout
import android.util.Log

class CS30PrinterModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    companion object {
        private const val TAG = "CS30PrinterModule"
        private const val MODULE_NAME = "CS30Printer"
        
        // Error codes
        private const val E_PRINTER_NOT_AVAILABLE = "E_PRINTER_NOT_AVAILABLE"
        private const val E_PAPER_OUT = "E_PAPER_OUT"
        private const val E_PRINT_FAILED = "E_PRINT_FAILED"
        private const val E_INIT_FAILED = "E_INIT_FAILED"
        private const val E_STATUS_FAILED = "E_STATUS_FAILED"
        private const val E_UNKNOWN_ERROR = "E_UNKNOWN_ERROR"
    }
    
    override fun getName(): String = MODULE_NAME

    @ReactMethod
    fun initializePrinter(promise: Promise) {
        try {
            Log.d(TAG, "Initializing printer...")
            
            val driverManager = DriverManager.getInstance()
            val sys = driverManager.baseSysDevice
            
            var status = sys.sdkInit()
            Log.d(TAG, "Initial SDK init status: $status")
            
            if (status != SdkResult.SDK_OK) {
                Log.d(TAG, "First init failed, powering on and retrying...")
                sys.sysPowerOn()
                Thread.sleep(2000)
                status = sys.sdkInit()
                Log.d(TAG, "Second SDK init status: $status")
            }
            
            if (status == SdkResult.SDK_OK) {
                Log.d(TAG, "SDK initialized successfully")
                promise.resolve(true)
            } else {
                val errorMsg = "Failed to initialize SDK, status: $status"
                Log.e(TAG, errorMsg)
                promise.reject(E_INIT_FAILED, errorMsg)
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "Exception during initialization", e)
            promise.reject(E_UNKNOWN_ERROR, "Initialization failed: ${e.message}", e)
        }
    }

    @ReactMethod
    fun getPrinterStatus(promise: Promise) {
        try {
            Log.d(TAG, "Getting printer status...")
            
            val driverManager = DriverManager.getInstance()
            val printer = driverManager.printer
            
            if (printer == null) {
                Log.e(TAG, "Printer instance is null")
                promise.reject(E_PRINTER_NOT_AVAILABLE, "Printer not available")
                return
            }

            val status = printer.printerStatus
            Log.d(TAG, "Printer status: $status")
            
            val result: WritableMap = Arguments.createMap().apply {
                putInt("statusCode", status)
                putString("statusText", getStatusText(status))
                putBoolean("isReady", status == SdkResult.SDK_OK)
                putBoolean("isPaperOut", status == SdkResult.SDK_PRN_STATUS_PAPEROUT)
            }
            
            promise.resolve(result)
            
        } catch (e: Exception) {
            Log.e(TAG, "Exception getting printer status", e)
            promise.reject(E_STATUS_FAILED, "Failed to get printer status: ${e.message}", e)
        }
    }

    @ReactMethod
    fun printText(text: String, promise: Promise) {
        try {
            Log.d(TAG, "Starting print job with text length: ${text.length}")
            
            val driverManager = DriverManager.getInstance()
            val printer = driverManager.printer
            
            if (printer == null) {
                Log.e(TAG, "Printer instance is null")
                promise.reject(E_PRINTER_NOT_AVAILABLE, "Printer not available")
                return
            }

            // Check printer status first
            val printStatus = printer.printerStatus
            Log.d(TAG, "Printer status before printing: $printStatus")
            
            if (printStatus == SdkResult.SDK_PRN_STATUS_PAPEROUT) {
                Log.e(TAG, "Printer is out of paper")
                promise.reject(E_PAPER_OUT, "Printer is out of paper")
                return
            }

            // Configure print format
            val format = PrnStrFormat().apply {
                textSize = 25
                ali = Layout.Alignment.ALIGN_NORMAL
                style = PrnTextStyle.NORMAL
                font = PrnTextFont.SANS_SERIF
            }

            // Clear any previous print buffer
            // printer.setPrintInit()

            // Add text to print buffer
            printer.setPrintAppendString(text, format)
            
            // Add footer spacing
            printer.setPrintAppendString("\n\n", format)
            printer.setPrintAppendString("${"-".repeat(32)}", format)
            printer.setPrintAppendString("\n\n\n", format)

            // Start printing
            val startStatus = printer.setPrintStart()
            Log.d(TAG, "Print start status: $startStatus")
            
            if (startStatus == SdkResult.SDK_OK) {
                Log.d(TAG, "Print job started successfully")
                promise.resolve(true)
            } else {
                val errorMsg = "Failed to start print job, status: $startStatus"
                Log.e(TAG, errorMsg)
                promise.reject(E_PRINT_FAILED, errorMsg)
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "Exception during printing", e)
            promise.reject(E_UNKNOWN_ERROR, "Print failed: ${e.message}", e)
        }
    }

    @ReactMethod
    fun printReceipt(receiptData: String, promise: Promise) {
        try {
            Log.d(TAG, "Printing receipt...")
            printText(receiptData, promise)
        } catch (e: Exception) {
            Log.e(TAG, "Exception printing receipt", e)
            promise.reject(E_UNKNOWN_ERROR, "Receipt print failed: ${e.message}", e)
        }
    }

    private fun getStatusText(status: Int): String {
        return when (status) {
            SdkResult.SDK_OK -> "Ready"
            // SdkResult.SDK_PRN_STATUS_PAPEROUT -> "Paper Out"
            // SdkResult.SDK_PRN_STATUS_BUSY -> "Busy"
            // SdkResult.SDK_PRN_STATUS_OVERHEAT -> "Overheated"
            else -> "Unknown Status ($status)"
        }
    }

    override fun getConstants(): MutableMap<String, Any> {
        return hashMapOf(
            "STATUS_OK" to SdkResult.SDK_OK,
            "STATUS_PAPER_OUT" to SdkResult.SDK_PRN_STATUS_PAPEROUT,
            // "STATUS_BUSY" to SdkResult.SDK_PRN_STATUS_BUSY,
            // "STATUS_OVERHEAT" to SdkResult.SDK_PRN_STATUS_OVERHEAT
        )
    }
}