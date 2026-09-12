import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  useAuth,
} from "./useAuth";


export default function PublicAdminRoute() {

  const {
    usuarioAuth,
    cargando,
    esAdmin,
  } =
    useAuth();


  if (cargando) {

    return (
      <div>
        Cargando...
      </div>
    );

  }


  if (!usuarioAuth) {

    return <Outlet />;

  }


  if (esAdmin) {

    return (
      <Navigate
        to="/admin/propiedades"
        replace
      />
    );

  }


  return (
    <Navigate
      to="/admin/pendiente"
      replace
    />
  );
}