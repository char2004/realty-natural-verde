import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  CircleCheck,
  CircleX,
  Clock3,
  LogOut,
  ShieldCheck,
} from "lucide-react";

import {
  signOut,
} from "firebase/auth";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import {
  useNavigate,
} from "react-router-dom";

import {
  auth,
  db,
} from "../../../api/firebase";

import {
  useAuth,
} from "../../../auth/useAuth";

import logo from "../../../assets/logo-natura-verde.png";

import "./AdminPending.css";


type EstadoSolicitud =
  | "pendiente"
  | "aprobado"
  | "rechazado";


export default function AdminPending() {

  const navigate =
    useNavigate();


  const {
    usuarioAuth,
    perfil,
    recargarPerfil,
  } =
    useAuth();


  const redirigiendo =
    useRef(false);


  const [
    estado,
    setEstado,
  ] =
    useState<EstadoSolicitud>(
      perfil?.estadoAdmin ??
      "pendiente"
    );


  const [
    cerrandoSesion,
    setCerrandoSesion,
  ] =
    useState(false);


  /*
   * ==========================================
   * ESCUCHAR CAMBIOS DEL USUARIO EN FIRESTORE
   * ==========================================
   */

  useEffect(() => {

    if (!usuarioAuth) {

      navigate(
        "/admin/login",
        {
          replace: true,
        }
      );

      return;
    }


    const referencia =
      doc(
        db,
        "usuarios",
        usuarioAuth.uid
      );


    const unsubscribe =
      onSnapshot(
        referencia,

        async (snapshot) => {

          if (!snapshot.exists()) {

            setEstado(
              "pendiente"
            );

            return;
          }


          const datos =
            snapshot.data();


          const estadoActual =
            datos.estadoAdmin;


          const rolActual =
            datos.rol;


          /*
           * ==================================
           * ACCESO APROBADO
           * ==================================
           */

          if (
            rolActual === "admin" &&
            estadoActual === "aprobado"
          ) {

            if (
              redirigiendo.current
            ) {

              return;

            }


            redirigiendo.current =
              true;


            setEstado(
              "aprobado"
            );


            try {

              await recargarPerfil();


              navigate(
                "/admin/propiedades",
                {
                  replace: true,
                }
              );

            } catch (error) {

              console.error(
                "Error actualizando el perfil:",
                error
              );


              redirigiendo.current =
                false;

            }


            return;
          }


          /*
           * ==================================
           * SOLICITUD RECHAZADA
           * ==================================
           */

          if (
            estadoActual === "rechazado"
          ) {

            setEstado(
              "rechazado"
            );

            return;
          }


          /*
           * ==================================
           * SIGUE PENDIENTE
           * ==================================
           */

          setEstado(
            "pendiente"
          );

        },

        (error) => {

          console.error(
            "Error escuchando el estado de la solicitud:",
            error
          );

        }
      );


    return () => {

      unsubscribe();

    };

  }, [
    usuarioAuth,
    navigate,
    recargarPerfil,
  ]);


  /*
   * ==========================================
   * CERRAR SESIÓN
   * ==========================================
   */

  const cerrarSesion =
    async (): Promise<void> => {

      try {

        setCerrandoSesion(
          true
        );


        await signOut(
          auth
        );


        navigate(
          "/admin/login",
          {
            replace: true,
          }
        );

      } catch (error) {

        console.error(
          "Error cerrando sesión:",
          error
        );

      } finally {

        setCerrandoSesion(
          false
        );

      }

    };


  return (
    <main className="admin-pending">

      <div
        className="
          admin-pending__shape
          admin-pending__shape--one
        "
      />

      <div
        className="
          admin-pending__shape
          admin-pending__shape--two
        "
      />


      <section className="admin-pending__card">

        <div className="admin-pending__brand">

          <img
            src={logo}
            alt="Realty Natural Verde"
            className="admin-pending__logo"
          />

        </div>


        {estado === "pendiente" && (

          <>

            <div className="admin-pending__icon admin-pending__icon--pending">

              <Clock3
                size={34}
                strokeWidth={1.8}
              />

            </div>


            <div className="admin-pending__badge admin-pending__badge--pending">

              <Clock3
                size={15}
              />

              Solicitud pendiente

            </div>


            <header className="admin-pending__header">

              <h1>
                Solicitud enviada
              </h1>

              <p>
                Hola{" "}
                <strong>
                  {perfil?.nombre || "usuario"}
                </strong>.
                Tu cuenta fue registrada
                correctamente.
              </p>

            </header>


            <div className="admin-pending__message">

              <div className="admin-pending__message-icon">

                <ShieldCheck
                  size={20}
                />

              </div>


              <div>

                <h2>
                  Estamos esperando tu aprobación
                </h2>

                <p>
                  Un administrador debe confirmar
                  tu solicitud antes de que puedas
                  acceder a la administración de
                  propiedades.
                </p>

              </div>

            </div>


            <div className="admin-pending__status">

              <div className="admin-pending__status-step">

                <div className="admin-pending__step-icon admin-pending__step-icon--complete">

                  <CircleCheck
                    size={18}
                  />

                </div>

                <div>

                  <strong>
                    Cuenta registrada
                  </strong>

                  <span>
                    Tu usuario fue creado correctamente.
                  </span>

                </div>

              </div>


              <div className="admin-pending__status-line" />


              <div className="admin-pending__status-step">

                <div className="admin-pending__step-icon admin-pending__step-icon--current">

                  <Clock3
                    size={18}
                  />

                </div>

                <div>

                  <strong>
                    Esperando aprobación
                  </strong>

                  <span>
                    Tu solicitud está siendo revisada.
                  </span>

                </div>

              </div>


              <div className="admin-pending__status-line" />


              <div className="admin-pending__status-step admin-pending__status-step--disabled">

                <div className="admin-pending__step-icon">

                  <ShieldCheck
                    size={18}
                  />

                </div>

                <div>

                  <strong>
                    Acceso administrativo
                  </strong>

                  <span>
                    Se habilitará al aprobar tu cuenta.
                  </span>

                </div>

              </div>

            </div>


            <p className="admin-pending__automatic">

              Esta página se actualizará
              automáticamente cuando tu
              solicitud sea aprobada.

            </p>

          </>

        )}


        {estado === "rechazado" && (

          <>

            <div className="admin-pending__icon admin-pending__icon--rejected">

              <CircleX
                size={34}
                strokeWidth={1.8}
              />

            </div>


            <div className="admin-pending__badge admin-pending__badge--rejected">

              <CircleX
                size={15}
              />

              Solicitud no aprobada

            </div>


            <header className="admin-pending__header">

              <h1>
                Acceso no autorizado
              </h1>

              <p>
                Hola{" "}
                <strong>
                  {perfil?.nombre || "usuario"}
                </strong>.
              </p>

            </header>


            <div className="admin-pending__rejected-message">

              <p>
                Tu solicitud de acceso al panel
                administrativo no fue aprobada.
                Si consideras que se trata de un
                error, ponte en contacto con el
                administrador del sitio.
              </p>

            </div>

          </>

        )}


        <button
          type="button"
          className="admin-pending__logout"
          onClick={cerrarSesion}
          disabled={cerrandoSesion}
        >

          <LogOut
            size={17}
          />

          {
            cerrandoSesion
              ? "Cerrando sesión..."
              : "Cerrar sesión"
          }

        </button>

      </section>

    </main>
  );
}