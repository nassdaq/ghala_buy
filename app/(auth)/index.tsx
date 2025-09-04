import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function AuthScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkStored = async () => {
      try {
        const storedName = await AsyncStorage.getItem('user_name');
        const storedPhone = await AsyncStorage.getItem('user_phone');
        if (storedName && storedPhone) {
          router.replace('/(app)/(tabs)');
        } else {
          setLoading(false);
        }
      } catch (e) {
        setLoading(false);
      }
    };
    checkStored();
  }, []);

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Error', 'Please enter both name and phone number.');
      return;
    }
    try {
      await AsyncStorage.setItem('user_name', name.trim());
      await AsyncStorage.setItem('user_phone', phone.trim());
      router.replace('/(app)/(tabs)');
    } catch (e) {
      Alert.alert('Error', 'Failed to save your info. Please try again.');
    }
  };

  if (loading) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome!</Text>
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />
      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your phone number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <Button title="Continue" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
});