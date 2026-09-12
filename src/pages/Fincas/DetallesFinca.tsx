import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Bath,
  BedDouble,
  CircleDollarSign,
  LandPlot,
  MapPin,
  MessageCircle,
  Mountain,
  X,
} from "lucide-react";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  db,
} from "../../api/firebase";

import type {
  PropiedadPublica,
  EstadoPropiedad,
} from "../../types/property.types";

import "./DetallesFinca.css";


export default function DetallesFinca() {

  const navigate =
    useNavigate();

  const {
    propiedadId,
  } =
    useParams<{
      propiedadId: string;
    }>();


  const [
    propiedad,
    setPropiedad,
  ] =
    useState<PropiedadPublica | null>(
      null
    );


  const [
    cargando,
    setCargando,
  ] =
    useState(true);


  const [
    imagenSeleccionada,
    setImagenSeleccionada,
  ] =
    useState<string | null>(
      null
    );

    useEffect(() => {

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });

  }, [propiedadId]);


  useEffect(
    () => {

      if (!propiedadId) {
        setCargando(false);
        return;
      }


      const cargar =
        async (): Promise<void> => {

          try {

            const referencia =
              doc(
                db,
                "propiedades",
                propiedadId
              );


            const snapshot =
              await getDoc(
                referencia
              );


            if (
              !snapshot.exists()
            ) {

              setPropiedad(null);

              return;
            }


            const datos =
              snapshot.data();


            if (
              datos.visible === false
            ) {

              setPropiedad(
                null
              );

              return;
            }


            /*
             * Importante:
             *
             * Solo cargamos el documento
             * público "propiedades".
             *
             * NO cargamos ventas/{id}.
             */

            const estado:
              EstadoPropiedad =
                datos.estado === "vendida"
                  ? "vendida"
                  : datos.estado === "oferta"
                    ? "oferta"
                    : "disponible";


            setPropiedad({

              id:
                snapshot.id,

              titulo:
                datos.titulo ?? "",

              tipoPropiedad:
                datos.tipoPropiedad ??
                "finca",

              precio:
                datos.precio ?? 0,

              precioOferta:
                datos.precioOferta ??
                null,

              ubicacion: {
                provincia:
                  datos.ubicacion
                    ?.provincia ?? "",

                canton:
                  datos.ubicacion
                    ?.canton ?? "",

                distrito:
                  datos.ubicacion
                    ?.distrito ?? "",

                direccion:
                  datos.ubicacion
                    ?.direccion ?? "",
              },

              area: {
                valor:
                  datos.area
                    ?.valor ?? null,

                unidad:
                  datos.area
                    ?.unidad ?? "",
              },

              caracteristicas: {

                topografia:
                  datos.caracteristicas
                    ?.topografia ?? "",

                zonificacion:
                  datos.caracteristicas
                    ?.zonificacion ?? "",

                servicios:
                  datos.caracteristicas
                    ?.servicios ?? "",

                acceso:
                  datos.caracteristicas
                    ?.acceso ?? "",

                habitaciones:
                  datos.caracteristicas
                    ?.habitaciones ??
                  null,

                banos:
                  datos.caracteristicas
                    ?.banos ??
                  null,
              },

              descripcion:
                datos.descripcion ?? "",

              estado,

              destacada:
                datos.destacada === true,

              visible:
                datos.visible !== false,

              imagenPrincipal:
                datos.imagenPrincipal ??
                null,

              imagenesSecundarias:
                Array.isArray(
                  datos.imagenesSecundarias
                )
                  ? datos.imagenesSecundarias
                  : [],
            });


          } catch (error) {

            console.error(
              "Error cargando propiedad:",
              error
            );

          } finally {

            setCargando(
              false
            );

          }

        };


      void cargar();

    },
    [
      propiedadId,
    ]
  );


  if (
    cargando
  ) {

    return (
      <main className="property-detail-loading">
        Cargando propiedad...
      </main>
    );

  }


  if (
    !propiedad
  ) {

    return (
      <main className="property-detail-loading">

        <h1>
          Propiedad no encontrada
        </h1>

        <button
          type="button"
          onClick={
            () =>
              navigate(
                "/fincas"
              )
          }
        >
          Regresar
        </button>

      </main>
    );

  }


  const ubicacion =
    [
      propiedad.ubicacion.distrito,
      propiedad.ubicacion.canton,
      propiedad.ubicacion.provincia,
    ]
      .filter(Boolean)
      .join(", ");


  const precioMostrar =
    propiedad.estado === "oferta" &&
    propiedad.precioOferta
      ? propiedad.precioOferta
      : propiedad.precio;


  const enviarWhatsApp =
    (): void => {

      const telefono =
        "50684337225";


      const mensaje =
`¡Hola! 👋

Estoy interesado en obtener más información sobre la propiedad *${propiedad.titulo}*.

📍 Ubicación: ${ubicacion || "Consultar"}
🌿 Tipo: ${propiedad.tipoPropiedad}
📐 Área: ${
  propiedad.area.valor
    ? `${propiedad.area.valor} ${propiedad.area.unidad}`
    : "Consultar"
}
💰 Precio: ${
  propiedad.estado === "vendida"
    ? "Propiedad vendida"
    : new Intl.NumberFormat(
        "es-CR",
        {
          style: "currency",
          currency: "CRC",
          maximumFractionDigits: 0,
        }
      ).format(
        precioMostrar
      )
}

Me gustaría recibir más información. Gracias.`;


      const url =
        `https://api.whatsapp.com/send?phone=${telefono}&text=${encodeURIComponent(
          mensaje
        )}`;


      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );

    };


  return (

    <main className="property-detail">

      {/* HERO */}

      <section className="property-detail__hero">

        {propiedad.imagenPrincipal && (

          <img
            src={
              propiedad
                .imagenPrincipal
                .url
            }
            alt={
              propiedad.titulo
            }
            className="property-detail__hero-image"
          />

        )}


        <div className="property-detail__gradient" />


        <button
          type="button"
          className="property-detail__back"
          onClick={
            () =>
              navigate(
                -1
              )
          }
        >

          <ArrowLeft
            size={20}
          />

          Regresar

        </button>


        <div className="property-detail__hero-content">

          <span
            className={
              `property-detail__status property-detail__status--${propiedad.estado}`
            }
          >
            {
              propiedad.estado ===
              "vendida"
                ? "Vendida"
                : propiedad.estado ===
                    "oferta"
                  ? "En oferta"
                  : "Disponible"
            }
          </span>


          <h1>
            {propiedad.titulo}
          </h1>


          <div className="property-detail__location">

            <MapPin
              size={19}
            />

            {ubicacion}

          </div>


          {propiedad.estado !==
            "vendida" && (

            <div className="property-detail__price">

              <CircleDollarSign
                size={23}
              />

              <span>
                {new Intl.NumberFormat(
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
                  precioMostrar
                )}
              </span>

            </div>

          )}

        </div>

      </section>


      {/* INFORMACIÓN */}

      <section className="property-detail__body">

        <div className="property-detail__features">

          {propiedad.area.valor && (

            <div className="property-detail__feature">

              <LandPlot />

              <span>
                Área
              </span>

              <strong>
                {propiedad.area.valor}
                {" "}
                {propiedad.area.unidad}
              </strong>

            </div>

          )}


          {propiedad.caracteristicas
            .habitaciones !==
            null && (

            <div className="property-detail__feature">

              <BedDouble />

              <span>
                Habitaciones
              </span>

              <strong>
                {
                  propiedad
                    .caracteristicas
                    .habitaciones
                }
              </strong>

            </div>

          )}


          {propiedad.caracteristicas
            .banos !==
            null && (

            <div className="property-detail__feature">

              <Bath />

              <span>
                Baños
              </span>

              <strong>
                {
                  propiedad
                    .caracteristicas
                    .banos
                }
              </strong>

            </div>

          )}


          {propiedad.caracteristicas
            .topografia && (

            <div className="property-detail__feature">

              <Mountain />

              <span>
                Topografía
              </span>

              <strong>
                {
                  propiedad
                    .caracteristicas
                    .topografia
                }
              </strong>

            </div>

          )}

        </div>


        <article className="property-detail__description">

          <span>
            CONOCE ESTA PROPIEDAD
          </span>

          <h2>
            Un espacio para disfrutar
            de la naturaleza
          </h2>

          <p>
            {propiedad.descripcion}
          </p>

        </article>


        {/* DETALLES */}

        <section className="property-detail__information">

          <h2>
            Detalles de la propiedad
          </h2>


          <div className="property-detail__information-grid">

            {propiedad.caracteristicas
              .zonificacion && (

              <div>
                <span>
                  Zonificación
                </span>

                <strong>
                  {
                    propiedad
                      .caracteristicas
                      .zonificacion
                  }
                </strong>
              </div>

            )}


            {propiedad.caracteristicas
              .servicios && (

              <div>
                <span>
                  Servicios
                </span>

                <strong>
                  {
                    propiedad
                      .caracteristicas
                      .servicios
                  }
                </strong>
              </div>

            )}


            {propiedad.caracteristicas
              .acceso && (

              <div>
                <span>
                  Acceso
                </span>

                <strong>
                  {
                    propiedad
                      .caracteristicas
                      .acceso
                  }
                </strong>
              </div>

            )}

          </div>

        </section>


        {/* GALERÍA */}

        {propiedad
          .imagenesSecundarias
          .length > 0 && (

          <section className="property-detail__gallery">

            <h2>
              Conoce cada rincón
            </h2>


            <div className="property-detail__gallery-grid">

              {propiedad
                .imagenesSecundarias
                .map(
                  (
                    imagen,
                    index
                  ) => (

                    <button
                      key={
                        `${imagen.url}-${index}`
                      }
                      type="button"
                      onClick={
                        () =>
                          setImagenSeleccionada(
                            imagen.url
                          )
                      }
                    >

                      <img
                        src={
                          imagen.url
                        }
                        alt={
                          `${propiedad.titulo} ${index + 1}`
                        }
                      />

                    </button>

                  )
                )}

            </div>

          </section>

        )}


        {/* CTA */}

        <section className="property-detail__contact">

          <span>
            ¿QUIERES SABER MÁS?
          </span>

          <h2>
            Conversemos sobre esta
            propiedad
          </h2>


          <button
            type="button"
            onClick={
              enviarWhatsApp
            }
          >

            <MessageCircle
              size={21}
            />

            Preguntar por WhatsApp

          </button>

        </section>

      </section>


      {/* VISOR GALERÍA */}

      {imagenSeleccionada && (

        <div
          className="property-detail__viewer"
          onClick={
            () =>
              setImagenSeleccionada(
                null
              )
          }
        >

          <button
            type="button"
            onClick={
              () =>
                setImagenSeleccionada(
                  null
                )
            }
          >
            <X />
          </button>


          <img
            src={
              imagenSeleccionada
            }
            alt={
              propiedad.titulo
            }
            onClick={
              (event) =>
                event.stopPropagation()
            }
          />

        </div>

      )}

    </main>

  );

}