

import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { countryCodes } from 'react-native-country-codes-picker';
import { Modal, FlatList, Pressable } from 'react-native';
import React ,{ useEffect, useState } from 'react';
import AppMessage from '../../components/AppMessage';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [showPicker, setShowPicker] = useState(false);
  const [country, setCountry] = useState({ code: 'TZ', dial_code: '+255', flag: '🇹🇿', name: 'Tanzania' });
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'error' | 'info' | 'success'>('info');
  const [msgVisible, setMsgVisible] = useState(false);
  const otpInputRefs = React.useRef<Array<any>>([]);
  const router = useRouter();
  const allowedCountries = ['TZ']; // Extend this array to support more countries later

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
      setMsg('Please enter both name and phone number.');
      setMsgType('error');
      setMsgVisible(true);
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
      setMsg(response.data.message || 'Please verify OTP sent to your phone.');
      setMsgType('info');
      setMsgVisible(true);
      setUserId(response.data.user_id);
      setStep('otp');
    } catch (e: any) {
      if (e.response && e.response.data && e.response.data.message) {
        setMsg(e.response.data.message);
        setMsgType('error');
        setMsgVisible(true);
      } else {
        setMsg('Network error. Please try again.');
        setMsgType('error');
        setMsgVisible(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (!otp.trim() || !userId) {
      setMsg('Please enter the OTP.');
      setMsgType('error');
      setMsgVisible(true);
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
          setMsg('Failed to save authentication data. Please try again.');
          setMsgType('error');
          setMsgVisible(true);
        }
      } else {
        setMsg('Invalid response from server.');
        setMsgType('error');
        setMsgVisible(true);
      }
    } catch (e: any) {
      if (e.response && e.response.data && e.response.data.message) {
        setMsg(e.response.data.message);
        setMsgType('error');
        setMsgVisible(true);
      } else {
        setMsg('Network error. Please try again.');
        setMsgType('error');
        setMsgVisible(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  if (step === 'input') {
    return (
    
        <SafeAreaView style={styles.container}>
          <AppMessage
            type={msgType}
            message={msg}
            visible={msgVisible}
            onClose={() => setMsgVisible(false)}
          />
          <Text style={styles.title}>Enter your Details</Text>

        <TextInput
          style={styles.inputname}
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          placeholderTextColor={"#0008"}
        />

        <View style={styles.row}>
          <TouchableOpacity
            style={styles.countryPicker}
            onPress={() => setShowPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.flag}>{country.flag}</Text>
            <Text style={styles.dialCode}>{country.dial_code}</Text>
          </TouchableOpacity>
          <TextInput
            style={[styles.input, styles.phoneInput]}
            placeholder="Enter your phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholderTextColor={"#0008"}
            maxLength={15}
          />
        </View>

        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <View style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 20,
              minWidth: 250,
              maxHeight: 300
            }}>
              <FlatList
                data={countryCodes.filter(c => allowedCountries.includes(c.code))}
                keyExtractor={item => item.code}
                renderItem={({ item }) => (
                  <Pressable
                    style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }}
                    onPress={() => {
                      setCountry({
                        code: item.code,
                        dial_code: item.dial_code,
                        flag: item.flag,
                        name: item.name['en'] || Object.values(item.name)[0] || '',
                      });
                      setShowPicker(false);
                    }}
                  >
                    <Text style={{ fontSize: 22, marginRight: 8 }}>{item.flag}</Text>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginRight: 8 }}>{item.dial_code}</Text>
                    <Text style={{ fontSize: 16 }}>{item.name['en'] || Object.values(item.name)[0] || ''}</Text>
                  </Pressable>
                )}
              />
              <Button title="Cancel" onPress={() => setShowPicker(false)} />
            </View>
          </View>
        </Modal>

        <TouchableOpacity style={styles.button} onPress={handleAuthSubmit}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </SafeAreaView>
    
    );
  } else {
    return (
      <View style={styles.container}>
        <AppMessage
          type={msgType}
          message={msg}
          visible={msgVisible}
          onClose={() => setMsgVisible(false)}
        />
        <View style={styles.otpHeader}>
          <TouchableOpacity onPress={() => setStep('input')}>
            <Text style={styles.otpBackText}>← Return to enter details</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>Enter OTP</Text>
        <View style={styles.otpRow}>
          {Array.from({ length: 6 }).map((_, i) => (
            <TextInput
              key={i}
              ref={ref => { otpInputRefs.current[i] = ref; }}
              style={styles.otpBox}
              keyboardType="number-pad"
              maxLength={1}
              value={otp[i] || ''}
              onChangeText={val => {
                if (!/^\d*$/.test(val)) return;
                let newOtp = otp.split('');
                newOtp[i] = val;
                setOtp(newOtp.join('').slice(0, 6));
                if (val && i < 5) {
                  otpInputRefs.current[i + 1]?.focus();
                }
              }}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace' && !otp[i] && i > 0) {
                  otpInputRefs.current[i - 1]?.focus();
                }
              }}
              textAlign="center"
              autoFocus={i === 0}
              returnKeyType={i === 5 ? 'done' : 'next'}
            />
          ))}
  
        </View>       
        <TouchableOpacity style={styles.otpButton} onPress={handleOtpSubmit}>
          <Text style={styles.buttonText}>Verify</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#ffff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'normal',
    marginBottom: 40,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    marginTop: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#31A71B',
    padding: 9,
    marginRight: 8,
    borderBottomWidth: 1,
    
    minWidth: 80,
  },
  flag: {
    fontSize: 22,
    marginRight: 4,
  },
  dialCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  inputname: {
    borderTopWidth: 1,
    borderColor: '#31A71B',
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#000',
  },
  input: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#31A71B',
    padding: 12,
    fontSize: 16,
    flex: 1,
  },
  phoneInput: {
    marginLeft: 0,
  },
  button: {
    marginTop: '80%',
    backgroundColor: '#31A71B',
    color: '#0000',
    borderRadius: 8,
    overflow: 'hidden',
    width: '40%',
    alignSelf: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 12,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  otpBox: {
    width: 40,
    height: 48,
    borderWidth: 1,
    borderColor: '#31A71B',
    borderRadius: 8,
    marginHorizontal: 4,
    fontSize: 24,
    textAlign: 'center',
    backgroundColor: '#fff',
    color: '#000',
  },
  otpButton: {
    marginTop: '80%',
    backgroundColor: '#31A71B',
    color: '#0000',
    borderRadius: 8,
    overflow: 'hidden',
    width: '40%',
    alignSelf: 'center',
  },
  otpHeader: {
    marginTop: 16,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  otpBackText: {
    color: '#1890ff',
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
});