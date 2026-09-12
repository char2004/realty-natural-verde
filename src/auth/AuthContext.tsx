import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  onAuthStateChanged,
  type User,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../api/firebase";

import type {
  UsuarioFirestore,
} from "../types/auth.types";


export interface AuthContextValue {
  usuarioAuth: User | null;
  perfil: UsuarioFirestore | null;
  cargando: boolean;
  esAdmin: boolean;
  recargarPerfil: () => Promise<void>;
}


export const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined
  );


interface AuthProviderProps {
  children: ReactNode;
}


export function AuthProvider({
  children,
}: AuthProviderProps) {

  const [
    usuarioAuth,
    setUsuarioAuth,
  ] = useState<User | null>(null);


  const [
    perfil,
    setPerfil,
  ] = useState<UsuarioFirestore | null>(null);


  const [
    cargando,
    setCargando,
  ] = useState(true);


  /*
   * =========================================
   * CARGAR PERFIL DESDE FIRESTORE
   * =========================================
   */

  const cargarPerfil =
    useCallback(
      async (
        user: User | null
      ): Promise<void> => {

        if (!user) {

          setPerfil(null);

          return;
        }


        const referencia =
          doc(
            db,
            "usuarios",
            user.uid
          );


        const snapshot =
          await getDoc(
            referencia
          );


        if (!snapshot.exists()) {

          setPerfil(null);

          return;
        }


        const datos =
          snapshot.data();


        const perfilUsuario: UsuarioFirestore = {

          uid:
            typeof datos.uid === "string"
              ? datos.uid
              : user.uid,


          nombre:
            typeof datos.nombre === "string"
              ? datos.nombre
              : "",


          email:
            typeof datos.email === "string"
              ? datos.email
              : user.email ?? "",


          fotoUrl:
            typeof datos.fotoUrl === "string"
              ? datos.fotoUrl
              : "",


          rol:
            datos.rol === "admin"
              ? "admin"
              : "usuario",


          estadoAdmin:
            datos.estadoAdmin === "aprobado"
              ? "aprobado"
              : datos.estadoAdmin === "rechazado"
                ? "rechazado"
                : "pendiente",


          proveedor:
            datos.proveedor === "google"
              ? "google"
              : "password",
        };


        setPerfil(
          perfilUsuario
        );

      },
      []
    );


  /*
   * =========================================
   * RECARGAR PERFIL MANUALMENTE
   * =========================================
   */

  const recargarPerfil =
    useCallback(
      async (): Promise<void> => {

        await cargarPerfil(
          auth.currentUser
        );

      },
      [
        cargarPerfil,
      ]
    );


  /*
   * =========================================
   * ESCUCHAR SESIÓN DE FIREBASE AUTH
   * =========================================
   */

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,

        async (user) => {

          setCargando(true);

          setUsuarioAuth(
            user
          );


          try {

            await cargarPerfil(
              user
            );

          } catch (error) {

            console.error(
              "Error al obtener el perfil:",
              error
            );


            setPerfil(
              null
            );

          } finally {

            setCargando(
              false
            );

          }

        }
      );


    return () => {

      unsubscribe();

    };

  }, [
    cargarPerfil,
  ]);


  /*
   * =========================================
   * VALIDAR SI ES ADMINISTRADOR
   * =========================================
   */

  const esAdmin =
    perfil?.rol === "admin" &&
    perfil?.estadoAdmin === "aprobado";


  /*
   * =========================================
   * PROVIDER
   * =========================================
   */

  return (

    <AuthContext.Provider
      value={{
        usuarioAuth,
        perfil,
        cargando,
        esAdmin,
        recargarPerfil,
      }}
    >

      {children}

    </AuthContext.Provider>

  );
}