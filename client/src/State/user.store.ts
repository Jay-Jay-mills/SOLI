import { create } from 'zustand';
import type { User } from '@/Interfaces';

interface UserStore {
  users: User[];
  selectedUser: User | null;
  isLoading: boolean;
  
  // Actions
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  removeUser: (id: string) => void;
  setSelectedUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  selectedUser: null,
  isLoading: false,

  setUsers: (users) => {
    set({ users });
  },

  addUser: (user) => {
    set((state) => ({
      users: [...state.users, user],
    }));
  },

  updateUser: (id, updates) => {
    set((state) => ({
      users: state.users.map((user) =>
        user.id === id ? { ...user, ...updates } : user
      ),
    }));
  },

  removeUser: (id) => {
    set((state) => ({
      users: state.users.filter((user) => user.id !== id),
    }));
  },

  setSelectedUser: (user) => {
    set({ selectedUser: user });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },
}));

export default useUserStore;
