import { AuthContext } from "../contexts/authContext";

import { useContext } from "react";
import type { AuthContextType } from "../contexts/authContext";

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
