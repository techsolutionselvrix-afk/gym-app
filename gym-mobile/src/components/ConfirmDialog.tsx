import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/context/ThemeContext';

type Request = {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
};

type Listener = (req: Request | null) => void;
const listeners = new Set<Listener>();

export function showConfirm(req: Request) {
  listeners.forEach((l) => l(req));
}

function closeAll() {
  listeners.forEach((l) => l(null));
}

export function ConfirmHost() {
  const { theme } = useAppTheme();
  const [req, setReq] = useState<Request | null>(null);

  useEffect(() => {
    const l: Listener = (r) => setReq(r);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);

  if (!req) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={closeAll}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>{req.title}</Text>
          {req.message && (
            <Text style={[styles.message, { color: theme.secondaryText }]}>{req.message}</Text>
          )}

          <View style={styles.row}>
            <Pressable
              onPress={closeAll}
              style={[styles.btn, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
            >
              <Text style={{ color: theme.text, fontWeight: '700' }}>
                {req.cancelText ?? 'Cancel'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                const onConfirm = req.onConfirm;
                closeAll();
                onConfirm();
              }}
              style={[
                styles.btn,
                req.destructive
                  ? { backgroundColor: '#DC4545' }
                  : { backgroundColor: theme.primary },
              ]}
            >
              <Text
                style={{
                  color: req.destructive ? '#FFFFFF' : theme.background,
                  fontWeight: '800',
                }}
              >
                {req.confirmText ?? 'OK'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', padding: 22,
  },
  card: { borderRadius: 18, borderWidth: 1, padding: 22, gap: 8 },
  title: { fontSize: 17, fontWeight: '800' },
  message: { fontSize: 13, lineHeight: 19, marginTop: 4 },
  row: { flexDirection: 'row', gap: 10, marginTop: 16 },
  btn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 11,
  },
});
