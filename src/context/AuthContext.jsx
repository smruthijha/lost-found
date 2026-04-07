import { createContext, useContext, useState, useEffect } from "react";
import { registerUser, loginUser, logoutUser, getUserProfile, onAuthChange } from "../firebase/auth";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          setUser(profile);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const register = async (form) => {
    const profile = await registerUser(form);
    setUser(profile);
    return profile;
  };

  const login = async (email, password) => {
    const profile = await loginUser(email, password);
    setUser(profile);
    return profile;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, isAdmin: user?.role === "admin", loading, login, register, logout }}>
      {!loading && children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
