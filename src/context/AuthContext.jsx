import { createContext, useContext, useState } from "react";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "../utils/constants";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null); // { email } | null

  const adminLogin = (email, password) => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setAdmin({ email });
      return { success: true };
    }
    return { success: false, error: "Invalid admin credentials." };
  };

  const adminLogout = () => setAdmin(null);

  return (
    <AuthContext.Provider value={{ admin, isAdmin: !!admin, adminLogin, adminLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);