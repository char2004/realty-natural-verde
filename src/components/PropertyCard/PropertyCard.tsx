import {
  MapPin,
  Ruler,
  ArrowRight,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import "./PropertyCard.css";


export interface PropertyCardData {
  id: string;

  nombre: string;
  ubicacion: string;
  imagen: string;

  precio: string;
  area: string;

  estado:
    | "disponible"
    | "oferta"
    | "vendida";

  precioAnterior?: string;
}


interface PropertyCardProps {
  propiedad: PropertyCardData;
}


export default function PropertyCard({
  propiedad,
}: PropertyCardProps) {

  const navigate =
    useNavigate();


  const abrirPropiedad =
    (): void => {

      navigate(
        `/fincas/${propiedad.id}`
      );

    };


  const obtenerTextoEstado =
    (): string => {

      if (
        propiedad.estado ===
        "vendida"
      ) {
        return "VENDIDA";
      }

      if (
        propiedad.estado ===
        "oferta"
      ) {
        return "OFERTA";
      }

      return "DISPONIBLE";

    };


  const obtenerClaseEstado =
    (): string => {

      if (
        propiedad.estado ===
        "vendida"
      ) {
        return "propertyCard__estado--vendida";
      }

      if (
        propiedad.estado ===
        "oferta"
      ) {
        return "propertyCard__estado--oferta";
      }

      return "propertyCard__estado--disponible";

    };


  return (

    <article
      className="propertyCard"
    >

      {/* =========================
          IMAGEN
      ========================= */}

      <div
        className="propertyCard__imagenContenedor"
      >

        {propiedad.imagen ? (

          <img
            src={
              propiedad.imagen
            }
            alt={
              propiedad.nombre
            }
            className="propertyCard__imagen"
          />

        ) : (

          <div
            className="propertyCard__imagen propertyCard__imagen--vacia"
          />

        )}


        <span
          className={`
            propertyCard__estado
            ${obtenerClaseEstado()}
          `}
        >

          {obtenerTextoEstado()}

        </span>

      </div>


      {/* =========================
          INFORMACIÓN
      ========================= */}

      <div
        className="propertyCard__contenido"
      >

        <div
          className="propertyCard__ubicacion"
        >

          <MapPin
            size={15}
          />

          <span>
            {propiedad.ubicacion}
          </span>

        </div>


        <h3
          className="propertyCard__titulo"
        >
          {propiedad.nombre}
        </h3>


        {/* =========================
            PRECIO
        ========================= */}

        <div
          className="propertyCard__precio"
        >

          {propiedad.estado ===
            "vendida" ? (

            <strong>
              Propiedad vendida
            </strong>

          ) : (

            <>

              {propiedad.precioAnterior && (

                <span
                  className="propertyCard__precioAnterior"
                >
                  {propiedad.precioAnterior}
                </span>

              )}


              <strong>
                {propiedad.precio}
              </strong>

            </>

          )}

        </div>


        {/* =========================
            ÁREA
        ========================= */}

        <div
          className="propertyCard__detalles"
        >

          <div>

            <Ruler
              size={16}
            />

            <span>
              {propiedad.area}
            </span>

          </div>

        </div>


        {/* =========================
            BOTÓN
        ========================= */}

        <button
          type="button"
          className="propertyCard__boton"
          onClick={
            abrirPropiedad
          }
        >

          Ver propiedad

          <ArrowRight
            size={16}
          />

        </button>

      </div>

    </article>

  );

}