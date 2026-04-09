import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../firebase/config";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  onAuthChange,
  updateUserProfile,
  changeUserPassword,
} from "../firebase/auth";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
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

  const updateProfile = async ({ name, phone }) => {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("Not logged in.");
    await updateUserProfile(uid, { name, phone });
    setUser((prev) => ({ ...prev, name, phone }));
  };

  const changePassword = async (currentPassword, newPassword) => {
    await changeUserPassword(currentPassword, newPassword);
  };

  return (
    <AuthCtx.Provider value={{
      user,
      isAdmin: user?.role === "admin",
      loading,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
    }}>
      {!loading && children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);