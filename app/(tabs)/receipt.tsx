"use client"

import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Alert, StyleSheet, TouchableOpacity, ScrollView, View } from "react-native"
import { SmartPOSPrinter } from "../../utils/SmartPOSPrint"

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

  const selectedIds = selected ? selected.split(",") : []
  const selectedOffenses = OFFENSES.filter((o) => selectedIds.includes(o.id))
  const totalFine = selectedOffenses.reduce((sum, o) => sum + o.fine, 0)
  const router = useRouter()

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

  const handlePrint = async () => {
    try {
      const printData = {
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

      const success = await SmartPOSPrinter.printReceipt(printData)

      if (success) {
        Alert.alert("Receipt Printed", "Receipt has been printed successfully", [
          {
            text: "New Transaction",
            onPress: () => router.replace("/"),
          },
        ])
      } else {
        Alert.alert("Print Error", "Failed to print receipt. Please try again.")
      }
    } catch (error) {
      console.error("Print error:", error)
      Alert.alert("Print Error", "Printer not connected or error occurred.")
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <ThemedText type="title" style={styles.title}>
            Payment Receipt
          </ThemedText>

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
            <ThemedText type="default">Transaction ID: TXN{Date.now()}</ThemedText>
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
            <TouchableOpacity style={styles.printButton} onPress={handlePrint}>
              <ThemedText type="default" style={styles.buttonText}>
                🖨️ Print Receipt
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.newTransactionButton]} onPress={() => router.replace("/")}>
              <ThemedText type="default" style={styles.buttonText}>
                New Offense
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
  button: {
    backgroundColor: "#007bff",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  printButton: {
    backgroundColor: "#059669",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  newTransactionButton: {
    backgroundColor: "#6b7280",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
})
