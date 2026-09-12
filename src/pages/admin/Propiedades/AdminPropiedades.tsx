import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Building2,
  CheckCircle2,
  CircleDollarSign,
  Images,
  LogOut,
  MapPin,
  Plus,
  Search,
  SlidersHorizontal,
  Tag,
} from "lucide-react";

import {
  signOut,
} from "firebase/auth";

import {
  collection,
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

import "./AdminPropiedades.css";


/*
 * ==========================================
 * TIPOS
 * ==========================================
 */

type EstadoPropiedad =
  | "disponible"
  | "oferta"
  | "vendida";


interface Propiedad {
  id: string;

  titulo: string;

  ubicacion: string;

  precio: number;

  precioOferta: number | null;

  estado: EstadoPropiedad;

  imagen: string;

  visible: boolean;

  destacada: boolean;
}


/*
 * ==========================================
 * COMPONENTE
 * ==========================================
 */

export default function AdminProperties() {

  const navigate =
    useNavigate();


  const {
    perfil,
  } =
    useAuth();


  /*
   * ========================================
   * ESTADOS
   * ========================================
   */

  const [
    propiedades,
    setPropiedades,
  ] =
    useState<Propiedad[]>(
      []
    );


  const [
    cargandoPropiedades,
    setCargandoPropiedades,
  ] =
    useState(true);


  const [
    errorPropiedades,
    setErrorPropiedades,
  ] =
    useState<string | null>(
      null
    );


  const [
    busqueda,
    setBusqueda,
  ] =
    useState("");


  const [
    filtro,
    setFiltro,
  ] =
    useState<
      "todas" |
      EstadoPropiedad
    >(
      "todas"
    );


  const [
    cerrandoSesion,
    setCerrandoSesion,
  ] =
    useState(false);


  /*
   * ========================================
   * CARGAR PROPIEDADES DE FIRESTORE
   * ========================================
   */

  useEffect(
    () => {

      setCargandoPropiedades(
        true
      );


      setErrorPropiedades(
        null
      );


      const referencia =
        collection(
          db,
          "propiedades"
        );


      /*
       * onSnapshot permite que el listado
       * se actualice automáticamente si:
       *
       * - se agrega una propiedad
       * - se modifica
       * - se elimina
       */

      const unsubscribe =
        onSnapshot(
          referencia,

          (snapshot) => {

            const lista:
              Propiedad[] =
              snapshot.docs.map(
                (documento) => {

                  const datos =
                    documento.data();


                  /*
                   * =================================
                   * UBICACIÓN
                   * =================================
                   */

                  const partesUbicacion =
                    [
                      datos.ubicacion?.distrito,
                      datos.ubicacion?.canton,
                      datos.ubicacion?.provincia,
                    ]
                      .filter(
                        Boolean
                      );


                  const ubicacion =
                    partesUbicacion.length > 0
                      ? partesUbicacion.join(
                          ", "
                        )
                      : "Ubicación no especificada";


                  /*
                   * =================================
                   * ESTADO
                   * =================================
                   */

                  let estado:
                    EstadoPropiedad =
                    "disponible";


                  if (
                    datos.estado ===
                    "oferta"
                  ) {

                    estado =
                      "oferta";

                  } else if (
                    datos.estado ===
                    "vendida"
                  ) {

                    estado =
                      "vendida";

                  }


                  return {

                    id:
                      documento.id,

                    titulo:
                      typeof datos.titulo ===
                      "string"
                        ? datos.titulo
                        : "Propiedad sin título",

                    ubicacion,

                    precio:
                      typeof datos.precio ===
                      "number"
                        ? datos.precio
                        : 0,

                    precioOferta:
                      typeof datos.precioOferta ===
                      "number"
                        ? datos.precioOferta
                        : null,

                    estado,

                    imagen:
                      typeof datos.imagenPrincipal?.url ===
                      "string"
                        ? datos.imagenPrincipal.url
                        : "",

                    visible:
                      datos.visible !==
                      false,

                    destacada:
                      datos.destacada ===
                      true,

                  };

                }
              );


            setPropiedades(
              lista
            );


            setCargandoPropiedades(
              false
            );

          },

          (error) => {

            console.error(
              "Error cargando propiedades:",
              error
            );


            setErrorPropiedades(
              "No fue posible cargar las propiedades."
            );


            setCargandoPropiedades(
              false
            );

          }
        );


      /*
       * Cerramos el listener cuando
       * desaparece el componente.
       */

      return () =>
        unsubscribe();

    },
    []
  );


  /*
   * ========================================
   * FILTRADO
   * ========================================
   */

  const propiedadesFiltradas =
    useMemo(
      () => {

        const texto =
          busqueda
            .trim()
            .toLowerCase();


        return propiedades.filter(
          (propiedad) => {

            const coincideBusqueda =
              !texto ||
              propiedad.titulo
                .toLowerCase()
                .includes(
                  texto
                ) ||
              propiedad.ubicacion
                .toLowerCase()
                .includes(
                  texto
                );


            const coincideEstado =
              filtro ===
                "todas" ||
              propiedad.estado ===
                filtro;


            return (
              coincideBusqueda &&
              coincideEstado
            );

          }
        );

      },
      [
        propiedades,
        busqueda,
        filtro,
      ]
    );


  /*
   * ========================================
   * ESTADÍSTICAS
   * ========================================
   */

  const total =
    propiedades.length;


  const disponibles =
    propiedades.filter(
      (propiedad) =>
        propiedad.estado ===
        "disponible"
    ).length;


  const ofertas =
    propiedades.filter(
      (propiedad) =>
        propiedad.estado ===
        "oferta"
    ).length;


  const vendidas =
    propiedades.filter(
      (propiedad) =>
        propiedad.estado ===
        "vendida"
    ).length;


  /*
   * ========================================
   * CERRAR SESIÓN
   * ========================================
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


  /*
   * ========================================
   * AGREGAR PROPIEDAD
   * ========================================
   */

  const agregarPropiedad =
    (): void => {

      navigate(
        "/admin/propiedades/nueva"
      );

    };


  /*
   * ========================================
   * EDITAR PROPIEDAD
   * ========================================
   */

  const editarPropiedad =
    (
      propiedadId: string
    ): void => {

      navigate(
        `/admin/propiedades/${propiedadId}/editar`
      );

    };


  /*
   * ========================================
   * RENDER
   * ========================================
   */

  return (

    <main className="admin-properties">

      {/* =====================================
          BARRA SUPERIOR
          ===================================== */}

      <header className="admin-properties__topbar">

        <div className="admin-properties__topbar-content">

          <div className="admin-properties__brand">

            <img
              src={logo}
              alt="Realty Natura Verde"
              className="admin-properties__logo"
            />

            <div className="admin-properties__brand-divider" />

            <span>
              Panel administrativo
            </span>

          </div>


          <div className="admin-properties__user">

            <div className="admin-properties__avatar">

              {
                perfil?.fotoUrl
                  ? (

                    <img
                      src={
                        perfil.fotoUrl
                      }
                      alt={
                        perfil.nombre
                      }
                    />

                  )
                  : (

                    <span>

                      {
                        perfil?.nombre
                          ?.charAt(0)
                          .toUpperCase() ||
                        "A"
                      }

                    </span>

                  )
              }

            </div>


            <div className="admin-properties__user-info">

              <strong>

                {
                  perfil?.nombre ||
                  "Administrador"
                }

              </strong>

              <span>
                Administrador
              </span>

            </div>


            <button
              type="button"
              className="admin-properties__logout"
              onClick={
                cerrarSesion
              }
              disabled={
                cerrandoSesion
              }
              title="Cerrar sesión"
            >

              <LogOut
                size={18}
              />

              <span>

                {
                  cerrandoSesion
                    ? "Saliendo..."
                    : "Salir"
                }

              </span>

            </button>

          </div>

        </div>

      </header>


      {/* =====================================
          CONTENIDO
          ===================================== */}

      <div className="admin-properties__container">

        {/* ===================================
            ENCABEZADO
            =================================== */}

        <section className="admin-properties__heading">

          <div>

            <span className="admin-properties__eyebrow">
              Gestión de inmuebles
            </span>

            <h1>
              Propiedades
            </h1>

            <p>
              Administra las propiedades
              disponibles, ofertas y ventas.
            </p>

          </div>


          <button
            type="button"
            className="admin-properties__add"
            onClick={
              agregarPropiedad
            }
          >

            <Plus
              size={19}
            />

            Agregar propiedad

          </button>

        </section>


        {/* ===================================
            ESTADÍSTICAS
            =================================== */}

        <section className="admin-properties__stats">

          <article className="admin-stat">

            <div className="admin-stat__icon admin-stat__icon--total">

              <Building2
                size={21}
              />

            </div>

            <div>

              <strong>
                {total}
              </strong>

              <span>
                Propiedades
              </span>

            </div>

          </article>


          <article className="admin-stat">

            <div className="admin-stat__icon admin-stat__icon--available">

              <CheckCircle2
                size={21}
              />

            </div>

            <div>

              <strong>
                {disponibles}
              </strong>

              <span>
                Disponibles
              </span>

            </div>

          </article>


          <article className="admin-stat">

            <div className="admin-stat__icon admin-stat__icon--offer">

              <Tag
                size={21}
              />

            </div>

            <div>

              <strong>
                {ofertas}
              </strong>

              <span>
                En oferta
              </span>

            </div>

          </article>


          <article className="admin-stat">

            <div className="admin-stat__icon admin-stat__icon--sold">

              <CircleDollarSign
                size={21}
              />

            </div>

            <div>

              <strong>
                {vendidas}
              </strong>

              <span>
                Vendidas
              </span>

            </div>

          </article>

        </section>


        {/* ===================================
            BUSCADOR Y FILTRO
            =================================== */}

        <section className="admin-properties__tools">

          <div className="admin-properties__search">

            <Search
              size={19}
            />

            <input
              type="search"
              placeholder="Buscar por nombre o ubicación..."
              value={
                busqueda
              }
              onChange={
                (event) =>
                  setBusqueda(
                    event.target.value
                  )
              }
            />

          </div>


          <div className="admin-properties__filter">

            <SlidersHorizontal
              size={17}
            />

            <select
              value={
                filtro
              }
              onChange={
                (event) =>
                  setFiltro(
                    event.target.value as
                      | "todas"
                      | EstadoPropiedad
                  )
              }
            >

              <option value="todas">
                Todas
              </option>

              <option value="disponible">
                Disponibles
              </option>

              <option value="oferta">
                En oferta
              </option>

              <option value="vendida">
                Vendidas
              </option>

            </select>

          </div>

        </section>


        {/* ===================================
            LISTADO
            =================================== */}

        <section className="admin-properties__listing">

          <div className="admin-properties__listing-header">

            <div>

              <h2>
                Propiedades registradas
              </h2>

              <p>
                Consulta y administra los
                inmuebles registrados.
              </p>

            </div>


            {
              !cargandoPropiedades && (

                <span className="admin-properties__results">

                  {
                    propiedadesFiltradas.length
                  }

                  {
                    propiedadesFiltradas.length ===
                      1
                      ? " resultado"
                      : " resultados"
                  }

                </span>

              )
            }

          </div>


          {/* =================================
              CARGANDO
              ================================= */}

          {
            cargandoPropiedades && (

              <div className="admin-properties__empty">

                <div className="admin-properties__empty-icon">

                  <Building2
                    size={27}
                  />

                </div>

                <h3>
                  Cargando propiedades...
                </h3>

                <p>
                  Estamos consultando las
                  propiedades registradas.
                </p>

              </div>

            )
          }


          {/* =================================
              ERROR
              ================================= */}

          {
            !cargandoPropiedades &&
            errorPropiedades && (

              <div className="admin-properties__empty">

                <div className="admin-properties__empty-icon">

                  <Search
                    size={27}
                  />

                </div>

                <h3>
                  No pudimos cargar las propiedades
                </h3>

                <p>
                  {
                    errorPropiedades
                  }
                </p>

              </div>

            )
          }


          {/* =================================
              PROPIEDADES
              ================================= */}

          {
            !cargandoPropiedades &&
            !errorPropiedades &&
            propiedadesFiltradas.length >
              0 && (

              <div className="admin-properties__grid">

                {
                  propiedadesFiltradas.map(
                    (propiedad) => (

                      <article
                        className="admin-property-card"
                        key={
                          propiedad.id
                        }
                      >

                        {/* =====================
                            IMAGEN
                            ===================== */}

                        <div className="admin-property-card__image">

                          {
                            propiedad.imagen
                              ? (

                                <img
                                  src={
                                    propiedad.imagen
                                  }
                                  alt={
                                    propiedad.titulo
                                  }
                                />

                              )
                              : (

                                <div className="admin-property-card__no-image">

                                  <Images
                                    size={30}
                                  />

                                  <span>
                                    Sin imagen
                                  </span>

                                </div>

                              )
                          }


                          <span
                            className={`
                              admin-property-card__status
                              admin-property-card__status--${propiedad.estado}
                            `}
                          >

                            {
                              propiedad.estado ===
                                "disponible"
                                ? "Disponible"
                                : propiedad.estado ===
                                    "oferta"
                                  ? "En oferta"
                                  : "Vendida"
                            }

                          </span>

                        </div>


                        {/* =====================
                            CONTENIDO
                            ===================== */}

                        <div className="admin-property-card__content">

                          <h3>
                            {
                              propiedad.titulo
                            }
                          </h3>


                          <div className="admin-property-card__location">

                            <MapPin
                              size={15}
                            />

                            <span>
                              {
                                propiedad.ubicacion
                              }
                            </span>

                          </div>


                          <div className="admin-property-card__footer">

                            <div className="admin-property-card__price">

                              {
                                propiedad.estado ===
                                  "oferta" &&
                                propiedad.precioOferta
                                  ? (

                                    <>

                                      <span>
                                        Precio de oferta
                                      </span>

                                      <strong>

                                        ₡

                                        {
                                          propiedad
                                            .precioOferta
                                            .toLocaleString(
                                              "es-CR"
                                            )
                                        }

                                      </strong>

                                    </>

                                  )
                                  : (

                                    <>

                                      <span>
                                        Precio
                                      </span>

                                      <strong>

                                        ₡

                                        {
                                          propiedad
                                            .precio
                                            .toLocaleString(
                                              "es-CR"
                                            )
                                        }

                                      </strong>

                                    </>

                                  )
                              }

                            </div>


                            <button
                              type="button"
                              className="admin-property-card__edit"
                              onClick={
                                () =>
                                  editarPropiedad(
                                    propiedad.id
                                  )
                              }
                            >

                              {
                                propiedad.estado ===
                                  "vendida"
                                  ? "Ver detalles"
                                  : "Editar"
                              }

                            </button>

                          </div>

                        </div>

                      </article>

                    )
                  )
                }

              </div>

            )
          }


          {/* =================================
              SIN RESULTADOS
              ================================= */}

          {
            !cargandoPropiedades &&
            !errorPropiedades &&
            propiedadesFiltradas.length ===
              0 && (

              <div className="admin-properties__empty">

                <div className="admin-properties__empty-icon">

                  <Search
                    size={27}
                  />

                </div>

                <h3>
                  No encontramos propiedades
                </h3>

                <p>
                  {
                    propiedades.length === 0
                      ? "Todavía no hay propiedades registradas."
                      : "Intenta utilizar otro término de búsqueda o cambia el filtro."
                  }
                </p>

              </div>

            )
          }

        </section>

      </div>

    </main>

  );

}