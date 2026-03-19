import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function AreaScreen() {
  return (
    <LinearGradient
      colors={['#e0f2fe', '#ffffff', '#faf5ff']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>AREA Dashboard</Text>
        <Text style={styles.description}>
          This feature is under construction.
          {'\n\n'}
          Workflows, services, triggers, and reactions will appear here soon.
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 600,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 28,
    maxWidth: 500,
  },
});
