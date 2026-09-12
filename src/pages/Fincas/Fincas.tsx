import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  SlidersHorizontal,
  X,
  Sparkles,
  Home as HomeIcon,
  ArrowUpDown,
} from "lucide-react";

import {
  collection,
  onSnapshot,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import Header
  from "../../components/Header/Header";

import PropertyCard, {
  type PropertyCardData,
} from "../../components/PropertyCard/PropertyCard";

import {
  db,
} from "../../api/firebase";

import "./Fincas.css";


/* =========================================
   TIPOS
========================================= */

type FiltroEstado =
  | "todas"
  | "oferta";


type OrdenPropiedades =
  | "recientes"
  | "precio-menor"
  | "precio-mayor"
  | "nombre";


interface PropiedadCatalogo
  extends PropertyCardData {

  creadoEn: number;

  provincia: string;
  canton: string;
  distrito: string;

  precioNumerico: number;
}


/* =========================================
   COMPONENTE
========================================= */

export default function Fincas() {

  /* =======================================
     ESTADOS
  ======================================= */

  const [
    propiedades,
    setPropiedades,
  ] =
    useState<PropiedadCatalogo[]>(
      []
    );


  const [
    cargando,
    setCargando,
  ] =
    useState(true);


  const [
    error,
    setError,
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
    filtroEstado,
    setFiltroEstado,
  ] =
    useState<FiltroEstado>(
      "todas"
    );


  const [
    orden,
    setOrden,
  ] =
    useState<OrdenPropiedades>(
      "recientes"
    );


  const [
    mostrarFiltrosMovil,
    setMostrarFiltrosMovil,
  ] =
    useState(false);


  /* =======================================
     CARGAR FIRESTORE
  ======================================= */

  useEffect(
    () => {

      const referencia =
        collection(
          db,
          "propiedades"
        );


      const cancelar =
        onSnapshot(
          referencia,

          (
            snapshot
          ) => {

            const lista:
              PropiedadCatalogo[] =
                snapshot.docs
                  .map(
                    convertirDocumento
                  )
                  .filter(
                    (
                      propiedad
                    ):
                      propiedad is
                      PropiedadCatalogo =>
                        propiedad !==
                        null
                  );


            /*
             * Orden inicial:
             * más nuevas primero.
             */

            lista.sort(
              (
                a,
                b
              ) =>
                b.creadoEn -
                a.creadoEn
            );


            setPropiedades(
              lista
            );

            setCargando(
              false
            );

            setError(
              null
            );

          },

          (
            errorFirestore
          ) => {

            console.error(
              "Error cargando propiedades:",
              errorFirestore
            );


            setError(
              "No fue posible cargar las propiedades."
            );

            setCargando(
              false
            );

          }
        );


      return () => {
        cancelar();
      };

    },
    []
  );


  /* =======================================
     FILTRAR PROPIEDADES
  ======================================= */

  const propiedadesFiltradas =
    useMemo(
      () => {

        const termino =
          normalizarTexto(
            busqueda
          );


        let resultado =
          [...propiedades];


        /* =================================
           FILTRO POR ESTADO
        ================================= */

        if (
          filtroEstado ===
          "oferta"
        ) {

          resultado =
            resultado.filter(
              (
                propiedad
              ) =>
                propiedad.estado ===
                "oferta"
            );

        }


        /* =================================
           BÚSQUEDA
        ================================= */

        if (
          termino
        ) {

          resultado =
            resultado.filter(
              (
                propiedad
              ) => {

                const textoBusqueda =
                  normalizarTexto(
                    [
                      propiedad.nombre,
                      propiedad.ubicacion,
                      propiedad.provincia,
                      propiedad.canton,
                      propiedad.distrito,
                      propiedad.precio,
                      propiedad.precioAnterior ??
                        "",
                      propiedad.precioNumerico
                        .toString(),
                    ].join(
                      " "
                    )
                  );


                return (
                  textoBusqueda.includes(
                    termino
                  )
                );

              }
            );

        }


        /* =================================
           ORDENAMIENTO
        ================================= */

        resultado.sort(
          (
            a,
            b
          ) => {

            switch (
              orden
            ) {

              case "precio-menor":

                return (
                  a.precioNumerico -
                  b.precioNumerico
                );


              case "precio-mayor":

                return (
                  b.precioNumerico -
                  a.precioNumerico
                );


              case "nombre":

                return (
                  a.nombre.localeCompare(
                    b.nombre,
                    "es",
                    {
                      sensitivity:
                        "base",
                    }
                  )
                );


              case "recientes":
              default:

                return (
                  b.creadoEn -
                  a.creadoEn
                );

            }

          }
        );


        return resultado;

      },
      [
        propiedades,
        busqueda,
        filtroEstado,
        orden,
      ]
    );


  /* =======================================
     CONTADORES
  ======================================= */

  const cantidadTodas =
    useMemo(
      () => {
        return propiedades.length;
      },
      [propiedades]
    );


  const cantidadOfertas =
    useMemo(
      () => {
        return propiedades.filter(
          (propiedad) =>
            propiedad.estado === "oferta"
        ).length;
      },
      [propiedades]
    );


  /* =======================================
     SABER SI HAY FILTROS
  ======================================= */

  const hayFiltrosActivos =
    busqueda.trim()
      .length > 0 ||
    filtroEstado !==
      "todas" ||
    orden !==
      "recientes";


  /* =======================================
     LIMPIAR FILTROS
  ======================================= */

  const limpiarFiltros =
    (): void => {

      setBusqueda("");

      setFiltroEstado(
        "todas"
      );

      setOrden(
        "recientes"
      );

    };


  return (

    <>

      <Header />


      <main
        className="fincas"
      >

        {/* =================================
            HERO / ENCABEZADO
        ================================= */}

        <section
          className="fincas__hero"
        >

          <div
            className="fincas__hero-decoracion fincas__hero-decoracion--uno"
          />

          <div
            className="fincas__hero-decoracion fincas__hero-decoracion--dos"
          />


          <div
            className="fincas__hero-contenido"
          >

            <span
              className="fincas__eyebrow"
            >

              <Sparkles
                size={15}
              />

              PROPIEDADES EN COSTA RICA

            </span>


            <h1>

              Encuentra un lugar

              <span>
                para tu próxima historia
              </span>

            </h1>


            <p>

              Explora fincas,
              terrenos y propiedades
              seleccionadas en distintas
              regiones de Costa Rica.

            </p>


            {/* =============================
                RESUMEN
            ============================= */}

            <div
              className="fincas__resumen"
            >

              <div>

                <HomeIcon
                  size={20}
                />

                <strong>
                  {cantidadTodas}
                </strong>

                <span>
                  disponibles
                </span>

              </div>


              <div>

                <Sparkles
                  size={20}
                />

                <strong>
                  {cantidadOfertas}
                </strong>

                <span>
                  en oferta
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* =================================
            CONTENIDO PRINCIPAL
        ================================= */}

        <section
          className="fincas__contenido"
        >

          {/* =================================
              FILTROS
          ================================= */}

          <div
            className="fincas__filtros"
          >

            {/* ===============================
                BUSCADOR
            =============================== */}

            <div
              className="fincas__buscador"
            >

              <Search
                size={19}
              />


              <input
                type="text"
                value={
                  busqueda
                }
                onChange={
                  (
                    event
                  ) =>
                    setBusqueda(
                      event
                        .target
                        .value
                    )
                }
                placeholder="Buscar por nombre, ubicación o precio..."
                aria-label="Buscar propiedades"
              />


              {busqueda && (

                <button
                  type="button"
                  className="fincas__buscador-limpiar"
                  onClick={
                    () =>
                      setBusqueda(
                        ""
                      )
                  }
                  aria-label="Limpiar búsqueda"
                >

                  <X
                    size={17}
                  />

                </button>

              )}

            </div>


            {/* ===============================
                BOTÓN FILTROS MÓVIL
            =============================== */}

            <button
              type="button"
              className="fincas__filtros-movil-boton"
              onClick={
                () =>
                  setMostrarFiltrosMovil(
                    (
                      valor
                    ) =>
                      !valor
                  )
              }
            >

              <SlidersHorizontal
                size={18}
              />

              Filtros

            </button>


            {/* ===============================
                CONTROLES
            =============================== */}

            <div
              className={
                `
                  fincas__controles

                  ${
                    mostrarFiltrosMovil
                      ? "fincas__controles--visible"
                      : ""
                  }
                `
              }
            >

              {/* =============================
                  ESTADO
              ============================= */}

              <div
                className="fincas__filtro-estados"
              >

                <button
                  type="button"
                  className={
                    filtroEstado ===
                    "todas"
                      ? "fincas__filtro-boton fincas__filtro-boton--activo"
                      : "fincas__filtro-boton"
                  }
                  onClick={
                    () =>
                      setFiltroEstado(
                        "todas"
                      )
                  }
                >

                  Todas

                  <span>
                    {
                      cantidadTodas
                    }
                  </span>

                </button>


                <button
                  type="button"
                  className={
                    filtroEstado ===
                    "oferta"
                      ? "fincas__filtro-boton fincas__filtro-boton--activo fincas__filtro-boton--oferta"
                      : "fincas__filtro-boton fincas__filtro-boton--oferta"
                  }
                  onClick={
                    () =>
                      setFiltroEstado(
                        "oferta"
                      )
                  }
                >

                  En oferta

                  <span>
                    {
                      cantidadOfertas
                    }
                  </span>

                </button>

              </div>


              {/* =============================
                  ORDENAR
              ============================= */}

              <div
                className="fincas__orden"
              >

                <ArrowUpDown
                  size={17}
                />

                <select
                  value={
                    orden
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setOrden(
                        event
                          .target
                          .value as
                          OrdenPropiedades
                      )
                  }
                  aria-label="Ordenar propiedades"
                >

                  <option
                    value="recientes"
                  >
                    Más recientes
                  </option>

                  <option
                    value="precio-menor"
                  >
                    Menor precio
                  </option>

                  <option
                    value="precio-mayor"
                  >
                    Mayor precio
                  </option>

                  <option
                    value="nombre"
                  >
                    Nombre A-Z
                  </option>

                </select>

              </div>

            </div>

          </div>


          {/* =================================
              ENCABEZADO RESULTADOS
          ================================= */}

          {!cargando &&
            !error && (

            <div
              className="fincas__resultados-header"
            >

              <div>

                <span>
                  {
                    propiedadesFiltradas
                      .length
                  }
                </span>

                <p>

                  {
                    propiedadesFiltradas
                      .length === 1
                      ? "propiedad encontrada"
                      : "propiedades encontradas"
                  }

                </p>

              </div>


              {hayFiltrosActivos && (

                <button
                  type="button"
                  className="fincas__limpiar-filtros"
                  onClick={
                    limpiarFiltros
                  }
                >

                  <X
                    size={15}
                  />

                  Limpiar filtros

                </button>

              )}

            </div>

          )}


          {/* =================================
              CARGANDO
          ================================= */}

          {cargando && (

            <div
              className="fincas__cargando"
            >

              <span
                className="fincas__loader"
              />

              <h2>
                Buscando propiedades
              </h2>

              <p>
                Estamos preparando
                las opciones disponibles.
              </p>

            </div>

          )}


          {/* =================================
              ERROR
          ================================= */}

          {!cargando &&
            error && (

            <div
              className="fincas__estado-vacio"
            >

              <div
                className="fincas__estado-vacio-icono"
              >

                <HomeIcon
                  size={28}
                />

              </div>


              <h2>
                No pudimos cargar
                las propiedades
              </h2>

              <p>
                {error}
              </p>

            </div>

          )}


          {/* =================================
              SIN RESULTADOS
          ================================= */}

          {!cargando &&
            !error &&
            propiedadesFiltradas
              .length === 0 && (

            <div
              className="fincas__estado-vacio"
            >

              <div
                className="fincas__estado-vacio-icono"
              >

                <Search
                  size={28}
                />

              </div>


              <h2>
                No encontramos
                propiedades
              </h2>


              <p>
                Intenta cambiar tu
                búsqueda o selecciona
                otros filtros.
              </p>


              {hayFiltrosActivos && (

                <button
                  type="button"
                  onClick={
                    limpiarFiltros
                  }
                >

                  Limpiar filtros

                </button>

              )}

            </div>

          )}


          {/* =================================
              GRID DE PROPIEDADES
          ================================= */}

          {!cargando &&
            !error &&
            propiedadesFiltradas
              .length > 0 && (

            <div
              className="fincas__grid"
            >

              {propiedadesFiltradas.map(
                (
                  propiedad
                ) => (

                  <PropertyCard
                    key={
                      propiedad.id
                    }
                    propiedad={
                      propiedad
                    }
                  />

                )
              )}

            </div>

          )}

        </section>

      </main>

    </>

  );

}


