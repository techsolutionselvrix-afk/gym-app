
import { PropsWithChildren, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';

type CollapsibleProps = PropsWithChildren & {
  title: string;
};

export function Collapsible({ children, title }: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View>
      <Pressable
        style={({ pressed }) => [
          styles.heading,
          pressed && styles.pressedHeading,
        ]}
        onPress={() => setIsOpen((value) => !value)}
      >
        <View style={styles.iconContainer}>
          <ThemedText>{isOpen ? '⌄' : '›'}</ThemedText>
        </View>

        <ThemedText type="small">{title}</ThemedText>
      </Pressable>

      {isOpen && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.content}>
          {children}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  pressedHeading: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#E0E7E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    marginTop: 10,
    marginLeft: 42,
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#F0F4F0',
  },
});

