import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { FaPlug, FaPlay, FaBolt, FaCheck, FaTimes } from "react-icons/fa";

export default function ServicesPage() {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [userServices, setUserServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(null);

    // Check if user is logged in
    const token = localStorage.getItem("userToken");

    useEffect(() => {
        if (!token) {
            navigate("/auth");
            return;
        }
        fetchData();
    }, [token, navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch all available services
            const servicesRes = await api.get("/services");
            setServices(servicesRes.data);

            // Fetch user's connected services
            const userServicesRes = await api.get("/api/user/services");
            setUserServices(userServicesRes.data);
        } catch (err) {
            console.error("Error fetching services:", err);
        } finally {
            setLoading(false);
        }
    };

    const isConnected = (serviceName) => {
        return userServices.some((s) => s.name === serviceName);
    };

    const handleConnect = async (service) => {
        if (service.requiresOAuth) {
            // For GitHub, use the special linking endpoint that stores user email in session
            // This ensures GitHub gets linked to the current logged-in user
            if (service.name.toLowerCase() === "github") {
                window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/user/services/connect/github`;
            } else {
                window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/oauth2/authorization/${service.name.toLowerCase()}`;
            }
            return;
        }

        setConnecting(service.name);
        try {
            await api.post("/api/user/services", { serviceName: service.name });
            await fetchData();
        } catch (err) {
            console.error("Failed to connect service:", err);
            alert("Failed to connect service");
        } finally {
            setConnecting(null);
        }
    };

    const handleDisconnect = async (serviceName) => {
        if (!confirm(`Disconnect ${serviceName}?`)) return;

        try {
            await api.delete(`/api/user/services/${serviceName}`);
            await fetchData();
        } catch (err) {
            console.error("Failed to disconnect service:", err);
            alert("Failed to disconnect service");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-purple-50 dark:from-[#111111] dark:to-[#111111] flex items-center justify-center">
                <div className="text-xl text-gray-600 dark:text-gray-400">Loading services...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-purple-50 dark:from-[#111111] dark:to-[#111111] px-6 py-12 transition-colors duration-200">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">Services</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Connect services to unlock their <span className="text-indigo-600 dark:text-indigo-400 font-semibold">actions</span> and <span className="text-purple-600 dark:text-purple-400 font-semibold">reactions</span>
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/area")}
                        className="px-5 py-2 bg-gradient-to-r from-sky-500 to-indigo-500 text-white rounded-lg hover:opacity-90 transition"
                    >
                        Create AREA →
                    </button>
                </div>

                {/* Legend */}
                <div className="flex gap-6 mb-8 bg-white dark:bg-[#1A1A1A] p-4 rounded-lg shadow border border-transparent dark:border-gray-800">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-indigo-500 dark:bg-indigo-400 rounded-full"></div>
                        <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Actions (Triggers)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 dark:bg-purple-400 rounded-full"></div>
                        <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Reactions (Responses)</span>
                    </div>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => {
                        const connected = isConnected(service.name);
                        const actions = service.actions || [];
                        const reactions = service.reactions || [];

                        return (
                            <div
                                key={service.name}
                                className={`relative bg-white dark:bg-[#1A1A1A] rounded-xl p-6 shadow border-2 dark:border transition-all hover:shadow-lg ${connected
                                    ? "border-green-400 dark:border-green-500/50"
                                    : "border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-500/50"
                                    }`}
                            >
                                {/* Connected Badge */}
                                {connected && (
                                    <div className="absolute -top-3 -right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow">
                                        <FaCheck className="text-xs" /> Connected
                                    </div>
                                )}

                                {/* Service Header */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow">
                                        <FaPlug className="text-white text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 capitalize">
                                            {service.name}
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">{service.description}</p>
                                    </div>
                                </div>

                                {/* Actions Section */}
                                {actions.length > 0 && (
                                    <div className="mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FaPlay className="text-indigo-500 dark:text-indigo-400 text-sm" />
                                            <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                                                Actions ({actions.length})
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {actions.map((action) => (
                                                <div
                                                    key={action.name}
                                                    className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-500/30 rounded-lg px-3 py-2"
                                                >
                                                    <p className="text-gray-800 dark:text-indigo-300 font-medium text-sm">
                                                        {action.name.replace(/_/g, " ")}
                                                    </p>
                                                    <p className="text-gray-500 dark:text-indigo-400 text-xs opacity-80">{action.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Reactions Section */}
                                {reactions.length > 0 && (
                                    <div className="mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FaBolt className="text-purple-500 dark:text-purple-400 text-sm" />
                                            <span className="text-purple-600 dark:text-purple-400 font-semibold text-sm">
                                                Reactions ({reactions.length})
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {reactions.map((reaction) => (
                                                <div
                                                    key={reaction.name}
                                                    className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-500/30 rounded-lg px-3 py-2"
                                                >
                                                    <p className="text-gray-800 dark:text-purple-300 font-medium text-sm">
                                                        {reaction.name.replace(/_/g, " ")}
                                                    </p>
                                                    <p className="text-gray-500 dark:text-purple-400 text-xs opacity-80">{reaction.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* No actions/reactions message */}
                                {actions.length === 0 && reactions.length === 0 && (
                                    <p className="text-gray-500 text-sm italic mb-4">
                                        No actions or reactions available
                                    </p>
                                )}

                                {/* Connect/Disconnect Button */}
                                <div className="mt-4 pt-4 border-t dark:border-gray-800">
                                    {connected ? (
                                        <button
                                            onClick={() => handleDisconnect(service.name)}
                                            className="w-full py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/50 text-red-600 dark:text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition flex items-center justify-center gap-2 font-medium"
                                        >
                                            <FaTimes /> Disconnect
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleConnect(service)}
                                            disabled={connecting === service.name}
                                            className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 dark:bg-none dark:bg-[#222222] dark:border dark:border-gray-700 dark:hover:bg-gray-800 text-white dark:text-gray-200 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                                        >
                                            {connecting === service.name ? (
                                                "Connecting..."
                                            ) : (
                                                <>
                                                    <FaPlug /> Connect Service
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Summary */}
                <div className="mt-10 bg-white dark:bg-[#1A1A1A] dark:border dark:border-gray-800 p-6 rounded-xl shadow text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        You have <strong className="text-green-600 dark:text-green-500">{userServices.length}</strong> service(s) connected
                    </p>
                    {userServices.length >= 2 && (
                        <button
                            onClick={() => navigate("/area")}
                            className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 dark:bg-none dark:bg-[#222222] dark:border dark:border-gray-700 dark:hover:bg-gray-800 text-white dark:text-gray-200 rounded-lg text-lg font-semibold hover:opacity-90 transition"
                        >
                            Create an AREA →
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
