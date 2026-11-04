import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { Api, ApiError } from '@/lib/api';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState('');
  const [checkIn, setCheckIn] = useState<{ status: 'idle' | 'loading' | 'ok' | 'error'; msg?: string }>({ status: 'idle' });

  const { theme, themeMode } = useAppTheme();

  useEffect(() => {
    setScanned(false);
    setScanResult('');
    setCheckIn({ status: 'idle' });
  }, []);

  const handleScanned = async (data: string) => {
    setScanned(true);
    setScanResult(data);
    setCheckIn({ status: 'loading' });
    // We expect the QR to encode the gym_id (uuid). Reject anything else.
    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const gymId = data.trim();
    if (!uuidRe.test(gymId)) {
      setCheckIn({ status: 'error', msg: 'That QR code does not look like a gym code.' });
      return;
    }
    try {
      await Api.checkIn(gymId);
      setCheckIn({ status: 'ok', msg: 'Checked in. Have a great workout!' });
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : (e as Error).message;
      setCheckIn({ status: 'error', msg: msg || 'Check-in failed.' });
    }
  };

  if (!permission) {
    return (
     <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" />
        <Text style={styles.infoText}>Checking camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Ionicons name="camera-outline" size={60} color="#64748B" />

        <Text style={styles.title}>Camera Permission</Text>

        <Text style={styles.description}>
          QR code scan karne ke liye camera permission allow karo.
        </Text>

        <Pressable
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Allow Camera</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Scan QR Code</Text>

      <Text style={styles.subtitle}>
        Scan your gym QR code for attendance.
      </Text>

      <View style={styles.cameraContainer}>
       <CameraView
  style={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }}
  facing="back"
  barcodeScannerSettings={{
    barcodeTypes: ['qr'],
  }}
  onBarcodeScanned={
    scanned
      ? undefined
      : ({ data }) => { void handleScanned(data); }
  }
/>
        <View pointerEvents="none" style={styles.overlay}>
          <View style={styles.scanFrame} />
          <Text style={styles.scanHint}>
            Place the QR code inside the frame
          </Text>
        </View>
      </View>

      {scanResult ? (
        <View style={styles.resultCard}>
          {checkIn.status === 'loading' && <ActivityIndicator size="small" />}
          {checkIn.status === 'ok' && (
            <Ionicons name="checkmark-circle" size={26} color="#16A34A" />
          )}
          {checkIn.status === 'error' && (
            <Ionicons name="close-circle" size={26} color="#DC4545" />
          )}
          <View style={styles.resultContent}>
            <Text style={styles.resultTitle}>
              {checkIn.status === 'loading' && 'Checking in...'}
              {checkIn.status === 'ok' && 'Checked in'}
              {checkIn.status === 'error' && 'Check-in failed'}
            </Text>
            <Text style={styles.resultText}>
              {checkIn.msg ?? scanResult}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.instructionCard}>
          <Ionicons name="qr-code-outline" size={28} color="#64748B" />

          <Text style={styles.instructionText}>
            Keep your camera steady and align the QR code within the frame.
          </Text>
        </View>
      )}

      {scanned && (
        <Pressable
          style={styles.scanAgainButton}
          onPress={() => {
            setScanned(false);
            setScanResult('');
          }}
        >
          <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Scan Again</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  flex: 1,
  padding: 20,
  paddingTop: 30,
  
},
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    marginBottom: 24,
  },
  cameraContainer: {
    height: 360,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
  },
  overlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: 'center',
  alignItems: 'center',
},
  scanFrame: {
    width: 230,
    height: 230,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: 24,
  },
  scanHint: {
    color: '#FFFFFF',
    fontSize: 13,
    marginTop: 22,
    textAlign: 'center',
  },
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 18,
    marginTop: 24,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: '#475569',
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 18,
    marginTop: 24,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#15803D',
    marginBottom: 6,
  },
  resultText: {
    fontSize: 14,
    color: '#475569',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
    color: '#0F172A',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    color: '#64748B',
    marginTop: 10,
    marginBottom: 22,
  },
  infoText: {
    marginTop: 12,
    color: '#64748B',
  },
  permissionButton: {
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  scanAgainButton: {
    backgroundColor: '#0F172A',
    padding: 16,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  
});