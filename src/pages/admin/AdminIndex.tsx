import {
  Navigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../auth/useAuth";


export default function AdminIndex() {

  const {
    usuarioAuth,
    cargando,
    esAdmin,
  } =
    useAuth();


  if (cargando) {

    return (
      <div>
        Validando sesión...
      </div>
    );

  }


  if (!usuarioAuth) {

    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );

  }


  if (!esAdmin) {

    return (
      <Navigate
        to="/admin/pendiente"
        replace
      />
    );

  }


  return (
    <Navigate
      to="/admin/propiedades"
      replace
    />
  );
}