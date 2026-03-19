import React, { useState, useEffect, useCallback } from "react";
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
import { useFocusEffect } from "@react-navigation/native";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { getAllServices, getUserServices, connectService, disconnectService, connectGitHubMobile } from "../api/api";

WebBrowser.maybeCompleteAuthSession();

// GitHub OAuth config - You'll need to create a GitHub OAuth App and add these
const GITHUB_CLIENT_ID = "Ov23liUp1tnGuvLCRw4L";

const githubDiscovery = {
    authorizationEndpoint: "https://github.com/login/oauth/authorize",
    tokenEndpoint: "https://github.com/login/oauth/access_token",
    revocationEndpoint: `https://github.com/settings/connections/applications/${GITHUB_CLIENT_ID}`,
};

export default function ServicesScreen() {
    const [services, setServices] = useState([]);
    const [userServices, setUserServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedService, setExpandedService] = useState(null);
    const [userEmail, setUserEmail] = useState(null);

    // GitHub OAuth setup - using Expo auth proxy
    const redirectUri = AuthSession.makeRedirectUri({
        scheme: "areamobile",
        useProxy: true,
    });

    const [githubRequest, githubResponse, promptGitHubAsync] = AuthSession.useAuthRequest(
        {
            clientId: GITHUB_CLIENT_ID,
            scopes: ["user", "repo"],
            redirectUri,
        },
        githubDiscovery
    );

    // Get user email from token for GitHub linking
    useEffect(() => {
        const getUserEmail = async () => {
            try {
                const token = await AsyncStorage.getItem("userToken");
                if (token) {
                    // Decode JWT to get email (basic parsing)
                    const payload = token.split(".")[1];
                    const decoded = JSON.parse(atob(payload));
                    setUserEmail(decoded.sub);
                }
            } catch (err) {
                console.error("Error getting user email:", err);
            }
        };
        getUserEmail();
    }, []);

    // Handle GitHub OAuth response
    useEffect(() => {
        if (githubResponse?.type === "success") {
            const { code } = githubResponse.params;
            if (code) {
                handleGitHubCallback(code);
            }
        } else if (githubResponse?.type === "error") {
            console.error("GitHub auth error:", githubResponse.error);
            Alert.alert("Error", "GitHub login failed. Please try again.");
        }
    }, [githubResponse]);

    const handleGitHubCallback = async (code) => {
        try {
            // Exchange code for token via backend
            const res = await api.post("/api/auth/github-callback", { code, userEmail });
            if (res.data.message) {
                Alert.alert("Success", "GitHub connected!");
                loadData();
            }
        } catch (error) {
            console.error("GitHub callback error:", error);
            Alert.alert("Error", "Failed to connect GitHub");
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        try {
            const [allServices, connectedServices] = await Promise.all([
                getAllServices().catch(() => []),
                getUserServices().catch(() => []),
            ]);
            setServices(allServices || []);
            setUserServices(connectedServices || []);
        } catch (error) {
            console.error("Error loading services:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const isConnected = (serviceName) => {
        return userServices.some((s) => s.name === serviceName);
    };

    const handleConnect = async (service) => {
        if (service.name.toLowerCase() === "github") {
            try {
                await promptGitHubAsync({ useProxy: true });
            } catch (err) {
                console.error("GitHub OAuth error:", err);
                Alert.alert("Error", "Could not open GitHub login");
            }
            return;
        }

        try {
            await connectService(service.name);
            Alert.alert("Success", `${service.name} connected!`);
            loadData();
        } catch (error) {
            console.error("Error connecting service:", error);
            Alert.alert("Error", "Failed to connect service");
        }
    };

    const handleDisconnect = async (serviceName) => {
        Alert.alert("Disconnect", `Disconnect ${serviceName}?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Disconnect",
                style: "destructive",
                onPress: async () => {
                    try {
                        await disconnectService(serviceName);
                        loadData();
                    } catch (error) {
                        console.error("Error disconnecting:", error);
                    }
                },
            },
        ]);
    };

    const toggleExpand = (serviceName) => {
        setExpandedService(expandedService === serviceName ? null : serviceName);
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <Text style={styles.headerText}>
                Connect services to use their actions and reactions
            </Text>

            {services.map((service) => {
                const connected = isConnected(service.name);
                const expanded = expandedService === service.name;
                const actions = service.actions || [];
                const reactions = service.reactions || [];

                return (
                    <View key={service.name} style={styles.serviceCard}>
                        {/* Service Header */}
                        <TouchableOpacity
                            style={styles.serviceHeader}
                            onPress={() => toggleExpand(service.name)}
                        >
                            <View style={styles.serviceInfo}>
                                <View style={styles.serviceTitleRow}>
                                    <Text style={styles.serviceName}>{service.name}</Text>
                                    {connected && (
                                        <View style={styles.connectedBadge}>
                                            <Text style={styles.connectedText}>✓ Connected</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.serviceDesc}>{service.description}</Text>
                            </View>
                            <Text style={styles.expandIcon}>{expanded ? "▼" : "▶"}</Text>
                        </TouchableOpacity>

                        {/* Expanded Content */}
                        {expanded && (
                            <View style={styles.expandedContent}>
                                {/* Actions */}
                                {actions.length > 0 && (
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>⚡ Actions (Triggers)</Text>
                                        {actions.map((action, idx) => (
                                            <View key={idx} style={styles.actionItem}>
                                                <Text style={styles.actionName}>
                                                    {action.name.replace(/_/g, " ")}
                                                </Text>
                                                <Text style={styles.actionDesc}>{action.description}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {/* Reactions */}
                                {reactions.length > 0 && (
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>🎯 Reactions</Text>
                                        {reactions.map((reaction, idx) => (
                                            <View key={idx} style={styles.reactionItem}>
                                                <Text style={styles.reactionName}>
                                                    {reaction.name.replace(/_/g, " ")}
                                                </Text>
                                                <Text style={styles.reactionDesc}>{reaction.description}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {/* Connect/Disconnect Button */}
                                <TouchableOpacity
                                    style={[
                                        styles.connectBtn,
                                        connected ? styles.disconnectBtn : styles.connectBtnEnabled,
                                    ]}
                                    onPress={() =>
                                        connected
                                            ? handleDisconnect(service.name)
                                            : handleConnect(service)
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.connectText,
                                            connected ? styles.disconnectText : {},
                                        ]}
                                    >
                                        {connected ? "Disconnect" : "Connect Service"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f3f4f6",
    },
    content: {
        padding: 16,
    },
    headerText: {
        fontSize: 14,
        color: "#6b7280",
        marginBottom: 16,
        textAlign: "center",
    },
    serviceCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        marginBottom: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    serviceHeader: {
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
    },
    serviceInfo: {
        flex: 1,
    },
    serviceTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    serviceName: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1f2937",
        textTransform: "capitalize",
    },
    connectedBadge: {
        backgroundColor: "#dcfce7",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    connectedText: {
        color: "#16a34a",
        fontSize: 12,
        fontWeight: "500",
    },
    serviceDesc: {
        fontSize: 13,
        color: "#6b7280",
        marginTop: 4,
    },
    expandIcon: {
        fontSize: 12,
        color: "#9ca3af",
    },
    expandedContent: {
        padding: 16,
        paddingTop: 0,
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
    },
    section: {
        marginTop: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 8,
    },
    actionItem: {
        backgroundColor: "#eef2ff",
        padding: 12,
        borderRadius: 8,
        marginBottom: 6,
    },
    actionName: {
        fontSize: 14,
        fontWeight: "500",
        color: "#4f46e5",
        textTransform: "capitalize",
    },
    actionDesc: {
        fontSize: 12,
        color: "#6b7280",
        marginTop: 2,
    },
    reactionItem: {
        backgroundColor: "#faf5ff",
        padding: 12,
        borderRadius: 8,
        marginBottom: 6,
    },
    reactionName: {
        fontSize: 14,
        fontWeight: "500",
        color: "#7c3aed",
        textTransform: "capitalize",
    },
    reactionDesc: {
        fontSize: 12,
        color: "#6b7280",
        marginTop: 2,
    },
    connectBtn: {
        marginTop: 16,
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
    },
    connectBtnEnabled: {
        backgroundColor: "#6366f1",
    },
    disconnectBtn: {
        backgroundColor: "#fee2e2",
    },
    connectText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
    disconnectText: {
        color: "#dc2626",
    },
});
