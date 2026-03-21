import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { FaPlus, FaCog, FaPlay, FaBolt } from "react-icons/fa";

export default function AreaPage() {
  const navigate = useNavigate();

  const [userServices, setUserServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [areaName, setAreaName] = useState("");

  // AREA creation states
  const [selectedActionService, setSelectedActionService] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [actionConfig, setActionConfig] = useState({});

  const [selectedReactionService, setSelectedReactionService] = useState(null);
  const [selectedReaction, setSelectedReaction] = useState(null);
  const [reactionConfig, setReactionConfig] = useState({});

  useEffect(() => {
    fetchUserServices();
  }, []);

  const fetchUserServices = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/user/services");
      setUserServices(res.data);
    } catch (err) {
      console.error("Error fetching user services:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArea = async () => {
    if (!selectedActionService || !selectedAction || !selectedReactionService || !selectedReaction || !areaName) {
      alert("Please complete all fields.");
      return;
    }

    // Validate configurations based on action/reaction type
    if (selectedAction.name === "time_at" && !actionConfig.time) {
      alert("Please specify a time for the timer action");
      return;
    }

    if (selectedReaction.name === "send_email") {
      if (!reactionConfig.to || !reactionConfig.subject || !reactionConfig.body) {
        alert("Please complete all email fields (to, subject, body)");
        return;
      }
    }

    try {
      await api.post("/areas", {
        name: areaName,
        actionServiceId: selectedActionService.name,
        actionType: selectedAction.name,
        actionConfig,
        reactionServiceId: selectedReactionService.name,
        reactionType: selectedReaction.name,
        reactionConfig,
        enabled: true,
      });

      // Reset state
      setAreaName("");
      setSelectedActionService(null);
      setSelectedAction(null);
      setActionConfig({});
      setSelectedReactionService(null);
      setSelectedReaction(null);
      setReactionConfig({});
      setShowCreateModal(false);

      alert("AREA created successfully!");
      navigate("/applets");
    } catch (err) {
      console.error("Failed to create AREA:", err);
      alert(err.response?.data?.message || "Failed to create AREA. Check console for details.");
    }
  };

  // Filter services by what they offer
  const actionServices = userServices.filter(s => s.actions?.length > 0);
  const reactionServices = userServices.filter(s => s.reactions?.length > 0);

  const hasRequiredServices = actionServices.length > 0 && reactionServices.length > 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-purple-50 dark:from-[#111111] dark:to-[#111111] flex items-center justify-center">
                <div className="text-xl text-gray-600 dark:text-gray-400">Loading...</div>
            </div>
        );
    }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-purple-50 dark:from-[#111111] dark:to-[#111111] px-6 py-12 transition-colors duration-200">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">Create Automation</h1>
            <p className="text-gray-600 dark:text-gray-400">Build workflows by connecting actions and reactions</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/services")}
              className="px-5 py-2 bg-white dark:bg-[#1A1A1A] dark:hover:bg-gray-800 border-2 border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 transition"
            >
              Manage Services
            </button>
            <button
              onClick={() => navigate("/applets")}
              className="px-5 py-2 bg-white dark:bg-[#1A1A1A] dark:hover:bg-gray-800 border-2 border-purple-500 dark:border-purple-400 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-50 transition flex items-center gap-2"
            >
              <FaCog /> My Applets
            </button>
          </div>
        </div>

        {/* Check if user has required services */}
        {!hasRequiredServices ? (
          <div className="bg-white dark:bg-[#1A1A1A] p-12 border border-transparent dark:border-gray-800 rounded-xl shadow text-center">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Connect Services First</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              To create an AREA, you need at least one service with <strong className="text-indigo-600 dark:text-indigo-400">actions</strong> (like Timer)
              and one service with <strong className="text-purple-600 dark:text-purple-400">reactions</strong> (like Mail).
            </p>
            <div className="flex justify-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <FaPlay className="text-indigo-500 dark:text-indigo-400" />
                <span className="text-gray-700 dark:text-gray-300">Actions: {actionServices.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaBolt className="text-purple-500 dark:text-purple-400" />
                <span className="text-gray-700 dark:text-gray-300">Reactions: {reactionServices.length}</span>
              </div>
            </div>
            <button
              onClick={() => navigate("/services")}
              className="px-8 py-3 bg-gradient-to-r from-sky-500 to-indigo-500 dark:bg-none dark:bg-[#222222] dark:border dark:border-gray-700 text-white dark:text-gray-200 rounded-lg text-lg font-semibold hover:opacity-90 dark:hover:bg-gray-800 transition"
            >
              Go to Services
            </button>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Action Services */}
              <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-xl shadow border-l-4 border-indigo-500 dark:border-indigo-400 dark:border-y dark:border-r border-y-transparent border-r-transparent dark:border-y-gray-800 dark:border-r-gray-800">
                <div className="flex items-center gap-2 mb-3">
                  <FaPlay className="text-indigo-500 dark:text-indigo-400" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Available Actions</h3>
                </div>
                <div className="space-y-2">
                  {actionServices.map(service => (
                    <div key={service.name} className="flex items-center gap-2">
                      <span className="font-medium capitalize text-gray-700 dark:text-gray-300">{service.name}:</span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        {service.actions.map(a => a.name.replace(/_/g, ' ')).join(', ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reaction Services */}
              <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-xl shadow border-l-4 border-purple-500 dark:border-purple-400 dark:border-y dark:border-r border-y-transparent border-r-transparent dark:border-y-gray-800 dark:border-r-gray-800">
                <div className="flex items-center gap-2 mb-3">
                  <FaBolt className="text-purple-500 dark:text-purple-400" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Available Reactions</h3>
                </div>
                <div className="space-y-2">
                  {reactionServices.map(service => (
                    <div key={service.name} className="flex items-center gap-2">
                      <span className="font-medium capitalize text-gray-700 dark:text-gray-300">{service.name}:</span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        {service.reactions.map(r => r.name.replace(/_/g, ' ')).join(', ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Create Button */}
            <div className="text-center">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 dark:bg-none dark:bg-[#222222] dark:border dark:border-gray-700 text-white dark:text-gray-200 rounded-xl text-xl font-semibold hover:opacity-90 dark:hover:bg-gray-800 transition flex items-center gap-3 mx-auto"
              >
                <FaPlus /> Create New AREA
              </button>
            </div>
          </>
        )}

        {/* Create AREA Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center overflow-auto z-50 p-4">
            <div className="bg-white dark:bg-[#1A1A1A] dark:border dark:border-gray-800 p-6 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto text-gray-900 dark:text-gray-100">
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Create New AREA</h3>

              <label className="block mb-4">
                <span className="font-semibold text-gray-700 dark:text-gray-300">AREA Name</span>
                <input
                  type="text"
                  value={areaName}
                  onChange={(e) => setAreaName(e.target.value)}
                  placeholder="e.g., Daily Email Reminder"
                  className="mt-1 w-full p-3 border border-gray-300 dark:border-gray-700 dark:bg-[#111111] dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Action Column */}
                <div className="border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 pb-6 md:pb-0 md:pr-4">
                  <h4 className="font-bold text-lg mb-3 text-indigo-600 flex items-center gap-2">
                    <FaPlay /> IF (Action)
                  </h4>

                  <label className="block mb-3">
                    <span className="font-semibold text-sm dark:text-gray-300">Service</span>
                    <select
                      className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111111] text-gray-900 dark:text-gray-100 rounded-lg capitalize"
                      value={selectedActionService?.name || ""}
                      onChange={e => {
                        const svc = actionServices.find(s => s.name === e.target.value);
                        setSelectedActionService(svc);
                        setSelectedAction(null);
                        setActionConfig({});
                      }}
                    >
                      <option value="">Select service...</option>
                      {actionServices.map(s => (
                        <option key={s.name} value={s.name} className="capitalize">
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  {selectedActionService && (
                    <>
                      <label className="block mb-3">
                        <span className="font-semibold text-sm dark:text-gray-300">Action</span>
                        <select
                          className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111111] text-gray-900 dark:text-gray-100 rounded-lg"
                          value={selectedAction?.name || ""}
                          onChange={e => {
                            const action = selectedActionService.actions.find(a => a.name === e.target.value);
                            setSelectedAction(action);
                            setActionConfig({});
                          }}
                        >
                          <option value="">Select action...</option>
                          {selectedActionService.actions.map(a => (
                            <option key={a.name} value={a.name}>
                              {a.name.replace(/_/g, ' ')}
                            </option>
                          ))}
                        </select>
                        {selectedAction?.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{selectedAction.description}</p>
                        )}
                      </label>

                      {/* Timer Action Configuration */}
                      {selectedAction?.name === "time_at" && (
                        <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg border border-indigo-200 dark:border-indigo-500/30">
                          <p className="text-sm font-semibold mb-2 text-indigo-700 dark:text-indigo-400">Configure Time</p>
                          <label className="block">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Time (HH:mm)</span>
                            <input
                              type="time"
                              value={actionConfig.time || ""}
                              onChange={(e) => setActionConfig({ ...actionConfig, time: e.target.value })}
                              className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111111] text-gray-900 dark:text-gray-100 rounded"
                            />
                          </label>
                        </div>
                      )}

                      {/* GitHub Action Configuration (new_push, new_issue) */}
                      {(selectedAction?.name === "new_push" || selectedAction?.name === "new_issue") && (
                        <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg border border-indigo-200 dark:border-indigo-500/30 space-y-2">
                          <p className="text-sm font-semibold mb-2 text-indigo-700 dark:text-indigo-400">Configure Repository</p>
                          <label className="block">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Repository Owner</span>
                            <input
                              type="text"
                              value={actionConfig.owner || ""}
                              onChange={(e) => setActionConfig({ ...actionConfig, owner: e.target.value })}
                              placeholder="e.g., octocat"
                              className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111111] text-gray-900 dark:text-gray-100 rounded text-sm"
                            />
                          </label>
                          <label className="block">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Repository Name</span>
                            <input
                              type="text"
                              value={actionConfig.repo || ""}
                              onChange={(e) => setActionConfig({ ...actionConfig, repo: e.target.value })}
                              placeholder="e.g., hello-world"
                              className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111111] text-gray-900 dark:text-gray-100 rounded text-sm"
                            />
                          </label>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Reaction Column */}
                <div className="md:pl-4">
                  <h4 className="font-bold text-lg mb-3 text-purple-600 dark:text-purple-400 flex items-center gap-2">
                    <FaBolt /> THEN (Reaction)
                  </h4>

                  <label className="block mb-3">
                    <span className="font-semibold text-sm dark:text-gray-300">Service</span>
                    <select
                      className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111111] text-gray-900 dark:text-gray-100 rounded-lg capitalize"
                      value={selectedReactionService?.name || ""}
                      onChange={e => {
                        const svc = reactionServices.find(s => s.name === e.target.value);
                        setSelectedReactionService(svc);
                        setSelectedReaction(null);
                        setReactionConfig({});
                      }}
                    >
                      <option value="">Select service...</option>
                      {reactionServices.map(s => (
                        <option key={s.name} value={s.name} className="capitalize">
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  {selectedReactionService && (
                    <>
                      <label className="block mb-3">
                        <span className="font-semibold text-sm dark:text-gray-300">Reaction</span>
                        <select
                          className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111111] text-gray-900 dark:text-gray-100 rounded-lg"
                          value={selectedReaction?.name || ""}
                          onChange={e => {
                            const reaction = selectedReactionService.reactions.find(r => r.name === e.target.value);
                            setSelectedReaction(reaction);
                            setReactionConfig({});
                          }}
                        >
                          <option value="">Select reaction...</option>
                          {selectedReactionService.reactions.map(r => (
                            <option key={r.name} value={r.name}>
                              {r.name.replace(/_/g, ' ')}
                            </option>
                          ))}
                        </select>
                        {selectedReaction?.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{selectedReaction.description}</p>
                        )}
                      </label>

                      {/* Email Reaction Configuration */}
                      {selectedReaction?.name === "send_email" && (
                        <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-500/30 space-y-2">
                          <p className="text-sm font-semibold mb-2 text-purple-700 dark:text-purple-400">Configure Email</p>
                          <label className="block">
                            <span className="text-xs text-gray-600 dark:text-gray-400">To</span>
                            <input
                              type="email"
                              value={reactionConfig.to || ""}
                              onChange={(e) => setReactionConfig({ ...reactionConfig, to: e.target.value })}
                              placeholder="recipient@example.com"
                              className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111111] text-gray-900 dark:text-gray-100 rounded text-sm"
                            />
                          </label>
                          <label className="block">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Subject</span>
                            <input
                              type="text"
                              value={reactionConfig.subject || ""}
                              onChange={(e) => setReactionConfig({ ...reactionConfig, subject: e.target.value })}
                              placeholder="Email subject"
                              className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111111] text-gray-900 dark:text-gray-100 rounded text-sm"
                            />
                          </label>
                          <label className="block">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Body</span>
                            <textarea
                              value={reactionConfig.body || ""}
                              onChange={(e) => setReactionConfig({ ...reactionConfig, body: e.target.value })}
                              placeholder="Email body"
                              rows={3}
                              className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111111] text-gray-900 dark:text-gray-100 rounded text-sm"
                            />
                          </label>
                        </div>
                      )}

                      {/* GitHub Create Issue Reaction Configuration */}
                      {selectedReaction?.name === "create_issue" && (
                        <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-500/30 space-y-2">
                          <p className="text-sm font-semibold mb-2 text-purple-700 dark:text-purple-400">Create Issue</p>
                          <label className="block">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Repository Owner</span>
                            <input
                              type="text"
                              value={reactionConfig.owner || ""}
                              onChange={(e) => setReactionConfig({ ...reactionConfig, owner: e.target.value })}
                              placeholder="e.g., octocat"
                              className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111111] text-gray-900 dark:text-gray-100 rounded text-sm"
                            />
                          </label>
                          <label className="block">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Repository Name</span>
                            <input
                              type="text"
                              value={reactionConfig.repo || ""}
                              onChange={(e) => setReactionConfig({ ...reactionConfig, repo: e.target.value })}
                              placeholder="e.g., hello-world"
                              className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111111] text-gray-900 dark:text-gray-100 rounded text-sm"
                            />
                          </label>
                          <label className="block">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Issue Title</span>
                            <input
                              type="text"
                              value={reactionConfig.title || ""}
                              onChange={(e) => setReactionConfig({ ...reactionConfig, title: e.target.value })}
                              placeholder="Issue title"
                              className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111111] text-gray-900 dark:text-gray-100 rounded text-sm"
                            />
                          </label>
                          <label className="block">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Issue Body</span>
                            <textarea
                              value={reactionConfig.body || ""}
                              onChange={(e) => setReactionConfig({ ...reactionConfig, body: e.target.value })}
                              placeholder="Issue description..."
                              rows={3}
                              className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111111] text-gray-900 dark:text-gray-100 rounded text-sm"
                            />
                          </label>
                        </div>
                      )}

                      {/* GitHub Create Comment Reaction Configuration */}
                      {selectedReaction?.name === "create_comment" && (
                        <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-500/30 space-y-2">
                          <p className="text-sm font-semibold mb-2 text-purple-700 dark:text-purple-400">Add Comment to Issue</p>
                          <label className="block">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Repository Owner</span>
                            <input
                              type="text"
                              value={reactionConfig.owner || ""}
                              onChange={(e) => setReactionConfig({ ...reactionConfig, owner: e.target.value })}
                              placeholder="e.g., octocat"
                              className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111111] text-gray-900 dark:text-gray-100 rounded text-sm"
                            />
                          </label>
                          <label className="block">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Repository Name</span>
                            <input
                              type="text"
                              value={reactionConfig.repo || ""}
                              onChange={(e) => setReactionConfig({ ...reactionConfig, repo: e.target.value })}
                              placeholder="e.g., hello-world"
                              className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111111] text-gray-900 dark:text-gray-100 rounded text-sm"
                            />
                          </label>
                          <label className="block">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Issue Number</span>
                            <input
                              type="number"
                              value={reactionConfig.issue_number || ""}
                              onChange={(e) => setReactionConfig({ ...reactionConfig, issue_number: e.target.value })}
                              placeholder="e.g., 1"
                              className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111111] text-gray-900 dark:text-gray-100 rounded text-sm"
                            />
                          </label>
                          <label className="block">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Comment</span>
                            <textarea
                              value={reactionConfig.body || ""}
                              onChange={(e) => setReactionConfig({ ...reactionConfig, body: e.target.value })}
                              placeholder="Your comment..."
                              rows={3}
                              className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111111] text-gray-900 dark:text-gray-100 rounded text-sm"
                            />
                          </label>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t dark:border-gray-800">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setAreaName("");
                    setSelectedActionService(null);
                    setSelectedAction(null);
                    setActionConfig({});
                    setSelectedReactionService(null);
                    setSelectedReaction(null);
                    setReactionConfig({});
                  }}
                  className="px-5 py-2 bg-gray-200 dark:bg-[#222222] dark:hover:bg-gray-800 dark:border dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateArea}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 dark:bg-none dark:bg-[#222222] dark:border dark:border-gray-700 text-white dark:text-gray-200 rounded-lg hover:opacity-90 dark:hover:bg-gray-800 transition"
                >
                  Create AREA
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

