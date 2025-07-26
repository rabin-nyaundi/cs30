"use client"

import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Alert, StyleSheet, TouchableOpacity, ScrollView, View } from "react-native"
import { useEffect } from "react"
import { usePrinter } from "../../hooks/Printer"
import type { PrintData } from "../../types/CS30Printer"

const OFFENSES = [
  { id: "1", name: "Speeding", fine: 3000 },
  { id: "2", name: "Driving without seatbelt", fine: 1000 },
  { id: "3", name: "Using mobile phone while driving", fine: 2000 },
  { id: "4", name: "Careless driving", fine: 5000 },
  { id: "5", name: "Unroadworthy vehicle", fine: 10000 },
  { id: "6", name: "Expired insurance", fine: 10000 },
]

export default function ReceiptScreen() {
  const { selected, name, license, payment } = useLocalSearchParams<{
    selected: string
    name: string
    license: string
    payment: string
  }>()

  const router = useRouter()
  const printer = usePrinter()

  const selectedIds = selected ? selected.split(",") : []
  const selectedOffenses = OFFENSES.filter((o) => selectedIds.includes(o.id))
  const totalFine = selectedOffenses.reduce((sum, o) => sum + o.fine, 0)

  const receiptData = {
    receiptNumber: `RCP${Date.now()}`,
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    officer: "Officer John Doe",
    badgeNumber: "BD001",
  }

  const offenderDetails = {
    name: name || "N/A",
    idNumber: "N/A",
    licenseNumber: license || "N/A",
    phoneNumber: "N/A",
    vehicleRegistration: "N/A",
    location: "N/A",
  }

  const paymentDetails = {
    transactionId: `TXN${Date.now()}`,
    method: payment === "mpesa" ? "M-Pesa" : "Scan to Pay",
  }

  // Debug printer status
  useEffect(() => {
    console.log("=== Printer Debug Info ===")
    console.log("Printer available:", printer.isAvailable)
    console.log("Printer initialized:", printer.isInitialized)
    console.log("Printer loading:", printer.isLoading)
    console.log("Printer error:", printer.error)
    console.log("Printer status:", printer.status)

    // Get initial status
    if (printer.isAvailable && printer.isInitialized) {
      printer.getStatus()
    }
  }, [printer.isInitialized])

  const handlePrint = async () => {
    try {
      if (!printer.isAvailable) {
        Alert.alert("Printer Error", "Printer is not available on this device")
        return
      }

      if (printer.error) {
        printer.clearError()
      }

      const printData: PrintData = {
        receiptData,
        selectedOffense: {
          name: selectedOffenses.map((o) => o.name).join(", "),
          code: selectedOffenses.map((o) => o.id).join(", "),
          fine: totalFine,
        },
        paymentMethod: paymentDetails.method,
        paymentDetails,
        offenderDetails,
      }

      const success = await printer.printReceipt(printData)

      if (success) {
        Alert.alert("Receipt Printed", "Receipt has been printed successfully", [
          {
            text: "New Transaction",
            onPress: () => router.replace("/"),
          },
        ])
      } else {
        Alert.alert("Print Error", printer.error || "Failed to print receipt")
      }
    } catch (error) {
      console.error("Print error:", error)
      Alert.alert("Print Error", "An error occurred while printing")
    }
  }

  const handleTestPrint = async () => {
    try {
      if (!printer.isAvailable) {
        Alert.alert("Printer Error", "Printer is not available on this device")
        return
      }

      const testText = `
TEST PRINT
${new Date().toLocaleString()}

Printer Status Test
${printer.status?.statusText || 'Unknown'}

This is a test print from the
CS30 Printer Module.

Thank you!
`

      const success = await printer.printText(testText)
      
      if (success) {
        Alert.alert("Test Print", "Test print completed successfully!")
      } else {
        Alert.alert("Test Print Failed", printer.error || "Unknown error occurred")
      }
    } catch (error) {
      console.error("Test print error:", error)
      Alert.alert("Test Print Error", "Failed to execute test print")
    }
  }

  const handleCheckStatus = async () => {
    try {
      await printer.getStatus()
      
      if (printer.status) {
        const { statusText, isReady, isPaperOut } = printer.status
        let message = `Status: ${statusText}\n`
        message += `Ready: ${isReady ? 'Yes' : 'No'}\n`
        message += `Paper: ${isPaperOut ? 'Out' : 'OK'}`
        
        Alert.alert("Printer Status", message)
      } else {
        Alert.alert("Status Error", "Could not get printer status")
      }
    } catch (error) {
      Alert.alert("Status Error", "Failed to check printer status")
    }
  }

  const handleInitialize = async () => {
    try {
      const success = await printer.initialize()
      
      if (success) {
        Alert.alert("Initialization", "Printer initialized successfully!")
      } else {
        Alert.alert("Initialization Failed", printer.error || "Unknown error")
      }
    } catch (error) {
      Alert.alert("Initialization Error", "Failed to initialize printer")
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <ThemedText type="title" style={styles.title}>
            Payment Receipt
          </ThemedText>

          {/* Printer Status Section */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Printer Status
            </ThemedText>
            <ThemedText type="default">
              Available: {printer.isAvailable ? "Yes" : "No"}
            </ThemedText>
            <ThemedText type="default">
              Initialized: {printer.isInitialized ? "Yes" : "No"}
            </ThemedText>
            <ThemedText type="default">
              Status: {printer.status?.statusText || "Unknown"}
            </ThemedText>
            {printer.error && (
              <ThemedText type="default" style={styles.errorText}>
                Error: {printer.error}
              </ThemedText>
            )}
          </View>

          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Receipt Details
            </ThemedText>
            <ThemedText type="default">Receipt No: {receiptData.receiptNumber}</ThemedText>
            <ThemedText type="default">Date: {receiptData.date}</ThemedText>
            <ThemedText type="default">Time: {receiptData.time}</ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Offender Information
            </ThemedText>
            <ThemedText type="default">Name: {name || "N/A"}</ThemedText>
            <ThemedText type="default">License: {license || "N/A"}</ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Payment Details
            </ThemedText>
            <ThemedText type="default">Method: {payment === "mpesa" ? "M-Pesa" : "Scan to Pay"}</ThemedText>
            <ThemedText type="default">Transaction ID: {paymentDetails.transactionId}</ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Selected Offenses
            </ThemedText>
            {selectedOffenses.map((o) => (
              <View key={o.id} style={styles.offenseRow}>
                <ThemedText type="default" style={styles.offenseName}>
                  {o.name}
                </ThemedText>
                <ThemedText type="default" style={styles.offenseFine}>
                  KES {o.fine.toLocaleString()}
                </ThemedText>
              </View>
            ))}
            <View style={styles.totalRow}>
              <ThemedText type="subtitle" style={styles.totalLabel}>
                Total Paid:
              </ThemedText>
              <ThemedText type="subtitle" style={styles.totalAmount}>
                KES {totalFine.toLocaleString()}
              </ThemedText>
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Officer Details
            </ThemedText>
            <ThemedText type="default">Officer: {receiptData.officer}</ThemedText>
            <ThemedText type="default">Badge: {receiptData.badgeNumber}</ThemedText>
          </View>

          <View style={styles.footer}>
            <ThemedText type="default" style={styles.footerText}>
              This is an official receipt for traffic offense payment.
            </ThemedText>
            <ThemedText type="default" style={styles.footerText}>
              Keep this receipt as proof of payment.
            </ThemedText>
          </View>

          <View style={styles.actions}>
            {/* Printer Management Buttons */}
            <View style={styles.printerActions}>
              <TouchableOpacity 
                style={[styles.smallButton, styles.initButton]} 
                onPress={handleInitialize}
                disabled={printer.isLoading}
              >
                <ThemedText type="default" style={styles.smallButtonText}>
                  🔧 Initialize
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.smallButton, styles.statusButton]} 
                onPress={handleCheckStatus}
                disabled={printer.isLoading}
              >
                <ThemedText type="default" style={styles.smallButtonText}>
                  📊 Status
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Test Print Button */}
            <TouchableOpacity 
              style={[styles.button, styles.testButton]} 
              onPress={handleTestPrint}
              disabled={printer.isLoading || !printer.isAvailable}
            >
              <ThemedText type="default" style={styles.buttonText}>
                {printer.isLoading ? "⏳ Processing..." : "🧪 Test Print"}
              </ThemedText>
            </TouchableOpacity>

            {/* Print Receipt Button */}
            <TouchableOpacity 
              style={[styles.button, styles.printButton]} 
              onPress={handlePrint}
              disabled={printer.isLoading || !printer.isAvailable || !printer.isInitialized}
            >
              <ThemedText type="default" style={styles.buttonText}>
                {printer.isLoading ? "⏳ Printing..." : "🖨️ Print Receipt"}
              </ThemedText>
            </TouchableOpacity>

            {/* New Transaction Button */}
            <TouchableOpacity 
              style={[styles.button, styles.newTransactionButton]} 
              onPress={() => router.replace("/")}
            >
              <ThemedText type="default" style={styles.buttonText}>
                ➕ New Offense
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 20,
  },
  title: {
    textAlign: "center",
    marginBottom: 24,
    fontSize: 24,
    fontWeight: "bold",
  },
  section: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    color: "#dc2626",
    fontStyle: "italic",
  },
  offenseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  offenseName: {
    flex: 1,
  },
  offenseFine: {
    fontWeight: "bold",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#059669",
  },
  footer: {
    alignItems: "center",
    marginVertical: 16,
  },
  footerText: {
    textAlign: "center",
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  actions: {
    gap: 12,
    marginTop: 16,
  },
  printerActions: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  smallButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  initButton: {
    backgroundColor: "#8b5cf6",
  },
  statusButton: {
    backgroundColor: "#06b6d4",
  },
  testButton: {
    backgroundColor: "#f59e0b",
  },
  printButton: {
    backgroundColor: "#059669",
  },
  newTransactionButton: {
    backgroundColor: "#6b7280",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  smallButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
})