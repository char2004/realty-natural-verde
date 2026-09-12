import {
  ArrowRight,
  Leaf,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import PropertyCard, {
  type PropertyCardData,
} from "../PropertyCard/PropertyCard";

import "./PropertyPreview.css";


interface PropertyPreviewProps {
  propiedades: PropertyCardData[];
}


export default function PropertyPreview({
  propiedades,
}: PropertyPreviewProps) {

  /*
   * Home ya envía únicamente:
   *
   * - disponibles
   * - ofertas
   *
   * Las vendidas no llegan a este componente.
   *
   * Aquí solo mostramos las primeras 6.
   */

  const propiedadesVisibles =
    propiedades.slice(
      0,
      6
    );


  /*
   * Si no hay propiedades disponibles,
   * no mostramos toda la sección.
   */

  if (
    propiedadesVisibles.length === 0
  ) {
    return null;
  }


  return (

    <section
      className="propertyPreview"
      id="propiedades"
    >

      {/* =========================
          DECORACIONES
      ========================= */}

      <div
        className="
          propertyPreview__forma
          propertyPreview__forma--izquierda
        "
      />

      <div
        className="
          propertyPreview__forma
          propertyPreview__forma--derecha
        "
      />


      <div
        className="propertyPreview__contenedor"
      >

        {/* =========================
            ENCABEZADO
        ========================= */}

        <div
          className="propertyPreview__encabezado"
        >

          <div
            className="propertyPreview__icono"
          >

            <Leaf
              size={21}
            />

          </div>


          <span
            className="propertyPreview__eyebrow"
          >
            ENCUENTRA TU LUGAR
          </span>


          <h2
            className="propertyPreview__titulo"
          >

            Explora nuestras

            <span>
              propiedades disponibles
            </span>

          </h2>


          <p
            className="propertyPreview__descripcion"
          >

            Descubre fincas y terrenos
            seleccionados en distintas
            regiones de Costa Rica.

            Encuentra una oportunidad
            para invertir, construir
            o comenzar una nueva historia.

          </p>

        </div>


        {/* =========================
            CUADRÍCULA
        ========================= */}

        <div
          className="propertyPreview__grid"
        >

          {propiedadesVisibles.map(
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


        {/* =========================
            BOTÓN FINAL
        ========================= */}

        <div
          className="propertyPreview__acciones"
        >

          <p>
            ¿Quieres conocer todas
            las oportunidades disponibles?
          </p>


          <Link
            to="/fincas"
            className="propertyPreview__boton"
          >

            Ver todas las propiedades

            <ArrowRight
              size={18}
            />

          </Link>

        </div>

      </div>

    </section>

  );

}