import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    TextInput,
    Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api, { getAllServices, getUserServices, createArea } from "../api/api";

export default function CreateAreaScreen({ navigation }) {
    const [services, setServices] = useState([]);
    const [userServices, setUserServices] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [name, setName] = useState("");
    const [selectedAction, setSelectedAction] = useState(null);
    const [selectedReaction, setSelectedReaction] = useState(null);
    const [actionConfig, setActionConfig] = useState({});
    const [reactionConfig, setReactionConfig] = useState({});
    const [step, setStep] = useState(1); // 1: Action, 2: Reaction, 3: Config

    useFocusEffect(
        useCallback(() => {
            loadServices();
        }, [])
    );

    const loadServices = async () => {
        try {
            const [all, connected] = await Promise.all([
                getAllServices().catch(() => []),
                getUserServices().catch(() => []),
            ]);
            setServices(all || []);
            setUserServices(connected || []);
        } catch (error) {
            console.error("Error loading services:", error);
        } finally {
            setLoading(false);
        }
    };

    const getConnectedServices = () => {
        const connectedNames = userServices.map((s) => s.name);
        return services.filter((s) => connectedNames.includes(s.name));
    };

    const getActionsForServices = () => {
        const connected = getConnectedServices();
        const actions = [];
        connected.forEach((service) => {
            (service.actions || []).forEach((action) => {
                actions.push({
                    ...action,
                    serviceName: service.name,
                    serviceId: service.name.toLowerCase(),
                });
            });
        });
        return actions;
    };

    const getReactionsForServices = () => {
        const connected = getConnectedServices();
        const reactions = [];
        connected.forEach((service) => {
            (service.reactions || []).forEach((reaction) => {
                reactions.push({
                    ...reaction,
                    serviceName: service.name,
                    serviceId: service.name.toLowerCase(),
                });
            });
        });
        return reactions;
    };

    const handleCreate = async () => {
        if (!name.trim()) {
            Alert.alert("Error", "Please enter a name for your area");
            return;
        }
        if (!selectedAction || !selectedReaction) {
            Alert.alert("Error", "Please select an action and reaction");
            return;
        }

        try {
            await createArea({
                name: name.trim(),
                actionServiceId: selectedAction.serviceId,
                actionType: selectedAction.name,
                actionConfig: actionConfig,
                reactionServiceId: selectedReaction.serviceId,
                reactionType: selectedReaction.name,
                reactionConfig: reactionConfig,
                enabled: true,
            });
            Alert.alert("Success", "Area created!", [
                { text: "OK", onPress: () => navigation.navigate("Areas") },
            ]);
        } catch (error) {
            console.error("Error creating area:", error);
            Alert.alert("Error", "Failed to create area");
        }
    };

    const actions = getActionsForServices();
    const reactions = getReactionsForServices();

    if (loading) {
        return (
            <View style={styles.centered}>
                <Text>Loading...</Text>
            </View>
        );
    }

    if (userServices.length < 1) {
        return (
            <View style={styles.centered}>
                <Text style={styles.emptyIcon}>🔌</Text>
                <Text style={styles.emptyTitle}>Connect Services First</Text>
                <Text style={styles.emptyDesc}>
                    You need to connect at least one service to create an area.
                </Text>
                <TouchableOpacity
                    style={styles.connectBtn}
                    onPress={() => navigation.navigate("Services")}
                >
                    <Text style={styles.connectBtnText}>Go to Services</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Progress */}
            <View style={styles.progressRow}>
                <View style={[styles.progressStep, step >= 1 && styles.activeStep]}>
                    <Text style={styles.stepText}>1. Action</Text>
                </View>
                <View style={[styles.progressStep, step >= 2 && styles.activeStep]}>
                    <Text style={styles.stepText}>2. Reaction</Text>
                </View>
                <View style={[styles.progressStep, step >= 3 && styles.activeStep]}>
                    <Text style={styles.stepText}>3. Create</Text>
                </View>
            </View>

            {/* Step 1: Select Action */}
            {step === 1 && (
                <View>
                    <Text style={styles.sectionTitle}>Select an Action (Trigger)</Text>
                    {actions.length === 0 ? (
                        <Text style={styles.noItems}>No actions available. Connect more services.</Text>
                    ) : (
                        actions.map((action, idx) => (
                            <TouchableOpacity
                                key={idx}
                                style={[
                                    styles.itemCard,
                                    selectedAction?.name === action.name && styles.selectedCard,
                                ]}
                                onPress={() => {
                                    setSelectedAction(action);
                                    setStep(2);
                                }}
                            >
                                <Text style={styles.itemService}>{action.serviceName}</Text>
                                <Text style={styles.itemName}>{action.name.replace(/_/g, " ")}</Text>
                                <Text style={styles.itemDesc}>{action.description}</Text>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            )}

            {/* Step 2: Select Reaction */}
            {step === 2 && (
                <View>
                    <TouchableOpacity onPress={() => setStep(1)}>
                        <Text style={styles.backBtn}>← Back to Actions</Text>
                    </TouchableOpacity>

                    <Text style={styles.selectedInfo}>
                        Action: {selectedAction?.serviceName} - {selectedAction?.name.replace(/_/g, " ")}
                    </Text>

                    <Text style={styles.sectionTitle}>Select a Reaction</Text>
                    {reactions.length === 0 ? (
                        <Text style={styles.noItems}>No reactions available. Connect more services.</Text>
                    ) : (
                        reactions.map((reaction, idx) => (
                            <TouchableOpacity
                                key={idx}
                                style={[
                                    styles.itemCard,
                                    selectedReaction?.name === reaction.name && styles.selectedCard,
                                ]}
                                onPress={() => {
                                    setSelectedReaction(reaction);
                                    setStep(3);
                                }}
                            >
                                <Text style={styles.itemService}>{reaction.serviceName}</Text>
                                <Text style={styles.itemName}>{reaction.name.replace(/_/g, " ")}</Text>
                                <Text style={styles.itemDesc}>{reaction.description}</Text>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            )}

            {/* Step 3: Configure & Create */}
            {step === 3 && (
                <View>
                    <TouchableOpacity onPress={() => setStep(2)}>
                        <Text style={styles.backBtn}>← Back to Reactions</Text>
                    </TouchableOpacity>

                    <Text style={styles.sectionTitle}>Configure Your Area</Text>

                    {/* Selected Summary */}
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Action:</Text>
                            <Text style={styles.summaryValue}>
                                {selectedAction?.serviceName} - {selectedAction?.name.replace(/_/g, " ")}
                            </Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Reaction:</Text>
                            <Text style={styles.summaryValue}>
                                {selectedReaction?.serviceName} - {selectedReaction?.name.replace(/_/g, " ")}
                            </Text>
                        </View>
                    </View>

                    {/* Name Input */}
                    <Text style={styles.inputLabel}>Area Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="My Automation"
                        value={name}
                        onChangeText={setName}
                    />

                    {/* Action Config */}
                    {selectedAction?.name === "new_push" && (
                        <>
                            <Text style={styles.inputLabel}>Repository (owner/repo)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="username/repo-name"
                                value={actionConfig.repository || ""}
                                onChangeText={(val) =>
                                    setActionConfig({ ...actionConfig, repository: val })
                                }
                            />
                        </>
                    )}

                    {selectedAction?.name === "time_at" && (
                        <>
                            <Text style={styles.inputLabel}>Time (HH:MM)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="09:00"
                                value={actionConfig.time || ""}
                                onChangeText={(val) =>
                                    setActionConfig({ ...actionConfig, time: val })
                                }
                            />
                        </>
                    )}

                    {/* Reaction Config */}
                    {selectedReaction?.name === "send_email" && (
                        <>
                            <Text style={styles.inputLabel}>Email To</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="recipient@example.com"
                                value={reactionConfig.to || ""}
                                onChangeText={(val) =>
                                    setReactionConfig({ ...reactionConfig, to: val })
                                }
                            />
                            <Text style={styles.inputLabel}>Subject</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Notification"
                                value={reactionConfig.subject || ""}
                                onChangeText={(val) =>
                                    setReactionConfig({ ...reactionConfig, subject: val })
                                }
                            />
                            <Text style={styles.inputLabel}>Body</Text>
                            <TextInput
                                style={[styles.input, { height: 80 }]}
                                placeholder="Email content..."
                                value={reactionConfig.body || ""}
                                onChangeText={(val) =>
                                    setReactionConfig({ ...reactionConfig, body: val })
                                }
                                multiline
                            />
                        </>
                    )}

                    {selectedReaction?.name === "create_issue" && (
                        <>
                            <Text style={styles.inputLabel}>Repository (owner/repo)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="username/repo-name"
                                value={reactionConfig.repository || ""}
                                onChangeText={(val) =>
                                    setReactionConfig({ ...reactionConfig, repository: val })
                                }
                            />
                            <Text style={styles.inputLabel}>Issue Title</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="New Issue"
                                value={reactionConfig.title || ""}
                                onChangeText={(val) =>
                                    setReactionConfig({ ...reactionConfig, title: val })
                                }
                            />
                            <Text style={styles.inputLabel}>Issue Body</Text>
                            <TextInput
                                style={[styles.input, { height: 80 }]}
                                placeholder="Issue description..."
                                value={reactionConfig.body || ""}
                                onChangeText={(val) =>
                                    setReactionConfig({ ...reactionConfig, body: val })
                                }
                                multiline
                            />
                        </>
                    )}

                    {/* Create Button */}
                    <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
                        <Text style={styles.createBtnText}>Create Area</Text>
                    </TouchableOpacity>
                </View>
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
        padding: 32,
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
    connectBtn: {
        backgroundColor: "#6366f1",
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
    },
    connectBtnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    progressRow: {
        flexDirection: "row",
        marginBottom: 24,
    },
    progressStep: {
        flex: 1,
        padding: 8,
        backgroundColor: "#e5e7eb",
        marginHorizontal: 2,
        borderRadius: 8,
        alignItems: "center",
    },
    activeStep: {
        backgroundColor: "#6366f1",
    },
    stepText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "500",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1f2937",
        marginBottom: 12,
    },
    noItems: {
        color: "#6b7280",
        fontStyle: "italic",
    },
    itemCard: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: "#e5e7eb",
    },
    selectedCard: {
        borderColor: "#6366f1",
        backgroundColor: "#eef2ff",
    },
    itemService: {
        fontSize: 12,
        color: "#6366f1",
        fontWeight: "500",
        marginBottom: 4,
        textTransform: "uppercase",
    },
    itemName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1f2937",
        textTransform: "capitalize",
    },
    itemDesc: {
        fontSize: 13,
        color: "#6b7280",
        marginTop: 4,
    },
    backBtn: {
        color: "#6366f1",
        fontSize: 16,
        marginBottom: 16,
    },
    selectedInfo: {
        backgroundColor: "#eef2ff",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        color: "#4f46e5",
        fontWeight: "500",
    },
    summaryCard: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    summaryRow: {
        flexDirection: "row",
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: "#6b7280",
        width: 70,
    },
    summaryValue: {
        fontSize: 14,
        color: "#1f2937",
        fontWeight: "500",
        flex: 1,
    },
    inputLabel: {
        fontSize: 14,
        color: "#374151",
        marginBottom: 6,
        marginTop: 12,
    },
    input: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    createBtn: {
        backgroundColor: "#6366f1",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 24,
        marginBottom: 32,
    },
    createBtnText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
});
