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
  const [sessionToken, setSessionToken] = useState(null);
  const [recentKey, setRecentKey] = useState(null);

  const queryClient = useQueryClient();

  // Redirect to signin if not authenticated
  useEffect(() => {
    const sessionId =
      typeof window !== "undefined" ? localStorage.getItem("sessionId") : null;

    const validateSession = async () => {
      if (!sessionId) {
        window.location.href = "/account/signin";
        return false;
      }

      const res = await fetch("/api/auth/validate", {
        headers: { "X-Session-Id": sessionId },
      });

      if (!res.ok) {
        localStorage.removeItem("sessionId");
        window.location.href = "/account/signin";
        return false;
      }

      setSessionToken(sessionId);
      return true;
    };

    validateSession();
  }, []);

  // Fetch API keys from backend
  const {
    data: keysData,
    isLoading: keysLoading,
    error: keysError,
  } = useQuery({
    queryKey: ["api-keys", sessionToken],
    queryFn: async () => {
      const res = await fetch("/api/apikey", {
        headers: {
          "Content-Type": "application/json",
          "X-Session-Id": sessionToken || "",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to load API keys");
      }

      return res.json();
    },
    enabled: !!sessionToken,
  });

  // 新增 key
  const createKeyMutation = useMutation({
    mutationFn: async (name) => {
      if (!sessionToken) throw new Error("Missing session");

      const res = await fetch("/api/apikey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Id": sessionToken,
        },
        body: JSON.stringify({ keyName: name }),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to create key");
      }

      return res.json();
    },
    onSuccess: (newKey) => {
      queryClient.invalidateQueries({ queryKey: ["api-keys", sessionToken] });
      setShowCreateForm(false);
      setNewKeyName("");
      setRecentKey(newKey);
      setSelectedKey(newKey.apiKey);
    },
    onError: (err) => {
      console.error(err);
      alert(err.message || "Failed to create key");
    },
  });

  // 刪除 key
  const revokeKeyMutation = useMutation({
    mutationFn: async (keyId) => {
      if (!sessionToken) throw new Error("Missing session");

      const res = await fetch(`/api/apikey/${keyId}`, {
        method: "DELETE",
        headers: {
          "X-Session-Id": sessionToken,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete key");
      }
    },
    onSuccess: (_, keyId) => {
      queryClient.invalidateQueries({ queryKey: ["api-keys", sessionToken] });
      if (recentKey?.keyId === keyId) {
        setRecentKey(null);
      }
    },
    onError: (err) => {
      console.error(err);
      alert(err.message || "Failed to delete key");
    },
  });

  const keys = Array.isArray(keysData) ? keysData : [];

  // 初次載入自動選第一把 key
  useEffect(() => {
    if (keys.length > 0 && !selectedKey) {
      setSelectedKey(keys[0].apiKey);
    }
  }, [keys, selectedKey]);

  const toggleKeyVisibility = (keyId) => {
    const set2 = new Set(visibleKeys);
    if (set2.has(keyId)) set2.delete(keyId);
    else set2.add(keyId);
    setVisibleKeys(set2);
  };

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(""), 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Playground LLM call
  const testPlayground = async () => {
    const message = playgroundMessage.trim();
    if (!selectedKey || !message) return;

    setPlaygroundLoading(true);
    setPlaygroundResponse("");

    try {
      const res = await fetch("/api/playground/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${selectedKey}`,
        },
        body: JSON.stringify({
          model: "pocket-llm-chat",
          messages: [{ role: "user", content: message }],
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to reach playground API");
      }

      const data = await res.json();
      setPlaygroundResponse(data.result || data.llmResponse || "(empty response)");
    } catch (err) {
      console.error(err);
      setPlaygroundResponse(`Error: ${err.message || err}`);
    } finally {
      setPlaygroundLoading(false);
    }
  };

  // --- UI ---
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

      {recentKey && (
        <div
          style={{
            backgroundColor: "#ECFDF5",
            border: "1px solid #A7F3D0",
            borderRadius: "12px",
            padding: "1.25rem",
            marginBottom: "1.5rem",
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: "0.5rem", color: "#065F46" }}>
            Store this key securely – it will only be shown once.
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
              alignItems: "center",
            }}
          >
            <code
              style={{
                background: "#D1FAE5",
                padding: "0.5rem 0.75rem",
                borderRadius: "6px",
                fontFamily: "monospace",
                fontSize: "0.95rem",
              }}
            >
              {recentKey.apiKey}
            </code>
            <button
              onClick={() => copyToClipboard(recentKey.apiKey, "recent-key")}
              style={{
                backgroundColor: "#10B981",
                color: "white",
                borderRadius: "6px",
                padding: "0.35rem 0.75rem",
                border: "none",
                cursor: "pointer",
              }}
            >
              Copy key
            </button>
            <button
              onClick={() => setRecentKey(null)}
              style={{
                background: "transparent",
                border: "none",
                color: "#047857",
                cursor: "pointer",
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

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

        {/* Create Form */}
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
            <div style={{ display: "flex", gap: "1rem" }}>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., My App Integration"
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  border: "1px solid #D1D5DB",
                  borderRadius: "6px",
                }}
              />
              <button
                onClick={() => createKeyMutation.mutate(newKeyName)}
                disabled={!newKeyName.trim() || createKeyMutation.isPending}
                style={{
                  backgroundColor: "#10B981",
                  color: "white",
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                }}
              >
                Create
              </button>
            </div>
          </div>
        )}

        {/* Keys */}
        {keysError && (
          <div
            style={{
              backgroundColor: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: "8px",
              padding: "0.75rem 1rem",
              color: "#991B1B",
              marginBottom: "1rem",
            }}
          >
            Failed to load API keys. {keysError.message}
          </div>
        )}
        {!sessionToken ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            Checking session...
          </div>
        ) : keysLoading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            Loading...
          </div>
        ) : keys.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            No API keys yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {keys.map((key) => (
              <div
                key={key.keyId}
                style={{
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  padding: "1rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: "bold" }}>{key.keyName}</div>
                    <div
                      style={{
                        fontFamily: "monospace",
                        padding: "0.5rem",
                        background: "#F3F4F6",
                        borderRadius: "4px",
                        marginTop: "0.5rem",
                      }}
                    >
                      {visibleKeys.has(key.keyId)
                        ? key.apiKey
                        : key.apiKey.length > 12
                          ? key.apiKey.substring(0, 12) +
                          "*".repeat(Math.max(key.apiKey.length - 12, 1))
                          : "*".repeat(Math.max(key.apiKey.length, 1))}
                      <button
                        onClick={() => toggleKeyVisibility(key.keyId)}
                        style={{ marginLeft: "1rem" }}
                      >
                        {visibleKeys.has(key.keyId) ? <EyeOff /> : <Eye />}
                      </button>
                      <button
                        onClick={() =>
                          copyToClipboard(key.apiKey, `key-${key.keyId}`)
                        }
                        style={{ marginLeft: "0.5rem" }}
                      >
                        <Copy />
                      </button>
                      {copiedText === `key-${key.keyId}` && (
                        <span style={{ color: "#10B981" }}>Copied!</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => revokeKeyMutation.mutate(key.keyId)}
                    style={{
                      backgroundColor: "#EF4444",
                      color: "white",
                      borderRadius: "6px",
                      padding: "0.5rem",
                    }}
                  >
                    <Trash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Playground */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "2rem",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", display: "flex", gap: "0.5rem" }}>
          <Terminal /> API Playground
        </h2>

        {keys.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            Create an API key first
          </div>
        ) : (
          <>
            <div style={{ marginBottom: "1rem" }}>
              <select
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
                style={{ padding: "0.5rem", borderRadius: "6px" }}
              >
                {keys.map((k) => (
                  <option key={k.keyId} value={k.apiKey}>
                    {k.keyName}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              value={playgroundMessage}
              onChange={(e) => setPlaygroundMessage(e.target.value)}
              placeholder="Type message..."
              style={{
                width: "100%",
                minHeight: "80px",
                padding: "0.75rem",
                borderRadius: "6px",
                border: "1px solid #D1D5DB",
              }}
            />

            {/* cURL Preview */}
            {selectedKey && playgroundMessage && (
              <div
                style={{
                  marginTop: "1rem",
                  background: "#111827",
                  color: "white",
                  padding: "1rem",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  overflowX: "auto",
                  whiteSpace: "pre-wrap",
                }}
              >
                <pre style={{ margin: 0 }}>
                  {`curl -X POST \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${selectedKey}" \\
  -d '{
    "model": "pocket-llm-chat",
    "messages": [{"role": "user", "content": "${playgroundMessage}"}]
  }' \\
  http://localhost:8080/api/playground/chat`}
                </pre>
              </div>
            )}

            <button
              onClick={testPlayground}
              disabled={!playgroundMessage.trim() || !selectedKey || playgroundLoading}
              style={{
                marginTop: "1rem",
                backgroundColor: "#3B82F6",
                color: "white",
                padding: "0.5rem 1.5rem",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Send size={16} />
              Send
            </button>

            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                background: "#F3F4F6",
                borderRadius: "6px",
                minHeight: "100px",
                fontFamily: "monospace",
              }}
            >
              {playgroundLoading
                ? "Loading..."
                : playgroundResponse || "No response yet."}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
