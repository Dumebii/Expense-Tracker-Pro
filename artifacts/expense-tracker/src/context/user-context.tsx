import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const CURRENCIES = [
  { value: "USD", label: "USD ($)", symbol: "$" },
  { value: "EUR", label: "EUR (€)", symbol: "€" },
  { value: "GBP", label: "GBP (£)", symbol: "£" },
  { value: "NGN", label: "NGN (₦)", symbol: "₦" },
  { value: "CAD", label: "CAD (C$)", symbol: "C$" },
  { value: "AUD", label: "AUD (A$)", symbol: "A$" },
  { value: "JPY", label: "JPY (¥)", symbol: "¥" },
  { value: "CHF", label: "CHF", symbol: "CHF" },
  { value: "INR", label: "INR (₹)", symbol: "₹" },
  { value: "ZAR", label: "ZAR (R)", symbol: "R" },
];

export { CURRENCIES };

interface UserProfile {
  name: string;
  email: string;
  receiptEmail: string;
  displayCurrency: string;
}

interface UserContextType {
  user: UserProfile | null;
  signIn: (name: string, email: string) => void;
  signOut: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  isSignedIn: boolean;
}

const STORAGE_KEY = "ledger_user_profile";

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const signIn = (name: string, email: string) => {
    setUser({ name, email, receiptEmail: email, displayCurrency: "USD" });
  };

  const signOut = () => {
    setUser(null);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <UserContext.Provider value={{ user, signIn, signOut, updateProfile, isSignedIn: !!user }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
}
