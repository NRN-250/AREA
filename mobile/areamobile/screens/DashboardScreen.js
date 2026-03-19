import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    RefreshControl,
    Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { getUserServices, getAreas, logout } from "../api/api";

export default function DashboardScreen({ navigation, onLogout }) {
    const [userServices, setUserServices] = useState([]);
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [servicesData, areasData] = await Promise.all([
                getUserServices().catch(() => []),
                getAreas().catch(() => []),
            ]);
            setUserServices(servicesData || []);
            setAreas(areasData || []);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const handleLogout = async () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout",
                style: "destructive",
                onPress: async () => {
                    await logout();
                    // Call the onLogout callback to update App.js state
                    onLogout?.();
                },
            },
        ]);
    };

    const activeAreas = areas.filter((a) => a.enabled).length;

    return (
        <LinearGradient colors={["#e0f2fe", "#ffffff", "#faf5ff"]} style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Dashboard</Text>
                        <Text style={styles.subtitle}>Welcome back!</Text>
                    </View>
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: "#6366f1" }]}>
                        <Text style={styles.statNumber}>{userServices.length}</Text>
                        <Text style={styles.statLabel}>Services</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: "#0ea5e9" }]}>
                        <Text style={styles.statNumber}>{areas.length}</Text>
                        <Text style={styles.statLabel}>Areas</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: "#10b981" }]}>
                        <Text style={styles.statNumber}>{activeAreas}</Text>
                        <Text style={styles.statLabel}>Active</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.actionsRow}>
                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => navigation.navigate("Services")}
                        >
                            <Text style={styles.actionIcon}>🔌</Text>
                            <Text style={styles.actionText}>Connect Services</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionCard}
                            onPress={() => navigation.navigate("Create")}
                        >
                            <Text style={styles.actionIcon}>➕</Text>
                            <Text style={styles.actionText}>Create Area</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Recent Areas */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Areas</Text>
                    {areas.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyText}>No areas yet</Text>
                            <Text style={styles.emptySubtext}>
                                Create your first automation!
                            </Text>
                        </View>
                    ) : (
                        areas.slice(0, 3).map((area) => (
                            <View key={area.id} style={styles.areaCard}>
                                <View style={styles.areaInfo}>
                                    <Text style={styles.areaName}>{area.name || `Area #${area.id}`}</Text>
                                    <Text style={styles.areaFlow}>
                                        {area.actionType} → {area.reactionType}
                                    </Text>
                                </View>
                                <View
                                    style={[
                                        styles.statusBadge,
                                        { backgroundColor: area.enabled ? "#10b981" : "#9ca3af" },
                                    ]}
                                >
                                    <Text style={styles.statusText}>
                                        {area.enabled ? "ON" : "OFF"}
                                    </Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingTop: 60,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#1f2937",
    },
    subtitle: {
        fontSize: 16,
        color: "#6b7280",
        marginTop: 4,
    },
    logoutBtn: {
        backgroundColor: "#fee2e2",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    logoutText: {
        color: "#dc2626",
        fontWeight: "600",
    },
    statsRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: "center",
    },
    statNumber: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#fff",
    },
    statLabel: {
        fontSize: 12,
        color: "rgba(255,255,255,0.8)",
        marginTop: 4,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#1f2937",
        marginBottom: 12,
    },
    actionsRow: {
        flexDirection: "row",
        gap: 12,
    },
    actionCard: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    actionIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    actionText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#374151",
        textAlign: "center",
    },
    emptyCard: {
        backgroundColor: "#fff",
        padding: 32,
        borderRadius: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#6b7280",
    },
    emptySubtext: {
        fontSize: 14,
        color: "#9ca3af",
        marginTop: 4,
    },
    areaCard: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    areaInfo: {
        flex: 1,
    },
    areaName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1f2937",
    },
    areaFlow: {
        fontSize: 12,
        color: "#6b7280",
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
});
