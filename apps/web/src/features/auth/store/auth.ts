import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@hazjak/types";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  verificationToken: string | null;
  pendingUser: AuthUser | null;
  setAuth: (token: string, user: AuthUser) => void;
  setVerificationPending: (verificationToken: string, user: AuthUser) => void;
  clearVerificationPending: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      verificationToken: null,
      pendingUser: null,
      setAuth: (token, user) =>
        set({ token, user, verificationToken: null, pendingUser: null }),
      setVerificationPending: (verificationToken, user) =>
        set({ verificationToken, pendingUser: user, token: null, user: null }),
      clearVerificationPending: () => set({ verificationToken: null, pendingUser: null }),
      logout: () =>
        set({ token: null, user: null, verificationToken: null, pendingUser: null }),
    }),
    { name: "Hazjak-auth" }
  )
);
