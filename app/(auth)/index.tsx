

import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { countryCodes } from 'react-native-country-codes-picker';
import { Modal, FlatList, Pressable } from 'react-native';
import React ,{ useEffect, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import AppMessage from '../../components/AppMessage';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthScreen() {
  const colors = useTheme();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');

  // Move StyleSheet inside the component to access colors
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 24,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 28,
      fontWeight: 'normal',
      marginBottom: 40,
      textAlign: 'center',
      color: colors.text,
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
      borderBottomWidth: 1,
      borderColor: colors.border,
      padding: 9,
      marginRight: 8,
      minWidth: 80,
    },
    flag: {
      fontSize: 22,
      marginRight: 4,
    },
    dialCode: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
    },
    inputname: {
      borderTopWidth: 1,
      borderColor: colors.border,
      padding: 12,
      fontSize: 16,
      marginBottom: 16,
      color: colors.text,
  
    },
    input: {
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
      padding: 12,
      fontSize: 16,
      flex: 1,
      color: colors.text,
    
    },
    phoneInput: {
      marginLeft: 0,
    },
    button: {
      marginTop: '80%',
      backgroundColor: colors.buttonBg,
      borderRadius: 8,
      overflow: 'hidden',
      width: '40%',
      alignSelf: 'center',
    },
    countryButton: {
      backgroundColor: colors.buttonBg,
      borderRadius: 8,
      overflow: 'hidden',
      width: '40%',
      alignSelf: 'center',
    },
    
    buttonText: {
      color: colors.buttonText,
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
      borderColor: colors.border,
      borderRadius: 8,
      marginHorizontal: 4,
      fontSize: 24,
      textAlign: 'center',
      backgroundColor: colors.inputBg,
      color: colors.text,
    },
    otpButton: {
      marginLeft: 12,
      backgroundColor: colors.buttonBg,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    otpHeader: {
      marginTop: 16,
      marginBottom: 8,
      alignItems: 'flex-start',
    },
    otpBackText: {
      color: colors.text,
      fontSize: 28,
      fontWeight: 'normal',
      paddingVertical: 0,
      paddingHorizontal: 0,
    },
    otpHeaderBar: {
      height: 56,
      backgroundColor: colors.background,
      justifyContent: 'center',
      paddingHorizontal: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    otpHeaderTouchable: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      height: '100%',
      marginBottom: '40%'
    },
  });
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
          placeholderTextColor={colors.placeholder}
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
            placeholderTextColor={colors.placeholder}
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
              backgroundColor: colors.background,
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
                    <Text style={{ fontSize: 16, color: colors.text,fontWeight:'normal', marginRight: 8 }}>{item.dial_code}</Text>
                    <Text style={{ fontSize: 16, color: colors.text,fontWeight:'normal' }}>{item.name['en'] || Object.values(item.name)[0] || ''}</Text>
                  </Pressable>
                )}
              />

              <TouchableOpacity style={styles.countryButton} onPress={() => setShowPicker(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
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
        {/* Prominent header bar with back action */}
        <View style={styles.otpHeaderBar}>
          <TouchableOpacity style={styles.otpHeaderTouchable} onPress={() => setStep('input')} activeOpacity={0.7}>
            <Text style={styles.otpBackText}>← Enter OTP </Text>
          </TouchableOpacity>
        </View>
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
              
            />
          ))}
        </View>
        <TouchableOpacity style={styles.button} onPress={handleOtpSubmit}>
          <Text style={styles.buttonText}>Verify</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
