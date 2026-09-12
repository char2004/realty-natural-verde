import {
  useContext,
} from "react";

import {
  AuthContext,
  type AuthContextValue,
} from "./AuthContext";


export function useAuth(): AuthContextValue {

  const context =
    useContext(
      AuthContext
    );


  if (
    context === undefined
  ) {

    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider."
    );

  }


  return context;
}