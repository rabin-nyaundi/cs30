import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';

const OFFENSES = [
  { id: '1', name: 'Speeding', fine: 3000 },
  { id: '2', name: 'Driving without seatbelt', fine: 1000 },
  { id: '3', name: 'Using mobile phone while driving', fine: 2000 },
  { id: '4', name: 'Careless driving', fine: 5000 },
  { id: '5', name: 'Unroadworthy vehicle', fine: 10000 },
  { id: '6', name: 'Expired insurance', fine: 10000 },
  // Add more as needed
];

export default function OffenseSelectionScreen() {
  const [selected, setSelected] = useState<string[]>([]);
  const router = useRouter();

  const toggleSelect = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const totalFine = selected.reduce(
    (sum, id) => sum + (OFFENSES.find(o => o.id === id)?.fine || 0),
    0
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Select Traffic Offense(s)</ThemedText>
      <FlatList
        data={OFFENSES}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.offenseItem,
              selected.includes(item.id) && styles.selectedItem,
            ]}
            onPress={() => toggleSelect(item.id)}
          >
            <ThemedText type="default">
              {item.name} - KES {item.fine.toLocaleString()}
            </ThemedText>
          </TouchableOpacity>
        )}
        style={{ marginVertical: 16 }}
      />
      <ThemedText type="subtitle">Total Fine: KES {totalFine.toLocaleString()}</ThemedText>
      <TouchableOpacity
        style={[styles.button, selected.length === 0 && styles.buttonDisabled]}
        disabled={selected.length === 0}
        onPress={() => router.push({ pathname: '/offender-details', params: { selected: selected.join(',') } })}
      >
        <ThemedText type="default" style={{ color: '#fff' }}>
          Next: Offender Details
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  offenseItem: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginBottom: 10,
  },
  selectedItem: {
    backgroundColor: '#cce5ff',
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
