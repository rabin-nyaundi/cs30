import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';

const OFFENSES = [
  { id: '1', name: 'Speeding', fine: 3000 },
  { id: '2', name: 'Driving without seatbelt', fine: 1000 },
  { id: '3', name: 'Using mobile phone while driving', fine: 2000 },
  { id: '4', name: 'Careless driving', fine: 5000 },
  { id: '5', name: 'Unroadworthy vehicle', fine: 10000 },
  { id: '6', name: 'Expired insurance', fine: 10000 },
];

export default function MpesaPaymentScreen() {
  const { selected, name, license } = useLocalSearchParams<{
    selected: string;
    name: string;
    license: string;
  }>();
  const selectedIds = selected ? selected.split(',') : [];
  const selectedOffenses = OFFENSES.filter(o => selectedIds.includes(o.id));
  const totalFine = selectedOffenses.reduce((sum, o) => sum + o.fine, 0);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push({ pathname: '/receipt', params: { selected, name, license, payment: 'mpesa' } });
    }, 2000); // Simulate payment
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">M-Pesa Payment</ThemedText>
      <ThemedText type="default">Total Fine: KES {totalFine.toLocaleString()}</ThemedText>
      <ThemedText type="subtitle">Offender: {name} ({license})</ThemedText>
      <ThemedText type="subtitle">Selected Offenses:</ThemedText>
      {selectedOffenses.map(o => (
        <ThemedText key={o.id} type="default">{o.name} - KES {o.fine.toLocaleString()}</ThemedText>
      ))}
      <TouchableOpacity style={styles.button} onPress={handlePay} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <ThemedText type="default" style={{ color: '#fff' }}>Simulate M-Pesa Payment</ThemedText>}
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  button: {
    backgroundColor: '#25d366',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
}); 