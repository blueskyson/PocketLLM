import { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageCircle,
  Plus,
  Send,
  User,
  Bot,
  Settings,
  Trash2,
  Loader2,
} from "lucide-react";

export default function ChatInterface() {
  // state
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [currentConversationTitle, setCurrentConversationTitle] = useState(null);
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversationsData, setConversationsData] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Redirect to signin if not authenticated
  useEffect(() => {
    const sessionId =
      typeof window !== "undefined" ? localStorage.getItem("sessionId") : null;

    if (!sessionId) {
      window.location.href = "/account/signin";
      return;
    }

    const loadConversations = async () => {
      try {
        const res = await fetch("/api/chat/list", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Session-Id": sessionId,
          },
        });

        if (!res.ok) {
          console.error(`Failed to load conversations: ${res.status}`);
          return;
        }

        const data = await res.json();
        const conversations = Array.isArray(data?.conversations)
          ? data.conversations
          : Array.isArray(data)
          ? data
          : [];

        // Sort by createdAt
        conversations.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

        setConversationsData(conversations);

        // Force a "New Conversation" (Draft) state immediately.
        setCurrentConversationId(null);
        setCurrentConversationTitle("New Conversation");
        setCurrentConversation({
          chatId: null,
          title: "New Conversation",
          messages: [],
          createdAt: Date.now(),
          __draft: true,
        });
        
        setTimeout(() => textareaRef.current?.focus(), 100);

      } catch (err) {
        console.error("Error loading conversations:", err);
      }
    };

    loadConversations();
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // ─────────────────────────────────────────────────────────────
  // New Conversation
  // ─────────────────────────────────────────────────────────────
  const handleNewConversation = useCallback(() => {
    setCurrentConversationId(null);
    setCurrentConversationTitle("New Conversation");
    setCurrentConversation({
      chatId: null,
      title: "New Conversation",
      messages: [],
      createdAt: Date.now(),
      __draft: true,
    });
    setMessage("");
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Delete conversation
  // ─────────────────────────────────────────────────────────────
  const handleDeleteConversation = useCallback(
    async (conversationId, e) => {
      e.stopPropagation();
      if (!window.confirm("Delete this conversation?")) return;

      try {
        if (!conversationId) {
          setCurrentConversationId(null);
          setCurrentConversation(null);
          return;
        }

        const deleteRes = await fetch(`/api/chat/${conversationId}`, {
          method: "DELETE",
          headers: {
            "X-Session-Id": localStorage.getItem("sessionId") || "",
          },
        });
        
        if (!deleteRes.ok) {
          console.error("Failed to delete conversation");
          return;
        }

        setConversationsData((prev) =>
          prev.filter((c) => c.chatId !== conversationId)
        );

        if (currentConversationId === conversationId) {
          handleNewConversation();
        }
      } catch (err) {
        console.error("Error deleting conversation:", err);
      }
    },
    [currentConversationId, handleNewConversation]
  );

  // ─────────────────────────────────────────────────────────────
  // Select Conversation & Load History
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentConversationId) return; 

    let cancelled = false;
    const fetchConversation = async () => {
      try {
        const res = await fetch(`/api/chat/history/${currentConversationId}`, {
          method: "GET",
          headers: {
            "X-Session-Id": localStorage.getItem("sessionId") || "",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch chat history");
        const data = await res.json();

        const mappedMessages = Array.isArray(data)
          ? data.map((msg, idx) => ({
              id: `${currentConversationId}-${idx}`,
              role: msg.fromUser ? "user" : "assistant",
              content: msg.content,
              timestamp: msg.timestamp
                ? new Date(msg.timestamp).getTime()
                : Date.now(),
            }))
          : [];

        // If we don't have a title in state yet, look it up from conversationsData
        let titleToUse = currentConversationTitle;
        if (!titleToUse) {
           const found = conversationsData.find(c => c.chatId === currentConversationId);
           if (found) titleToUse = found.title;
        }

        const newConv = {
          chatId: currentConversationId,
          title: titleToUse || "Conversation",
          messages: mappedMessages,
          createdAt: Date.now(),
        };

        if (!cancelled) {
          setConversationsData((prev) => {
            const exists = prev.some((c) => c.chatId === newConv.chatId);
            return exists
              ? prev.map((c) => (c.chatId === newConv.chatId ? newConv : c))
              : [...prev, newConv];
          });
          setCurrentConversation(newConv);
          setTimeout(scrollToBottom, 100);
        }
      } catch (err) {
        console.error("Error fetching conversation:", err);
      }
    };

    fetchConversation();
    return () => {
      cancelled = true;
    };
  }, [currentConversationId, currentConversationTitle, scrollToBottom]);

  // ─────────────────────────────────────────────────────────────
  // Send message
  // ─────────────────────────────────────────────────────────────
  const handleSendMessage = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      const text = message.trim();
      if (!text || isSending) return;

      setIsSending(true);

      const userMsg = {
        id: Date.now().toString(),
        role: "user",
        content: text,
        timestamp: Date.now(),
      };

      try {
        let chatId = currentConversationId;

        // 1) Create chat on first message
        if (!chatId) {
          // GENERATE TITLE DYNAMICALLY
          const generatedTitle = text.length > 30 ? text.substring(0, 30) + "..." : text;
          
          const createRes = await fetch("/api/chat/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Session-Id": localStorage.getItem("sessionId") || "",
            },
            body: JSON.stringify({ title: generatedTitle }),
          });
          
          if (!createRes.ok) throw new Error("Failed to create chat");
          const createData = await createRes.json();
          chatId = createData.chatId;
          
          // Use backend title if provided, otherwise use generated one
          const finalTitle = createData.title || generatedTitle;

          // Update State Variables Immediately
          setCurrentConversationTitle(finalTitle);

          const newConvEntry = {
            chatId: chatId,
            title: finalTitle,
            messages: [userMsg],
            createdAt: Date.now(),
          };

          // Update Sidebar List immediately
          setConversationsData((prev) => [newConvEntry, ...prev]);
          
          // Update Active View immediately
          setCurrentConversationId(chatId);
          setCurrentConversation(newConvEntry);

        } else {
          // Optimistically append user message to existing chat
          const updateFn = (conv) =>
            conv.chatId === chatId || conv.id === chatId
              ? {
                  ...conv,
                  messages: [...(conv.messages || []), userMsg],
                  createdAt: Date.now(),
                }
              : conv;

          setConversationsData((prev) => prev.map(updateFn));
          setCurrentConversation((prev) => (prev ? updateFn(prev) : prev));
        }

        setMessage("");
        setTimeout(scrollToBottom, 50);

        // 2) Send to backend
        const sendRes = await fetch("/api/chat/message", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Session-Id": localStorage.getItem("sessionId") || "",
          },
          body: JSON.stringify({
            chatId: chatId,
            content: text,
            fromUser: true,
          }),
        });

        if (!sendRes.ok) throw new Error("Failed to send message");
        const sendData = await sendRes.json();

        const newMessage = sendData.llmResponse
          ? { 
              role: "assistant", 
              content: sendData.llmResponse, 
              timestamp: Date.now() 
            }
          : null;

        if (newMessage) {
           const appendMsgFn = (conv) =>
            (conv.chatId === chatId || conv.id === chatId)
              ? {
                  ...conv,
                  messages: [...(conv.messages || []), newMessage],
                  createdAt: Date.now(),
                }
              : conv;

          setConversationsData((prev) => prev.map(appendMsgFn));
          setCurrentConversation((prev) => (prev ? appendMsgFn(prev) : prev));
        }
        
        setTimeout(scrollToBottom, 100);
      } catch (err) {
        console.error("Error sending message:", err);
        alert("Failed to send message. Please try again.");
      } finally {
        setIsSending(false);
        setTimeout(() => textareaRef.current?.focus(), 10);
      }
    },
    [message, currentConversationId, scrollToBottom, isSending]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleInput = (e) => {
    const target = e.target;
    target.style.height = "auto";
    target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
    setMessage(target.value);
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-80 translate-x-0" : "w-0 -translate-x-full"
        } fixed md:relative z-20 h-full transition-all duration-300 overflow-hidden bg-white border-r border-gray-200 flex flex-col`}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-blue-600" />
              Pocket LLM
            </h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 text-gray-500 hover:text-gray-700 md:hidden"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={handleNewConversation}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {conversationsData.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No conversations yet
            </div>
          ) : (
            <div className="space-y-1">
              {conversationsData.map((conversation) => (
                <div
                  key={conversation.chatId || conversation.id}
                  onClick={() => {
                    setCurrentConversationId(conversation.chatId || conversation.id);
                    setCurrentConversationTitle(conversation.title);
                    if (window.innerWidth < 768) setSidebarOpen(false);
                  }}
                  className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                    currentConversationId === (conversation.chatId || conversation.id)
                      ? "bg-blue-50 border border-blue-200 shadow-sm"
                      : "hover:bg-gray-100 border border-transparent"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                       currentConversationId === (conversation.chatId || conversation.id) ? "text-blue-700" : "text-gray-700"
                    }`}>
                      {conversation.title || "New Conversation"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {conversation.createdAt ? new Date(conversation.createdAt).toLocaleDateString() : 'Just now'}
                    </p>
                  </div>
                  <button
                    onClick={(e) =>
                      handleDeleteConversation(conversation.chatId || conversation.id, e)
                    }
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                    title="Delete chat"
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
      <div className="flex-1 flex flex-col w-full bg-gray-50">
        <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
           <div className="flex items-center gap-3">
            {!sidebarOpen && (
                <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Open Sidebar"
                >
                <MessageCircle className="w-5 h-5" />
                </button>
            )}
            <h2 className="text-lg font-semibold text-gray-800 truncate">
                {currentConversation?.title || "New Chat"}
            </h2>
           </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          {!currentConversation || (currentConversation.messages && currentConversation.messages.length === 0) ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md px-4">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Bot className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Welcome to Pocket LLM
                </h2>
                <p className="text-gray-500 mb-8 leading-relaxed">
                  I can help you write code, draft emails, or answer complex questions. 
                  Start a new conversation below.
                </p>
                <button
                  onClick={() => textareaRef.current?.focus()}
                  className="text-blue-600 font-medium hover:underline"
                >
                  Type a message to begin →
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6 pb-4">
              {currentConversation.messages?.map((msg, idx) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={`${currentConversation.chatId}-${idx}`}
                    className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm text-white">
                        <Bot className="w-5 h-5" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl shadow-sm ${
                        isUser
                          ? "bg-blue-600 text-white rounded-tr-none"
                          : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"
                      }`}
                    >
                      <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </p>
                      <p className={`text-[10px] mt-2 opacity-70 ${isUser ? 'text-blue-100' : 'text-gray-400'}`}>
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                      </p>
                    </div>
                    {isUser && (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Thinking Indicator */}
              {isSending && (
                <div className="flex gap-4 justify-start">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm text-white">
                        <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm">
                        <div className="flex gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        {currentConversation && (
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="max-w-3xl mx-auto relative">
              <div className="flex gap-3 items-end bg-gray-50 border border-gray-300 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  rows={1}
                  className="flex-1 max-h-[200px] min-h-[44px] py-2.5 px-3 bg-transparent border-none focus:ring-0 resize-none text-gray-800 placeholder-gray-400"
                  style={{ height: '44px' }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isSending}
                  className="mb-1 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors flex-shrink-0"
                >
                  {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-center text-xs text-gray-400 mt-2">
                Press Enter to send, Shift + Enter for new line
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}