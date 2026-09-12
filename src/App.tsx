import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import Home
  from "./pages/Home/Home";

import Fincas
  from "./pages/Fincas/Fincas";

import DetallesFinca
  from "./pages/Fincas/DetallesFinca";


import AdminLogin
  from "./pages/admin/Login/AdminLogin";

import AdminRegister
  from "./pages/admin/Registro/AdminRegistro";

import AdminPending
  from "./pages/admin/Pending/AdminPending";

import AdminProperties
  from "./pages/admin/Propiedades/AdminPropiedades";

import AdminPropiedadForm
  from "./pages/admin/Propiedades/nueva/AdminPropiedadForm";

import AdminEditarPropiedad
  from "./pages/admin/Propiedades/editar/AdminEditarPropiedad";

import AdminRoute
  from "./auth/AdminRoute";

import PublicAdminRoute
  from "./auth/PublicAdminRoute";


function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* ========================
            SITIO PÚBLICO
        ======================== */}

        <Route
          path="/"
          element={
            <Home />
          }
        />


        <Route
          path="/fincas"
          element={
            <Fincas />
          }
        />


        {/* ========================
            DETALLE DE PROPIEDAD
        ======================== */}

        <Route
          path="/fincas/:propiedadId"
          element={
            <DetallesFinca />
          }
        />


        {/* ========================
            LOGIN ADMIN
        ======================== */}

        <Route
          element={
            <PublicAdminRoute />
          }
        >

          <Route
            path="/admin/login"
            element={
              <AdminLogin />
            }
          />

          <Route
            path="/admin/registro"
            element={
              <AdminRegister />
            }
          />

        </Route>


        {/* ========================
            USUARIO PENDIENTE
        ======================== */}

        <Route
          path="/admin/pendiente"
          element={
            <AdminPending />
          }
        />


        {/* ========================
            SOLO ADMINISTRADORES
        ======================== */}

        <Route
          element={
            <AdminRoute />
          }
        >

          <Route
            path="/admin/propiedades"
            element={
              <AdminProperties />
            }
          />

          <Route
            path="/admin/propiedades/nueva"
            element={
              <AdminPropiedadForm />
            }
          />

          <Route
            path="/admin/propiedades/:propiedadId/editar"
            element={
              <AdminEditarPropiedad />
            }
          />

        </Route>

      </Routes>

    </BrowserRouter>

  );

}


export default App;