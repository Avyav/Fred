import { create } from "zustand";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string | null;
  updatedAt: string;
}

interface AppState {
  // Current conversation
  currentConversationId: string | null;
  messages: Message[];
  conversations: Conversation[];

  // UI state
  isLoading: boolean;
  isSidebarOpen: boolean;
  error: string | null;

  // Actions
  setCurrentConversation: (id: string | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setConversations: (conversations: Conversation[]) => void;
  setIsLoading: (loading: boolean) => void;
  setIsSidebarOpen: (open: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  currentConversationId: null,
  messages: [],
  conversations: [],
  isLoading: false,
  isSidebarOpen: true,
  error: null,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setCurrentConversation: (id) => set({ currentConversationId: id }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setConversations: (conversations) => set({ conversations }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
