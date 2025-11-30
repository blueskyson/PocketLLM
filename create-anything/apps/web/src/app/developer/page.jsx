import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy, Eye, EyeOff, Trash2, Plus, Send, Terminal } from "lucide-react";

export default function ApiKeysPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [visibleKeys, setVisibleKeys] = useState(new Set());
  const [playgroundMessage, setPlaygroundMessage] = useState("");
  const [selectedKey, setSelectedKey] = useState("");
  const [playgroundResponse, setPlaygroundResponse] = useState("");
  const [playgroundLoading, setPlaygroundLoading] = useState(false);
  const [copiedText, setCopiedText] = useState("");

  const queryClient = useQueryClient();

  // --- 🟦 Placeholder API: 模擬資料 ---
  const mockKeys = [
    {
      id: 1,
      key_name: "Demo Key 1",
      api_key: "pk_demo_1234567890abcdef",
      created_at: new Date().toISOString(),
      last_used_at: new Date().toISOString(),
    },
    {
      id: 2,
      key_name: "Test Key 2",
      api_key: "pk_demo_abcdef1234567890",
      created_at: new Date().toISOString(),
      last_used_at: null,
    },
  ];

  // Fetch API keys (placeholder)
  const {
    data: keysData,
    loading: keysLoading,
    error: keysError,
  } = useQuery({
    queryKey: ["api-keys"],
    queryFn: async () => {
      // 模擬 delay
      await new Promise((r) => setTimeout(r, 500));
      return { keys: mockKeys };
    },
    enabled: false,
  });

  // Create new API key (placeholder)
  const createKeyMutation = useMutation({
    mutationFn: async (name) => {
      await new Promise((r) => setTimeout(r, 500));
      return {
        id: Date.now(),
        key_name: name,
        api_key: "pk_created_" + Math.random().toString(36).slice(2),
        created_at: new Date().toISOString(),
        last_used_at: null,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["api-keys"]);
      setShowCreateForm(false);
      setNewKeyName("");
    },
  });

  // Revoke key (placeholder)
  const revokeKeyMutation = useMutation({
    mutationFn: async (keyId) => {
      await new Promise((r) => setTimeout(r, 300));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["api-keys"]);
    },
  });

  const keys = keysData?.keys || [];

  // Auto-select first key for playground
  useEffect(() => {
    if (keys.length > 0 && !selectedKey) {
      setSelectedKey(keys[0].api_key);
    }
  }, [keys, selectedKey]);

  const toggleKeyVisibility = (keyId) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) newVisible.delete(keyId);
    else newVisible.add(keyId);
    setVisibleKeys(newVisible);
  };

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(""), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // --- 🟦 Playground 呼叫 placeholder ---
  const testPlayground = async () => {
    if (!selectedKey || !playgroundMessage.trim()) return;

    setPlaygroundLoading(true);
    setPlaygroundResponse("");

    await new Promise((r) => setTimeout(r, 600));

    setPlaygroundResponse(
      `Mock response: You said "${playgroundMessage.trim()}"`
    );

    setPlaygroundLoading(false);
  };

  // --- 下面 UI 完全不動 ---
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "2.25rem",
            fontWeight: "bold",
            color: "#111827",
            marginBottom: "0.5rem",
          }}
        >
          API Keys & Playground
        </h1>
        <p style={{ color: "#6B7280", fontSize: "1.125rem" }}>
          Manage your API keys and test the chat API
        </p>
      </div>

      {/* API Keys Section */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "2rem",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "semibold",
              color: "#111827",
            }}
          >
            API Keys
          </h2>
          <button
            onClick={() => setShowCreateForm(true)}
            style={{
              backgroundColor: "#3B82F6",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: "500",
            }}
          >
            <Plus size={16} /> Create New Key
          </button>
        </div>

        {/* Create Key Form */}
        {showCreateForm && (
          <div
            style={{
              backgroundColor: "#F9FAFB",
              padding: "1.5rem",
              borderRadius: "8px",
              marginBottom: "1.5rem",
              border: "1px solid #E5E7EB",
            }}
          >
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: "medium",
                marginBottom: "1rem",
              }}
            >
              Create New API Key
            </h3>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
                alignItems: "end",
              }}
            >
              <div style={{ flex: "1", minWidth: "200px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "medium",
                    color: "#374151",
                    marginBottom: "0.5rem",
                  }}
                >
                  Key Name
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., My App Integration"
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    border: "1px solid #D1D5DB",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => createKeyMutation.mutate(newKeyName)}
                  disabled={!newKeyName.trim() || createKeyMutation.loading}
                  style={{
                    backgroundColor: newKeyName.trim() ? "#10B981" : "#9CA3AF",
                    color: "white",
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    border: "none",
                    cursor: newKeyName.trim() ? "pointer" : "not-allowed",
                    fontSize: "0.875rem",
                  }}
                >
                  {createKeyMutation.loading ? "Creating..." : "Create"}
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewKeyName("");
                  }}
                  style={{
                    backgroundColor: "white",
                    color: "#6B7280",
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    border: "1px solid #D1D5DB",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Keys List */}
        {keysLoading ? (
          <div
            style={{ textAlign: "center", color: "#6B7280", padding: "2rem" }}
          >
            Loading API keys...
          </div>
        ) : keys.length === 0 ? (
          <div
            style={{ textAlign: "center", color: "#6B7280", padding: "2rem" }}
          >
            No API keys yet. Create your first one to get started!
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {keys.map((key) => (
              <div
                key={key.id}
                style={{
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  padding: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "1rem",
                  }}
                >
                  <div style={{ flex: "1", minWidth: "200px" }}>
                    <div
                      style={{ fontWeight: "medium", marginBottom: "0.5rem" }}
                    >
                      {key.key_name}
                    </div>
                    <div
                      style={{
                        fontFamily: "monospace",
                        fontSize: "0.875rem",
                        color: "#6B7280",
                        backgroundColor: "#F9FAFB",
                        padding: "0.5rem",
                        borderRadius: "4px",
                        marginBottom: "0.5rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <span>
                        {visibleKeys.has(key.id)
                          ? key.api_key
                          : `${key.api_key.substring(0, 12)}${"*".repeat(key.api_key.length - 12)}`}
                      </span>
                      <button
                        onClick={() => toggleKeyVisibility(key.id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#6B7280",
                        }}
                      >
                        {visibleKeys.has(key.id) ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          copyToClipboard(key.api_key, `key-${key.id}`)
                        }
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#6B7280",
                        }}
                      >
                        <Copy size={16} />
                      </button>
                      {copiedText === `key-${key.id}` && (
                        <span style={{ color: "#10B981", fontSize: "0.75rem" }}>
                          Copied!
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>
                      Created: {new Date(key.created_at).toLocaleDateString()}
                      {key.last_used_at && (
                        <span>
                          {" "}
                          • Last used:{" "}
                          {new Date(key.last_used_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => revokeKeyMutation.mutate(key.id)}
                    style={{
                      backgroundColor: "#EF4444",
                      color: "white",
                      padding: "0.5rem",
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      fontSize: "0.875rem",
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* API Playground */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "2rem",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <Terminal size={20} />
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "semibold",
              color: "#111827",
            }}
          >
            API Playground
          </h2>
        </div>

        {keys.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#6B7280",
              padding: "2rem",
              backgroundColor: "#F9FAFB",
              borderRadius: "8px",
            }}
          >
            Create an API key to test the chat endpoint
          </div>
        ) : (
          <>
            {/* API Key Selection */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "medium",
                  color: "#374151",
                  marginBottom: "0.5rem",
                }}
              >
                Select API Key
              </label>
              <select
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
                style={{
                  width: "100%",
                  maxWidth: "400px",
                  padding: "0.5rem 0.75rem",
                  border: "1px solid #D1D5DB",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  fontFamily: "monospace",
                }}
              >
                {keys.map((key) => (
                  <option key={key.id} value={key.api_key}>
                    {key.key_name} - {key.api_key.substring(0, 16)}...
                  </option>
                ))}
              </select>
            </div>

            {/* Message Input */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "medium",
                  color: "#374151",
                  marginBottom: "0.5rem",
                }}
              >
                Test Message
              </label>
              <div
                style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}
              >
                <textarea
                  value={playgroundMessage}
                  onChange={(e) => setPlaygroundMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={3}
                  style={{
                    flex: "1",
                    padding: "0.75rem",
                    border: "1px solid #D1D5DB",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    resize: "vertical",
                    minHeight: "80px",
                  }}
                />
                <button
                  onClick={testPlayground}
                  disabled={
                    !selectedKey ||
                    !playgroundMessage.trim() ||
                    playgroundLoading
                  }
                  style={{
                    backgroundColor:
                      playgroundMessage.trim() && selectedKey
                        ? "#3B82F6"
                        : "#9CA3AF",
                    color: "white",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "6px",
                    border: "none",
                    cursor:
                      playgroundMessage.trim() && selectedKey
                        ? "pointer"
                        : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    height: "48px",
                  }}
                >
                  <Send size={16} />
                  {playgroundLoading ? "Sending..." : "Send"}
                </button>
              </div>
            </div>

            {/* Response */}
            {(playgroundResponse || playgroundLoading) && (
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "medium",
                    color: "#374151",
                    marginBottom: "0.5rem",
                  }}
                >
                  Response
                </label>
                <div
                  style={{
                    backgroundColor: "#F9FAFB",
                    border: "1px solid #E5E7EB",
                    borderRadius: "6px",
                    padding: "1rem",
                    fontFamily: "monospace",
                    fontSize: "0.875rem",
                    whiteSpace: "pre-wrap",
                    minHeight: "100px",
                    maxHeight: "300px",
                    overflowY: "auto",
                  }}
                >
                  {playgroundLoading ? (
                    <span style={{ color: "#6B7280" }}>
                      Waiting for response...
                    </span>
                  ) : (
                    playgroundResponse
                  )}
                </div>
              </div>
            )}

            {/* API Documentation */}
            <div
              style={{
                backgroundColor: "#F9FAFB",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                padding: "1.5rem",
              }}
            >
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "medium",
                  marginBottom: "1rem",
                  color: "#374151",
                }}
              >
                API Usage
              </h3>
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "#6B7280",
                  lineHeight: "1.5",
                }}
              >
                <p style={{ marginBottom: "1rem" }}>
                  <strong>Endpoint:</strong>{" "}
                  <code
                    style={{
                      backgroundColor: "#E5E7EB",
                      padding: "0.25rem",
                      borderRadius: "3px",
                    }}
                  >
                    POST /api/v1/chat
                  </code>
                </p>
                <p style={{ marginBottom: "1rem" }}>
                  <strong>Authentication:</strong> Include your API key in the
                  Authorization header:{" "}
                  <code
                    style={{
                      backgroundColor: "#E5E7EB",
                      padding: "0.25rem",
                      borderRadius: "3px",
                    }}
                  >
                    Authorization: Bearer YOUR_API_KEY
                  </code>
                </p>
                <p style={{ marginBottom: "1rem" }}>
                  <strong>Request Body:</strong>
                </p>
                <pre
                  style={{
                    backgroundColor: "#1F2937",
                    color: "#F3F4F6",
                    padding: "1rem",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    overflow: "auto",
                  }}
                >
                  {`{
  "message": "Your message here",
  "conversationId": null, // Optional: conversation ID
  "useCache": true       // Optional: enable response caching
}`}
                </pre>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
