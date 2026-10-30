
import { StyleSheet, Text, type TextProps } from 'react-native';

type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'subtitle' | 'small';
};

export function ThemedText({
  style,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  return (
    <Text
      style={[styles.default, styles[type], style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    color: '#171717',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 30,
  },
  small: {
    fontSize: 13,
    lineHeight: 18,
  },
});

