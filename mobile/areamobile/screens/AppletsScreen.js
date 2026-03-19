import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    RefreshControl,
    Alert,
    Switch,
} from "react-native";
import api, { getAreas, deleteArea, toggleArea } from "../api/api";

export default function AppletsScreen({ navigation }) {
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadAreas();
    }, []);

    const loadAreas = async () => {
        try {
            const data = await getAreas();
            setAreas(data || []);
        } catch (error) {
            console.error("Error loading areas:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadAreas();
    };

    const handleToggle = async (area) => {
        try {
            await toggleArea(area.id, !area.enabled);
            loadAreas();
        } catch (error) {
            console.error("Error toggling area:", error);
            Alert.alert("Error", "Failed to toggle area");
        }
    };

    const handleDelete = (area) => {
        Alert.alert(
            "Delete Area",
            `Delete "${area.name || `Area #${area.id}`}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteArea(area.id);
                            loadAreas();
                        } catch (error) {
                            console.error("Error deleting area:", error);
                            Alert.alert("Error", "Failed to delete area");
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <Text style={styles.loadingText}>Loading areas...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {areas.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>⚡</Text>
                    <Text style={styles.emptyTitle}>No Areas Yet</Text>
                    <Text style={styles.emptyDesc}>
                        Create your first automation to get started!
                    </Text>
                    <TouchableOpacity
                        style={styles.createBtn}
                        onPress={() => navigation.navigate("Create")}
                    >
                        <Text style={styles.createBtnText}>Create Area</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <Text style={styles.headerText}>
                        {areas.length} Area{areas.length !== 1 ? "s" : ""}
                    </Text>

                    {areas.map((area) => (
                        <View key={area.id} style={styles.areaCard}>
                            <View style={styles.areaHeader}>
                                <View style={styles.areaInfo}>
                                    <Text style={styles.areaName}>
                                        {area.name || `Area #${area.id}`}
                                    </Text>
                                    <Text style={styles.areaFlow}>
                                        When: {area.actionType?.replace(/_/g, " ")}
                                    </Text>
                                    <Text style={styles.areaFlow}>
                                        Then: {area.reactionType?.replace(/_/g, " ")}
                                    </Text>
                                </View>
                                <Switch
                                    value={area.enabled}
                                    onValueChange={() => handleToggle(area)}
                                    trackColor={{ false: "#d1d5db", true: "#86efac" }}
                                    thumbColor={area.enabled ? "#22c55e" : "#9ca3af"}
                                />
                            </View>

                            {/* Action/Reaction Details */}
                            <View style={styles.detailsRow}>
                                <View style={[styles.detailBox, styles.actionBox]}>
                                    <Text style={styles.detailLabel}>Action</Text>
                                    <Text style={styles.detailService}>{area.actionServiceId}</Text>
                                </View>
                                <Text style={styles.arrow}>→</Text>
                                <View style={[styles.detailBox, styles.reactionBox]}>
                                    <Text style={styles.detailLabel}>Reaction</Text>
                                    <Text style={styles.detailService}>{area.reactionServiceId}</Text>
                                </View>
                            </View>

                            {/* Delete Button */}
                            <TouchableOpacity
                                style={styles.deleteBtn}
                                onPress={() => handleDelete(area)}
                            >
                                <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </>
            )}
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
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        color: "#6b7280",
        fontSize: 16,
    },
    headerText: {
        fontSize: 14,
        color: "#6b7280",
        marginBottom: 16,
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 8,
    },
    emptyDesc: {
        fontSize: 16,
        color: "#6b7280",
        textAlign: "center",
        marginBottom: 24,
    },
    createBtn: {
        backgroundColor: "#6366f1",
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
    },
    createBtnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    areaCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    areaHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    areaInfo: {
        flex: 1,
        marginRight: 12,
    },
    areaName: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1f2937",
        marginBottom: 4,
    },
    areaFlow: {
        fontSize: 13,
        color: "#6b7280",
    },
    detailsRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    detailBox: {
        flex: 1,
        padding: 10,
        borderRadius: 8,
    },
    actionBox: {
        backgroundColor: "#eef2ff",
    },
    reactionBox: {
        backgroundColor: "#faf5ff",
    },
    arrow: {
        fontSize: 20,
        color: "#9ca3af",
        marginHorizontal: 8,
    },
    detailLabel: {
        fontSize: 11,
        color: "#6b7280",
        marginBottom: 2,
    },
    detailService: {
        fontSize: 13,
        fontWeight: "500",
        color: "#374151",
        textTransform: "capitalize",
    },
    deleteBtn: {
        alignSelf: "flex-end",
        padding: 8,
    },
    deleteBtnText: {
        color: "#dc2626",
        fontSize: 14,
    },
});
