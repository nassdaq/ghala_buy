import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import axios from 'axios';

export default function AuthScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const router = useRouter();

  useEffect(() => {
    const checkStored = async () => {
      try {
        const token = await AsyncStorage.getItem('user_token');
        if (token) {
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

  const handleAuthSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Error', 'Please enter both name and phone number.');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post('http://0.0.0.0:8000/api/v1/auth', {
        name: name.trim(),
        phone_number: phone.trim(),
      }, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      Alert.alert('Info', response.data.message || 'Please verify OTP sent to your phone.');
      setUserId(response.data.user_id);
      setStep('otp');
    } catch (e: any) {
      if (e.response && e.response.data && e.response.data.message) {
        Alert.alert('Error', e.response.data.message);
      } else {
        Alert.alert('Error', 'Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (!otp.trim() || !userId) {
      Alert.alert('Error', 'Please enter the OTP.');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(`http://0.0.0.0:8000/api/v1/verify-otp?user_id=${userId}`, {
        otp: otp.trim(),
      }, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      console.log('OTP verification response:', response.data);
      if (response.data.token && response.data.user) {
        try {
          await AsyncStorage.setItem('user_token', response.data.token);
          await AsyncStorage.setItem('user_name', response.data.user.name);
          await AsyncStorage.setItem('user_phone', response.data.user.phone_number);
          router.replace('/(app)/(tabs)');
        } catch (storageError) {
          console.error('Failed to store token or user info:', storageError);
          Alert.alert('Error', 'Failed to save authentication data. Please try again.');
        }
      } else {
        Alert.alert('Error', 'Invalid response from server.');
      }
    } catch (e: any) {
      if (e.response && e.response.data && e.response.data.message) {
        Alert.alert('Error', e.response.data.message);
      } else {
        Alert.alert('Error', 'Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  if (step === 'input') {
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
        <Button title="Continue" onPress={handleAuthSubmit} />
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Enter OTP</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter OTP"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
        />
        <Button title="Verify OTP" onPress={handleOtpSubmit} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '',
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