/* =========================================
   CONVERTIR DOCUMENTO FIRESTORE
========================================= */

function convertirDocumento(
  documento:
    QueryDocumentSnapshot<
      DocumentData
    >
): PropiedadCatalogo | null {

  const datos =
    documento.data();


  /*
   * Solo catálogo público.
   *
   * - visible !== false
   * - disponible
   * - oferta
   *
   * Nunca vendidas.
   */

  if (
    datos.visible === false
  ) {
    return null;
  }


  if (
    datos.estado !==
      "disponible" &&
    datos.estado !==
      "oferta"
  ) {
    return null;
  }


  /* =======================================
     UBICACIÓN
  ======================================= */

  const provincia =
    obtenerTexto(
      datos.ubicacion
        ?.provincia
    );


  const canton =
    obtenerTexto(
      datos.ubicacion
        ?.canton
    );


  const distrito =
    obtenerTexto(
      datos.ubicacion
        ?.distrito
    );


  const ubicacion =
    [
      distrito,
      canton,
      provincia,
    ]
      .filter(
        Boolean
      )
      .join(
        ", "
      ) ||
      "Costa Rica";


  /* =======================================
     PRECIO
  ======================================= */

  const precioNormal =
    convertirNumero(
      datos.precio
    );


  const precioOferta =
    datos.precioOferta !==
      null &&
    datos.precioOferta !==
      undefined &&
    datos.precioOferta !==
      ""

      ? convertirNumero(
          datos.precioOferta
        )

      : null;


  const estaEnOferta =
    datos.estado ===
      "oferta";


  const precioActual =
    estaEnOferta &&
    precioOferta !==
      null

      ? precioOferta

      : precioNormal;


  /* =======================================
     ÁREA
  ======================================= */

  const areaValor =
    datos.area?.valor !==
      null &&
    datos.area?.valor !==
      undefined

      ? datos.area.valor

      : null;


  const areaUnidad =
    obtenerTexto(
      datos.area
        ?.unidad
    );


  const area =
    areaValor !==
      null

      ? `${areaValor} ${areaUnidad}`.trim()

      : "Área por consultar";


  /* =======================================
     IMAGEN
  ======================================= */

  const imagen =
    obtenerTexto(
      datos.imagenPrincipal
        ?.url
    );


  /* =======================================
     FECHA
  ======================================= */

  const creadoEn =
    obtenerTimestamp(
      datos.creadoEn
    );


  return {

    id:
      documento.id,

    nombre:
      obtenerTexto(
        datos.titulo
      ) ||
      "Propiedad sin nombre",

    ubicacion,

    imagen,

    precio:
      formatearPrecio(
        precioActual
      ),

    precioAnterior:
      estaEnOferta &&
      precioOferta !==
        null &&
      precioNormal >
        precioOferta

        ? formatearPrecio(
            precioNormal
          )

        : undefined,

    area,

    estado:
      datos.estado,

    creadoEn,

    provincia,

    canton,

    distrito,

    precioNumerico:
      precioActual,

  };

}


