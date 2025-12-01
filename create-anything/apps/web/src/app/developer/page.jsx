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

  // --- 🟦 Mock 資料 ---
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
    isLoading: keysLoading,
    error: keysError,
  } = useQuery({
    queryKey: ["api-keys"],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 300));
      return { keys: mockKeys };
    },
    enabled: true, // ← ★ 修正：要讓它真的 fetch mock data
  });

  // 新增 key
  const createKeyMutation = useMutation({
    mutationFn: async (name) => {
      await new Promise((r) => setTimeout(r, 400));
      return {
        id: Date.now(),
        key_name: name,
        api_key: "pk_created_" + Math.random().toString(36).slice(2),
        created_at: new Date().toISOString(),
        last_used_at: null,
      };
    },
    onSuccess: (newKey) => {
      // 直接把新 key 加進快取，避免重新 fetch mock keys
      const old = queryClient.getQueryData(["api-keys"])?.keys ?? [];
      queryClient.setQueryData(["api-keys"], { keys: [...old, newKey] });

      setShowCreateForm(false);
      setNewKeyName("");
    },
  });

  // 刪除 key
  const revokeKeyMutation = useMutation({
    mutationFn: async (keyId) => {
      await new Promise((r) => setTimeout(r, 200));
      return true;
    },
    onSuccess: (_, keyId) => {
      const old = queryClient.getQueryData(["api-keys"])?.keys ?? [];
      queryClient.setQueryData(["api-keys"], {
        keys: old.filter((k) => k.id !== keyId),
      });
    },
  });

  const keys = keysData?.keys || [];

  // 初次載入自動選第一把 key
  useEffect(() => {
    if (keys.length > 0 && !selectedKey) {
      setSelectedKey(keys[0].api_key);
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

  // Playground mock
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
                disabled={!newKeyName.trim()}
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
        {keysLoading ? (
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
                key={key.id}
                style={{
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  padding: "1rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: "bold" }}>{key.key_name}</div>
                    <div
                      style={{
                        fontFamily: "monospace",
                        padding: "0.5rem",
                        background: "#F3F4F6",
                        borderRadius: "4px",
                        marginTop: "0.5rem",
                      }}
                    >
                      {visibleKeys.has(key.id)
                        ? key.api_key
                        : key.api_key.substring(0, 12) +
                        "*".repeat(key.api_key.length - 12)}
                      <button
                        onClick={() => toggleKeyVisibility(key.id)}
                        style={{ marginLeft: "1rem" }}
                      >
                        {visibleKeys.has(key.id) ? <EyeOff /> : <Eye />}
                      </button>
                      <button
                        onClick={() =>
                          copyToClipboard(key.api_key, `key-${key.id}`)
                        }
                        style={{ marginLeft: "0.5rem" }}
                      >
                        <Copy />
                      </button>
                      {copiedText === `key-${key.id}` && (
                        <span style={{ color: "#10B981" }}>Copied!</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => revokeKeyMutation.mutate(key.id)}
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
                  <option key={k.id} value={k.api_key}>
                    {k.key_name}
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
              disabled={!playgroundMessage.trim()}
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
