import { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageCircle,
  Plus,
  Send,
  User,
  Bot,
  Settings,
  LogOut,
  Trash2,
  Edit,
} from "lucide-react";

export default function ChatInterface() {
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversationsData, setConversationsData] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const messagesEndRef = useRef(null);

  // Redirect to signin if not authenticated
  useEffect(() => {
    // run only once on mount
    const sessionId = typeof window !== "undefined" ? localStorage.getItem("sessionId") : null;

    // no token -> go to signin
    if (!sessionId) {
      window.location.href = "/account/signin";
      return;
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Placeholder: no API, just local changes
  const handleNewConversation = useCallback(() => {
    const newConv = {
      id: Date.now().toString(),
      title: "New Conversation",
      messages: [],
      updated_at: Date.now(),
    };

    setConversationsData((prev) => [newConv, ...prev]);
    setCurrentConversationId(newConv.id);
    setCurrentConversation(newConv);
  }, []);

  const handleDeleteConversation = useCallback((conversationId, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this conversation?")) return;

    setConversationsData((prev) => prev.filter((c) => c.id !== conversationId));

    if (currentConversationId === conversationId) {
      setCurrentConversationId(null);
      setCurrentConversation(null);
    }
  }, [currentConversationId]);

  // Handle selecting a conversation
  useEffect(() => {
    if (!currentConversationId) return;

    const conv = conversationsData.find((c) => c.id === currentConversationId);
    setCurrentConversation(conv || null);
  }, [currentConversationId, conversationsData]);

  const handleSendMessage = useCallback(
    (e) => {
      e.preventDefault();
      if (!message.trim()) return;

      const userMsg = {
        id: Date.now().toString(),
        message_type: "user",
        content: message.trim(),
        created_at: Date.now(),
      };

      const assistantMsg = {
        id: Date.now().toString() + "-a",
        message_type: "assistant",
        content: "This is a placeholder response.",
        created_at: Date.now(),
        metadata: { cached: false },
      };

      setConversationsData((prev) =>
        prev.map((conv) =>
          conv.id === currentConversationId
            ? {
              ...conv,
              messages: [...conv.messages, userMsg, assistantMsg],
              updated_at: Date.now(),
            }
            : conv
        )
      );

      setMessage("");
      setTimeout(scrollToBottom, 100);
    },
    [message, currentConversationId, scrollToBottom]
  );

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages, scrollToBottom]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "w-80" : "w-0"} transition-all duration-300 overflow-hidden bg-white border-r border-gray-200 flex flex-col`}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-blue-600" />
              Pocket LLM
            </h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={handleNewConversation}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {conversationsData.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No conversations yet</div>
          ) : (
            <div className="space-y-1">
              {conversationsData.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setCurrentConversationId(conversation.id)}
                  className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${currentConversationId === conversation.id
                      ? "bg-blue-50 border border-blue-200"
                      : "hover:bg-gray-50 border border-transparent"
                    }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {conversation.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(conversation.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(conversation.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {!sidebarOpen && (
          <div className="p-4 border-b border-gray-200 bg-white">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Show Sidebar
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {!currentConversationId ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-600 mb-2">
                  Welcome to Pocket LLM
                </h2>
                <p className="text-gray-500 mb-6">
                  Start a new conversation to begin chatting with AI
                </p>
                <button
                  onClick={handleNewConversation}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start New Chat
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {currentConversation?.messages?.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-4 ${msg.message_type === "user" ? "justify-end" : "justify-start"
                    }`}
                >
                  {msg.message_type === "assistant" && (
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-green-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-3xl p-4 rounded-2xl ${msg.message_type === "user"
                        ? "bg-blue-600 text-white ml-12"
                        : "bg-white border border-gray-200"
                      }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    {msg.message_type === "assistant" &&
                      msg.metadata?.cached && (
                        <p className="text-xs text-green-600 mt-2">↻ Cached response</p>
                      )}
                  </div>
                  {msg.message_type === "user" && (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        {currentConversationId && (
          <div className="p-6 bg-white border-t border-gray-200">
            <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="flex-1 p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
