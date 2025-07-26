package com.rabinnyaundi.posprintdemo

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.zcs.sdk.DriverManager
import com.zcs.sdk.Printer
import com.zcs.sdk.SdkResult
import com.zcs.sdk.print.PrnStrFormat
import com.zcs.sdk.print.PrnTextFont
import com.zcs.sdk.print.PrnTextStyle
import android.text.Layout
import android.util.Log

class CS30PrinterModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    override fun getName() = "CS30Printer"

    @ReactMethod
    fun printText(text: String, promise: Promise) {
        try {
            val driverManager = DriverManager.getInstance()
            val printer = driverManager.printer
            
            if (printer == null) {
                promise.reject("PRINTER_ERROR", "Printer not available")
                return
            }

            // Check printer status
            val printStatus = printer.printerStatus
            Log.d("CS30PrinterModule", "Printer status: $printStatus")
            
            if (printStatus == SdkResult.SDK_PRN_STATUS_PAPEROUT) {
                promise.reject("PRINTER_ERROR", "Out of paper")
                return
            }

            // Configure print format
            val format = PrnStrFormat().apply {
                textSize = 25
                ali = Layout.Alignment.ALIGN_NORMAL
                style = PrnTextStyle.NORMAL
                font = PrnTextFont.SANS_SERIF
            }

            // Add text to print buffer
            printer.setPrintAppendString(text, format)
            
            // Add some spacing at the end
            printer.setPrintAppendString("\n\n\n", format)
            printer.setPrintAppendString("-----------------------------", format)
            printer.setPrintAppendString("\n\n\n\n", format)

            // Start printing
            val startStatus = printer.setPrintStart()
            Log.d("CS30PrinterModule", "Print start status: $startStatus")
            
            if (startStatus == SdkResult.SDK_OK) {
                promise.resolve(true)
            } else {
                promise.reject("PRINT_ERROR", "Failed to start print job, status: $startStatus")
            }
            
        } catch (e: Exception) {
            Log.e("CS30PrinterModule", "Print error", e)
            promise.reject("PRINT_ERROR", e.message ?: "Unknown error")
        }
    }

    @ReactMethod
    fun getPrinterStatus(promise: Promise) {
        try {
            val driverManager = DriverManager.getInstance()
            val printer = driverManager.printer
            
            if (printer == null) {
                promise.reject("PRINTER_ERROR", "Printer not available")
                return
            }

            val status = printer.printerStatus
            promise.resolve(status)
            
        } catch (e: Exception) {
            Log.e("CS30PrinterModule", "Get status error", e)
            promise.reject("STATUS_ERROR", e.message ?: "Unknown error")
        }
    }

    @ReactMethod
    fun initializePrinter(promise: Promise) {
        try {
            val driverManager = DriverManager.getInstance()
            val sys = driverManager.baseSysDevice
            
            var status = sys.sdkInit()
            Log.d("CS30PrinterModule", "SDK init status: $status")
            
            if (status != SdkResult.SDK_OK) {
                sys.sysPowerOn()
                Thread.sleep(2000)
                status = sys.sdkInit()
            }
            
            if (status == SdkResult.SDK_OK) {
                promise.resolve(true)
            } else {
                promise.reject("INIT_ERROR", "Failed to initialize SDK, status: $status")
            }
            
        } catch (e: Exception) {
            Log.e("CS30PrinterModule", "Init error", e)
            promise.reject("INIT_ERROR", e.message ?: "Unknown error")
        }
    }
}
