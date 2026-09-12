import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  useRef,
} from "react";

import {
  Link,
} from "react-router-dom";

import PropertyCard, {
  type PropertyCardData,
} from "../PropertyCard/PropertyCard";

import "./PropertyCarousel.css";


interface PropertyCarouselProps {
  titulo: string;
  destacado: string;
  descripcion: string;
  propiedades: PropertyCardData[];

  variante?:
    | "recientes"
    | "ofertas";
}


export default function PropertyCarousel({
  titulo,
  destacado,
  descripcion,
  propiedades,
  variante = "recientes",
}: PropertyCarouselProps) {

  const carruselRef =
    useRef<HTMLDivElement>(null);


  const mover = (
    direccion:
      | "izquierda"
      | "derecha"
  ): void => {

    if (!carruselRef.current) {
      return;
    }

    carruselRef.current.scrollBy({
      left:
        direccion === "derecha"
          ? 330
          : -330,

      behavior:
        "smooth",
    });

  };


  /*
   * Si no llegan propiedades,
   * no mostramos una sección vacía.
   */

  if (
    propiedades.length === 0
  ) {
    return null;
  }


  return (

    <section
      className={`
        propertyCarousel
        propertyCarousel--${variante}
      `}
    >

      <div
        className="propertyCarousel__decoracion"
      />


      <div
        className="propertyCarousel__contenedor"
      >

        {/* =========================
            ENCABEZADO
        ========================= */}

        <div
          className="propertyCarousel__encabezado"
        >

          <div>

            <span
              className="propertyCarousel__eyebrow"
            >

              {variante === "ofertas"
                ? "OPORTUNIDADES"
                : "DESCUBRE"
              }

            </span>


            <h2
              className="propertyCarousel__titulo"
            >

              {titulo}

              <span>
                {destacado}
              </span>

            </h2>


            <p
              className="propertyCarousel__descripcion"
            >
              {descripcion}
            </p>

          </div>


          <Link
            to="/fincas"
            className="propertyCarousel__verTodas"
          >
            Ver todas
          </Link>

        </div>


        {/* =========================
            CARRUSEL
        ========================= */}

        <div
          className="propertyCarousel__zona"
        >

          <button
            type="button"
            className="
              propertyCarousel__flecha
              propertyCarousel__flecha--izquierda
            "
            onClick={
              () =>
                mover(
                  "izquierda"
                )
            }
            aria-label="Anterior"
          >

            <ChevronLeft
              size={23}
            />

          </button>


          <div
            ref={carruselRef}
            className="propertyCarousel__lista"
          >

            {propiedades.map(
              (propiedad) => (

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


          <button
            type="button"
            className="
              propertyCarousel__flecha
              propertyCarousel__flecha--derecha
            "
            onClick={
              () =>
                mover(
                  "derecha"
                )
            }
            aria-label="Siguiente"
          >

            <ChevronRight
              size={23}
            />

          </button>

        </div>

      </div>

    </section>

  );

}