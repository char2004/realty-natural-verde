import {
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";

import {
  useRef,
} from "react";

import "./SoldCarousel.css";

import finca1
  from "../../assets/logo-natura-verde.png";

import finca2
  from "../../assets/logo-natura-verde.png";

import finca3
  from "../../assets/logo-natura-verde.png";

import finca4
  from "../../assets/logo-natura-verde.png";

import finca5
  from "../../assets/logo-natura-verde.png";


interface PropiedadVendida {
  id: number;
  nombre: string;
  ubicacion: string;
  imagen: string;
  mensaje: string;
}


const propiedadesVendidas: PropiedadVendida[] = [
  {
    id: 1,
    nombre: "Finca El Roble",
    ubicacion: "San Carlos, Alajuela",
    imagen: finca1,
    mensaje:
      "El lugar perfecto para nuestra familia. Gracias por hacerlo posible.",
  },

  {
    id: 2,
    nombre: "Terreno Vista Verde",
    ubicacion: "Tilarán, Guanacaste",
    imagen: finca2,
    mensaje:
      "Hoy disfrutamos de la paz que siempre buscamos.",
  },

  {
    id: 3,
    nombre: "Finca La Esperanza",
    ubicacion: "San Mateo, Alajuela",
    imagen: finca3,
    mensaje:
      "Encontramos una propiedad con todo lo que necesitábamos.",
  },

  {
    id: 4,
    nombre: "Quinta Los Sueños",
    ubicacion: "Pérez Zeledón, San José",
    imagen: finca4,
    mensaje:
      "Más que una finca, encontramos un estilo de vida.",
  },

  {
    id: 5,
    nombre: "Finca Bosque Vivo",
    ubicacion: "Grecia, Alajuela",
    imagen: finca5,
    mensaje:
      "Una oportunidad que se convirtió en nuestro nuevo hogar.",
  },
];


export default function SoldCarousel() {

  const carruselRef =
    useRef<HTMLDivElement>(null);


  const desplazar = (
    direccion: "izquierda" | "derecha"
  ) => {

    const carrusel =
      carruselRef.current;

    if (!carrusel) {
      return;
    }

    const cantidad = 340;

    carrusel.scrollBy({
      left:
        direccion === "derecha"
          ? cantidad
          : -cantidad,

      behavior: "smooth",
    });
  };


  return (
    <section
      className="sold"
      id="historias"
    >

      <div className="sold__fondoDecorativo" />

      <div className="sold__contenedor">


        {/* =========================
            TEXTO IZQUIERDO
        ========================= */}

        <div className="sold__introduccion">

          <span className="sold__icono">
            ♧
          </span>

          <span className="sold__eyebrow">
            HISTORIAS REALES
          </span>

          <h2 className="sold__titulo">
            Historias que ya son
            <span>
              hogar
            </span>
          </h2>

          <p className="sold__descripcion">
            Propiedades vendidas,
            sueños hechos realidad.
            Cada espacio encuentra
            su historia.
          </p>

          <a
            href="/fincas"
            className="sold__enlace"
          >
            Ver más historias

            <ChevronRight size={18} />
          </a>

        </div>


        {/* =========================
            CARRUSEL
        ========================= */}

        <div className="sold__zonaCarrusel">

          <button
            type="button"
            className="
              sold__flecha
              sold__flecha--izquierda
            "
            onClick={() =>
              desplazar("izquierda")
            }
            aria-label="Anterior"
          >
            <ChevronLeft size={22} />
          </button>


          <div
            ref={carruselRef}
            className="sold__carrusel"
          >

            {propiedadesVendidas.map(
              (propiedad) => (

                <article
                  key={propiedad.id}
                  className="soldCard"
                >

                  <div className="soldCard__imagenContenedor">

                    <img
                      src={propiedad.imagen}
                      alt={propiedad.nombre}
                      className="soldCard__imagen"
                    />

                    <span className="soldCard__estado">
                      VENDIDA
                    </span>

                  </div>


                  <div className="soldCard__contenido">

                    <h3 className="soldCard__nombre">
                      {propiedad.nombre}
                    </h3>

                    <p className="soldCard__mensaje">
                      “{propiedad.mensaje}”
                    </p>

                    <div className="soldCard__ubicacion">

                      <MapPin size={15} />

                      <span>
                        {propiedad.ubicacion}
                      </span>

                    </div>

                  </div>

                </article>

              )
            )}

          </div>


          <button
            type="button"
            className="
              sold__flecha
              sold__flecha--derecha
            "
            onClick={() =>
              desplazar("derecha")
            }
            aria-label="Siguiente"
          >
            <ChevronRight size={22} />
          </button>

        </div>

      </div>

    </section>
  );
}