/* =========================================
   UTILIDADES
========================================= */

function normalizarTexto(
  texto: string
): string {

  return texto
    .toLowerCase()
    .normalize(
      "NFD"
    )
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .trim();

}


function obtenerTexto(
  valor: unknown
): string {

  return typeof valor ===
    "string"
      ? valor.trim()
      : "";

}


function convertirNumero(
  valor: unknown
): number {

  if (
    typeof valor ===
    "number"
  ) {

    return Number.isFinite(
      valor
    )
      ? valor
      : 0;

  }


  if (
    typeof valor ===
    "string"
  ) {

    const limpio =
      valor
        .replace(
          /[^\d.,-]/g,
          ""
        )
        .replace(
          /,/g,
          ""
        );


    const numero =
      Number(
        limpio
      );


    return Number.isFinite(
      numero
    )
      ? numero
      : 0;

  }


  return 0;

}


function formatearPrecio(
  precio: number
): string {

  if (
    !Number.isFinite(
      precio
    ) ||
    precio <= 0
  ) {

    return "Consultar precio";

  }


  return new Intl.NumberFormat(
    "es-CR",
    {
      style:
        "currency",

      currency:
        "CRC",

      maximumFractionDigits:
        0,
    }
  ).format(
    precio
  );

}


function obtenerTimestamp(
  valor: unknown
): number {

  /*
   * Firestore Timestamp.
   */

  if (
    typeof valor ===
      "object" &&
    valor !== null &&
    "toMillis" in valor &&
    typeof (
      valor as {
        toMillis?: unknown;
      }
    ).toMillis ===
      "function"
  ) {

    return (
      valor as {
        toMillis:
          () => number;
      }
    ).toMillis();

  }


  /*
   * Fecha numérica por si
   * algún documento antiguo
   * utiliza timestamp normal.
   */

  if (
    typeof valor ===
    "number"
  ) {

    return valor;

  }


  return 0;

}