import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';

const OFFENSES = [
  { id: '1', name: 'Speeding', fine: 3000 },
  { id: '2', name: 'Driving without seatbelt', fine: 1000 },
  { id: '3', name: 'Using mobile phone while driving', fine: 2000 },
  { id: '4', name: 'Careless driving', fine: 5000 },
  { id: '5', name: 'Unroadworthy vehicle', fine: 10000 },
  { id: '6', name: 'Expired insurance', fine: 10000 },
];

export default function OffenderDetailsScreen() {
  const { selected } = useLocalSearchParams<{ selected: string }>();
  const selectedIds = selected ? selected.split(',') : [];
  const selectedOffenses = OFFENSES.filter(o => selectedIds.includes(o.id));
  const totalFine = selectedOffenses.reduce((sum, o) => sum + o.fine, 0);

  const [name, setName] = useState('');
  const [license, setLicense] = useState('');
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Offender Details</ThemedText>
      <ThemedText type="default">Total Fine: KES {totalFine.toLocaleString()}</ThemedText>
      <ThemedText type="subtitle">Selected Offenses:</ThemedText>
      {selectedOffenses.map(o => (
        <ThemedText key={o.id} type="default">{o.name} - KES {o.fine.toLocaleString()}</ThemedText>
      ))}
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="License Number"
        value={license}
        onChangeText={setLicense}
      />
      <TouchableOpacity
        style={[styles.button, (!name || !license) && styles.buttonDisabled]}
        disabled={!name || !license}
        onPress={() => router.push({ pathname: '/payment-mode', params: { selected, name, license } })}
      >
        <ThemedText type="default" style={{ color: '#fff' }}>
          Next: Payment Mode
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    backgroundColor: '#aaa',
  },
}); 