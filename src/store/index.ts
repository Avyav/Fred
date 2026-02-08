import { create } from "zustand";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { messages: number };
}

interface AppState {
  // Current conversation
  currentConversationId: string | null;
  messages: Message[];
  conversations: Conversation[];

  // UI state
  isLoading: boolean;
  isSidebarOpen: boolean;
  isCrisis: boolean;
  error: string | null;

  // Actions
  setCurrentConversation: (id: string | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  removeConversation: (id: string) => void;
  setIsLoading: (loading: boolean) => void;
  setIsSidebarOpen: (open: boolean) => void;
  setIsCrisis: (crisis: boolean) => void;
  setError: (error: string | null) => void;
  clearChat: () => void;
  reset: () => void;
}

const initialState = {
  currentConversationId: null as string | null,
  messages: [] as Message[],
  conversations: [] as Conversation[],
  isLoading: false,
  isSidebarOpen: true,
  isCrisis: false,
  error: null as string | null,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setCurrentConversation: (id) => set({ currentConversationId: id }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setConversations: (conversations) => set({ conversations }),
  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    })),
  removeConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      ...(state.currentConversationId === id
        ? { currentConversationId: null, messages: [] }
        : {}),
    })),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  setIsCrisis: (isCrisis) => set({ isCrisis }),
  setError: (error) => set({ error }),
  clearChat: () =>
    set({ currentConversationId: null, messages: [], isCrisis: false }),
  reset: () => set(initialState),
}));
