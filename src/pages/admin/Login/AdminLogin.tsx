import {
  useState,
  type FormEvent,
} from "react";

import {
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import {
  auth,
  db,
  googleProvider,
} from "../../../api/firebase";

import logo from "../../../assets/logo-natura-verde.png";

import "./AdminLogin.css";


export default function AdminLogin() {

  const navigate =
    useNavigate();


  const [
    email,
    setEmail,
  ] = useState("");


  const [
    password,
    setPassword,
  ] = useState("");


  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );


  const [
    cargando,
    setCargando,
  ] = useState(false);


  const validarAcceso =
    async (
      uid: string
    ) => {

      const referencia =
        doc(
          db,
          "usuarios",
          uid
        );


      const snapshot =
        await getDoc(
          referencia
        );


      if (!snapshot.exists()) {
        return false;
      }


      const datos =
        snapshot.data();


      return (
        datos.rol === "admin" &&
        datos.estadoAdmin === "aprobado"
      );

    };


  const iniciarConEmail =
    async (
      event: FormEvent<HTMLFormElement>
    ) => {

      event.preventDefault();

      setError(null);


      try {

        setCargando(true);


        const resultado =
          await signInWithEmailAndPassword(
            auth,
            email.trim(),
            password
          );


        const esAdministrador =
          await validarAcceso(
            resultado.user.uid
          );


        if (esAdministrador) {

          navigate(
            "/admin/propiedades",
            {
              replace: true,
            }
          );

        } else {

          navigate(
            "/admin/pendiente",
            {
              replace: true,
            }
          );

        }

      } catch (error) {

        console.error(
          "Error iniciando sesión:",
          error
        );


        setError(
          "No fue posible iniciar sesión. Verifica tu correo y contraseña."
        );

      } finally {

        setCargando(false);

      }

    };


  const iniciarConGoogle =
    async () => {

      setError(null);


      try {

        setCargando(true);


        const resultado =
          await signInWithPopup(
            auth,
            googleProvider
          );


        const user =
          resultado.user;


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

          await setDoc(
            referencia,
            {
              uid:
                user.uid,

              nombre:
                user.displayName ?? "",

              email:
                user.email ?? "",

              fotoUrl:
                user.photoURL ?? "",

              rol:
                "usuario",

              estadoAdmin:
                "pendiente",

              proveedor:
                "google",

              creadoEn:
                serverTimestamp(),
            }
          );


          navigate(
            "/admin/pendiente",
            {
              replace: true,
            }
          );


          return;

        }


        const datos =
          snapshot.data();


        const esAdministrador =
          datos.rol === "admin" &&
          datos.estadoAdmin === "aprobado";


        if (esAdministrador) {

          navigate(
            "/admin/propiedades",
            {
              replace: true,
            }
          );

        } else {

          navigate(
            "/admin/pendiente",
            {
              replace: true,
            }
          );

        }

      } catch (error) {

        console.error(
          "Error iniciando sesión con Google:",
          error
        );


        setError(
          "No fue posible iniciar sesión con Google."
        );

      } finally {

        setCargando(false);

      }

    };


  return (
    <main className="admin-login">

      <div
        className="admin-login__shape admin-login__shape--one"
      />

      <div
        className="admin-login__shape admin-login__shape--two"
      />


      <section className="admin-login__card">

        <div className="admin-login__brand">

          <Link
            to="/"
            className="admin-login__logo-link"
          >
            <img
              src={logo}
              alt="Realty Natura Verde"
              className="admin-login__logo"
            />
          </Link>

        </div>


        <div className="admin-login__badge">

          <ShieldCheck
            size={17}
          />

          <span>
            Acceso administrativo
          </span>

        </div>


        <header className="admin-login__header">

          <h1>
            Bienvenido
          </h1>

          <p>
            Inicia sesión para administrar
            las propiedades de Natura Verde.
          </p>

        </header>


        <button
          type="button"
          className="admin-login__google"
          onClick={iniciarConGoogle}
          disabled={cargando}
        >

          <span className="admin-login__google-icon">
            G
          </span>

          <span>
            Continuar con Google
          </span>

        </button>


        <div className="admin-login__separator">

          <span />

          <p>
            o continúa con correo
          </p>

          <span />

        </div>


        <form
          className="admin-login__form"
          onSubmit={iniciarConEmail}
        >

          <label className="admin-login__field">

            <span className="admin-login__label">
              Correo electrónico
            </span>

            <div className="admin-login__input-wrapper">

              <Mail
                size={19}
              />

              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={
                  (event) =>
                    setEmail(
                      event.target.value
                    )
                }
                disabled={cargando}
                required
              />

            </div>

          </label>


          <label className="admin-login__field">

            <span className="admin-login__label">
              Contraseña
            </span>

            <div className="admin-login__input-wrapper">

              <LockKeyhole
                size={19}
              />

              <input
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={
                  (event) =>
                    setPassword(
                      event.target.value
                    )
                }
                disabled={cargando}
                required
              />

            </div>

          </label>


          {error && (

            <div className="admin-login__error">
              {error}
            </div>

          )}


          <button
            type="submit"
            className="admin-login__submit"
            disabled={cargando}
          >

            {
              cargando
                ? "Ingresando..."
                : "Iniciar sesión"
            }

          </button>

        </form>


        <div className="admin-login__register">

          <p>
            ¿Necesitas solicitar acceso?
          </p>

          <Link
            to="/admin/registro"
          >
            Crear una cuenta
          </Link>

        </div>


        <Link
          to="/"
          className="admin-login__back"
        >
          Volver al sitio
        </Link>

      </section>

    </main>
  );
}