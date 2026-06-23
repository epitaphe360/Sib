import React, { Component, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { captureException } from '../lib/sentry';
import { PrimaryButton } from './ui';
import { colors, spacing } from '../theme';

interface Props {
  children: ReactNode;
  title?: string;
  retryLabel?: string;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    captureException(error, { componentStack: info.componentStack ?? undefined });
    if (__DEV__) console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.wrap}>
          <Text style={styles.title}>{this.props.title ?? 'Erreur inattendue'}</Text>
          <Text style={styles.msg}>{this.state.error.message}</Text>
          <PrimaryButton
            label={this.props.retryLabel ?? 'Réessayer'}
            onPress={() => this.setState({ error: null })}
          />
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.background },
  title: { fontSize: 20, fontWeight: '700', color: colors.primary, marginBottom: spacing.sm },
  msg: { color: colors.textMuted, marginBottom: spacing.lg },
});
