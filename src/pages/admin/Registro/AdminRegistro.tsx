import {
  useState,
  type FormEvent,
} from "react";

import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import {
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  CircleUserRound,
  Info,
  LockKeyhole,
  Mail,
  UserPlus,
} from "lucide-react";

import {
  auth,
  db,
} from "../../../api/firebase";

import logo from "../../../assets/logo-natura-verde.png";

import "./AdminRegistro.css";


export default function AdminRegister() {

  const navigate =
    useNavigate();


  const [
    nombre,
    setNombre,
  ] = useState("");


  const [
    email,
    setEmail,
  ] = useState("");


  const [
    password,
    setPassword,
  ] = useState("");


  const [
    confirmarPassword,
    setConfirmarPassword,
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


  const registrar =
    async (
      event: FormEvent<HTMLFormElement>
    ): Promise<void> => {

      event.preventDefault();

      setError(null);


      const nombreLimpio =
        nombre.trim();

      const emailLimpio =
        email.trim();


      if (!nombreLimpio) {

        setError(
          "Ingresa tu nombre."
        );

        return;
      }


      if (
        password !==
        confirmarPassword
      ) {

        setError(
          "Las contraseñas no coinciden."
        );

        return;
      }


      if (
        password.length < 6
      ) {

        setError(
          "La contraseña debe tener al menos 6 caracteres."
        );

        return;
      }


      try {

        setCargando(true);


        // =====================================
        // CREAR USUARIO EN AUTHENTICATION
        // =====================================

        const resultado =
          await createUserWithEmailAndPassword(
            auth,
            emailLimpio,
            password
          );


        const user =
          resultado.user;


        // =====================================
        // ACTUALIZAR NOMBRE
        // =====================================

        await updateProfile(
          user,
          {
            displayName:
              nombreLimpio,
          }
        );


        // =====================================
        // CREAR PERFIL EN FIRESTORE
        // =====================================

        const referenciaUsuario =
          doc(
            db,
            "usuarios",
            user.uid
          );


        await setDoc(
          referenciaUsuario,
          {
            uid:
              user.uid,

            nombre:
              nombreLimpio,

            email:
              user.email ??
              emailLimpio,

            fotoUrl:
              "",

            rol:
              "usuario",

            estadoAdmin:
              "pendiente",

            proveedor:
              "password",

            creadoEn:
              serverTimestamp(),
          }
        );


        // =====================================
        // REDIRECCIONAR
        // =====================================

        navigate(
          "/admin/pendiente",
          {
            replace: true,
          }
        );

      } catch (error) {

        console.error(
          "Error al registrar usuario:",
          error
        );


        if (
          error instanceof Error
        ) {

          if (
            error.message.includes(
              "auth/email-already-in-use"
            )
          ) {

            setError(
              "Ya existe una cuenta registrada con este correo electrónico."
            );

          } else if (
            error.message.includes(
              "auth/invalid-email"
            )
          ) {

            setError(
              "El correo electrónico ingresado no es válido."
            );

          } else if (
            error.message.includes(
              "auth/weak-password"
            )
          ) {

            setError(
              "La contraseña es demasiado débil."
            );

          } else {

            setError(
              "No fue posible crear la cuenta. Inténtalo nuevamente."
            );

          }

        } else {

          setError(
            "Ocurrió un error inesperado."
          );

        }

      } finally {

        setCargando(false);

      }

    };


  return (
    <main className="admin-register">

      <div
        className="
          admin-register__shape
          admin-register__shape--one
        "
      />

      <div
        className="
          admin-register__shape
          admin-register__shape--two
        "
      />


      <section className="admin-register__card">

        <div className="admin-register__brand">

          <Link
            to="/"
            className="admin-register__logo-link"
          >

            <img
              src={logo}
              alt="Realty Natura Verde"
              className="admin-register__logo"
            />

          </Link>

        </div>


        <div className="admin-register__badge">

          <UserPlus
            size={17}
          />

          <span>
            Solicitud de acceso
          </span>

        </div>


        <header className="admin-register__header">

          <h1>
            Crear una cuenta
          </h1>

          <p>
            Registra tus datos para solicitar
            acceso al panel administrativo
            de Natura Verde.
          </p>

        </header>


        <form
          className="admin-register__form"
          onSubmit={registrar}
        >

          <label className="admin-register__field">

            <span className="admin-register__label">
              Nombre
            </span>

            <div className="admin-register__input-wrapper">

              <CircleUserRound
                size={19}
              />

              <input
                type="text"
                placeholder="Ingresa tu nombre"
                value={nombre}
                onChange={
                  (event) =>
                    setNombre(
                      event.target.value
                    )
                }
                disabled={cargando}
                autoComplete="name"
                required
              />

            </div>

          </label>


          <label className="admin-register__field">

            <span className="admin-register__label">
              Correo electrónico
            </span>

            <div className="admin-register__input-wrapper">

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
                autoComplete="email"
                required
              />

            </div>

          </label>


          <div className="admin-register__passwords">

            <label className="admin-register__field">

              <span className="admin-register__label">
                Contraseña
              </span>

              <div className="admin-register__input-wrapper">

                <LockKeyhole
                  size={19}
                />

                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={
                    (event) =>
                      setPassword(
                        event.target.value
                      )
                  }
                  minLength={6}
                  disabled={cargando}
                  autoComplete="new-password"
                  required
                />

              </div>

            </label>


            <label className="admin-register__field">

              <span className="admin-register__label">
                Confirmar contraseña
              </span>

              <div className="admin-register__input-wrapper">

                <LockKeyhole
                  size={19}
                />

                <input
                  type="password"
                  placeholder="Repite la contraseña"
                  value={confirmarPassword}
                  onChange={
                    (event) =>
                      setConfirmarPassword(
                        event.target.value
                      )
                  }
                  minLength={6}
                  disabled={cargando}
                  autoComplete="new-password"
                  required
                />

              </div>

            </label>

          </div>


          {error && (

            <div className="admin-register__error">

              {error}

            </div>

          )}


          <div className="admin-register__notice">

            <div className="admin-register__notice-icon">

              <Info
                size={17}
              />

            </div>

            <p>
              Después de registrarte, tu solicitud
              deberá ser aprobada antes de que puedas
              acceder al panel administrativo.
            </p>

          </div>


          <button
            type="submit"
            className="admin-register__submit"
            disabled={cargando}
          >

            {
              cargando
                ? "Enviando solicitud..."
                : "Solicitar acceso"
            }

          </button>

        </form>


        <div className="admin-register__login">

          <p>
            ¿Ya tienes una cuenta?
          </p>

          <Link
            to="/admin/login"
          >
            Iniciar sesión
          </Link>

        </div>


        <Link
          to="/"
          className="admin-register__back"
        >
          Volver al sitio
        </Link>

      </section>

    </main>
  );
}