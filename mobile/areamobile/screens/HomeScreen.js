import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen({ navigation }) {
  const handleGetStarted = () => {
    navigation.navigate("Login");
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#e0f2fe', '#ffffff', '#faf5ff']}
        style={styles.gradient}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.title}>Automate Your Digital World</Text>
          <Text style={styles.subtitle}>
            Create, customize, and automate workflows that connect your favorite apps effortlessly.
          </Text>

          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleGetStarted}
          >
            <LinearGradient
              colors={['#0ea5e9', '#6366f1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Features</Text>

          {/* Feature Card 1 */}
          <View style={styles.featureCard}>
            <Text style={[styles.featureTitle, { color: '#6366f1' }]}>
              Connect Apps
            </Text>
            <Text style={styles.featureDescription}>
              Link services like Gmail, Discord, Slack, and more with ease.
            </Text>
          </View>

          {/* Feature Card 2 */}
          <View style={styles.featureCard}>
            <Text style={[styles.featureTitle, { color: '#0ea5e9' }]}>
              Automate Actions
            </Text>
            <Text style={styles.featureDescription}>
              Build custom automation chains with triggers and reactions.
            </Text>
          </View>

          {/* Feature Card 3 */}
          <View style={styles.featureCard}>
            <Text style={[styles.featureTitle, { color: '#a855f7' }]}>
              Manage Workflows
            </Text>
            <Text style={styles.featureDescription}>
              Visualize, edit, and track the performance of your automation.
            </Text>
          </View>
        </View>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingBottom: 40,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 48,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 26,
    maxWidth: 400,
  },
  ctaButton: {
    width: '100%',
    maxWidth: 300,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  featuresSection: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  featureCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
});
