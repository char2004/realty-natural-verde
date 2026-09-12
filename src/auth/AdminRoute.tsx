import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  useAuth,
} from "./useAuth";


export default function AdminRoute() {

  const {
    usuarioAuth,
    perfil,
    cargando,
    esAdmin,
  } =
    useAuth();


  if (cargando) {

    return (
      <div>
        Validando acceso...
      </div>
    );

  }


  /*
   * No hay sesión.
   */
  if (!usuarioAuth) {

    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );

  }


  /*
   * Tiene sesión, pero no es admin.
   */
  if (!perfil || !esAdmin) {

    return (
      <Navigate
        to="/admin/pendiente"
        replace
      />
    );

  }


  /*
   * Autenticado + admin aprobado.
   */
  return <Outlet />;
}