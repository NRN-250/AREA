import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { FaArrowLeft, FaToggleOn, FaToggleOff, FaTrash, FaPlus, FaEdit } from "react-icons/fa";

export default function AppletsPage() {
  const navigate = useNavigate();
  
  const [applets, setApplets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplet, setSelectedApplet] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchApplets();
  }, []);

  const fetchApplets = async () => {
    setLoading(true);
    try {
      const res = await api.get("/areas");
      setApplets(res.data);
    } catch (err) {
      console.error("Error fetching applets:", err);
      alert("Failed to load applets");
    } finally {
      setLoading(false);
    }
  };

  const toggleApplet = async (applet) => {
    try {
      await api.put(`/areas/${applet.id}`, {
        ...applet,
        enabled: !applet.enabled,
      });
      
      setApplets(applets.map(a => 
        a.id === applet.id ? { ...a, enabled: !a.enabled } : a
      ));
    } catch (err) {
      console.error("Failed to toggle applet:", err);
      alert("Failed to toggle applet status");
    }
  };

  const handleDeleteClick = (applet) => {
    setSelectedApplet(applet);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedApplet) return;

    try {
      await api.delete(`/areas/${selectedApplet.id}`);
      setApplets(applets.filter(a => a.id !== selectedApplet.id));
      setShowDeleteModal(false);
      setSelectedApplet(null);
    } catch (err) {
      console.error("Failed to delete applet:", err);
      alert("Failed to delete applet");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading applets...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-purple-50 px-6 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <button
              onClick={() => navigate("/area")}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-3 transition"
            >
              <FaArrowLeft /> Back to Dashboard
            </button>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">My Applets</h1>
            <p className="text-gray-600">Manage your automation workflows</p>
          </div>
          <button
            onClick={() => navigate("/area")}
            className="px-5 py-2 bg-gradient-to-r from-sky-500 to-indigo-500 text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
          >
            <FaPlus /> Create New AREA
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <p className="text-gray-600 text-sm mb-1">Total Applets</p>
            <p className="text-3xl font-bold text-gray-800">{applets.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <p className="text-gray-600 text-sm mb-1">Active</p>
            <p className="text-3xl font-bold text-green-600">
              {applets.filter(a => a.enabled).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <p className="text-gray-600 text-sm mb-1">Inactive</p>
            <p className="text-3xl font-bold text-gray-400">
              {applets.filter(a => !a.enabled).length}
            </p>
          </div>
        </div>

        {/* Applets List */}
        {applets.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <p className="text-gray-600 mb-4">You haven't created any applets yet</p>
            <button
              onClick={() => navigate("/area")}
              className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
            >
              Create Your First AREA
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {applets.map((applet) => (
              <div
                key={applet.id}
                className={`bg-white p-6 rounded-lg shadow border-2 transition hover:shadow-md ${
                  applet.enabled ? 'border-green-200' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-800">{applet.name}</h3>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          applet.enabled
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {applet.enabled ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Action and Reaction Display */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-1 bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                        <p className="text-xs font-semibold text-indigo-600 mb-1">IF</p>
                        <p className="font-semibold text-gray-800">
                          {applet.actionServiceId || applet.actionService?.name || 'Unknown Service'}
                        </p>
                        <p className="text-sm text-gray-600">{applet.actionType}</p>
                        {applet.actionConfig && Object.keys(applet.actionConfig).length > 0 && (
                          <div className="mt-2 text-xs text-gray-500">
                            <details>
                              <summary className="cursor-pointer hover:text-gray-700">
                                View config
                              </summary>
                              <pre className="mt-1 bg-white p-2 rounded text-xs overflow-auto">
                                {JSON.stringify(applet.actionConfig, null, 2)}
                              </pre>
                            </details>
                          </div>
                        )}
                      </div>

                      <div className="text-2xl text-gray-400">→</div>

                      <div className="flex-1 bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <p className="text-xs font-semibold text-purple-600 mb-1">THEN</p>
                        <p className="font-semibold text-gray-800">
                          {applet.reactionServiceId || applet.reactionService?.name || 'Unknown Service'}
                        </p>
                        <p className="text-sm text-gray-600">{applet.reactionType}</p>
                        {applet.reactionConfig && Object.keys(applet.reactionConfig).length > 0 && (
                          <div className="mt-2 text-xs text-gray-500">
                            <details>
                              <summary className="cursor-pointer hover:text-gray-700">
                                View config
                              </summary>
                              <pre className="mt-1 bg-white p-2 rounded text-xs overflow-auto">
                                {JSON.stringify(applet.reactionConfig, null, 2)}
                              </pre>
                            </details>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex gap-4 text-xs text-gray-500">
                      {applet.createdAt && (
                        <span>Created: {new Date(applet.createdAt).toLocaleDateString()}</span>
                      )}
                      {applet.lastTriggered && (
                        <span>Last triggered: {new Date(applet.lastTriggered).toLocaleString()}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => toggleApplet(applet)}
                      className={`p-2 rounded-lg transition ${
                        applet.enabled
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={applet.enabled ? 'Disable' : 'Enable'}
                    >
                      {applet.enabled ? <FaToggleOn size={24} /> : <FaToggleOff size={24} />}
                    </button>
                    <button
                      onClick={() => handleDeleteClick(applet)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                      title="Delete"
                    >
                      <FaTrash size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedApplet && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4">Delete Applet</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "<strong>{selectedApplet.name}</strong>"? 
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedApplet(null);
                  }}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
