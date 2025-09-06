import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';

type AppMessageProps = {
  type?: 'error' | 'info' | 'success';
  message: string;
  visible: boolean;
  onClose: () => void;
};

const COLORS = {
  error: '#ed6e6eff',
  info: '#76b4edff',
  success: '#9dec76ff',
};

export default function AppMessage({ type = 'info', message, visible, onClose }: AppMessageProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start(() => onClose());
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;
  return (
    <Animated.View style={[
      styles.container,
      { backgroundColor: COLORS[type] || COLORS.info, opacity: fadeAnim }
    ]}>
      <Text style={styles.text}>{message}</Text>
      <TouchableOpacity onPress={() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start(() => onClose());
      }} style={styles.closeButton}>
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    zIndex: 9999,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  closeButton: {
    marginLeft: 12,
    padding: 4,
  },
  closeText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
});