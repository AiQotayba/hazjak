import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LoginInput } from "@hazjak/validation";
import type { AuthUser } from "@hazjak/types";
import { api } from "@/lib/api";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  verificationToken: string | null;
  pendingUser: AuthUser | null;
  isLoggingIn: boolean;
  loginError: string | null;
  setAuth: (token: string, user: AuthUser) => void;
  setVerificationPending: (verificationToken: string, user: AuthUser) => void;
  clearVerificationPending: () => void;
  clearLoginError: () => void;
  login: (
    credentials: LoginInput
  ) => Promise<
    | { ok: true; user: AuthUser; token: string }
    | { ok: false; reason: "error"; message: string }
    | { ok: false; reason: "verify"; verificationToken: string; user: AuthUser }
  >;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      verificationToken: null,
      pendingUser: null,
      isLoggingIn: false,
      loginError: null,
      setAuth: (token, user) =>
        set({ token, user, verificationToken: null, pendingUser: null, loginError: null }),
      setVerificationPending: (verificationToken, user) =>
        set({ verificationToken, pendingUser: user, token: null, user: null, loginError: null }),
      clearVerificationPending: () => set({ verificationToken: null, pendingUser: null }),
      clearLoginError: () => set({ loginError: null }),
      login: async (credentials) => {
        set({ isLoggingIn: true, loginError: null });
        const res = await api<
          { accessToken: string; user: AuthUser } | { verificationToken: string; user: AuthUser }
        >("/auth/login", {
          method: "POST",
          body: JSON.stringify(credentials),
        });
        set({ isLoggingIn: false });

        if (!res.success) {
          if (res.code === "PHONE_NOT_VERIFIED" && res.data && "verificationToken" in res.data) {
            set({
              verificationToken: res.data.verificationToken,
              pendingUser: res.data.user,
              token: null,
              user: null,
            });
            return {
              ok: false,
              reason: "verify",
              verificationToken: res.data.verificationToken,
              user: res.data.user,
            };
          }
          const message = res.message ?? "تعذّر تسجيل الدخول";
          set({ loginError: message });
          return { ok: false, reason: "error", message };
        }

        if (!res.data || !("accessToken" in res.data)) {
          const message = "تعذّر تسجيل الدخول";
          set({ loginError: message });
          return { ok: false, reason: "error", message };
        }

        set({
          token: res.data.accessToken,
          user: res.data.user,
          verificationToken: null,
          pendingUser: null,
          loginError: null,
        });
        return { ok: true, user: res.data.user, token: res.data.accessToken };
      },
      logout: () =>
        set({
          token: null,
          user: null,
          verificationToken: null,
          pendingUser: null,
          loginError: null,
          isLoggingIn: false,
        }),
    }),
    {
      name: "Hazjak-auth",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        verificationToken: state.verificationToken,
        pendingUser: state.pendingUser,
      }),
    }
  )
);
