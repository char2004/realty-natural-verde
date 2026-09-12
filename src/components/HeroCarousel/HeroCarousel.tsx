import {
  useEffect,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

import hero1 from "../../assets/images/hero/finc1.jpeg";
import hero2 from "../../assets/images/hero/finc2.jpeg";
import hero3 from "../../assets/images/hero/finc3.jpeg";
import hero4 from "../../assets/images/hero/finc4.jpeg";

import "./HeroCarousel.css";

interface HeroSlide {
  imagen: string;
  subtitulo: string;
  titulo: string;
  destacado: string;
  descripcion: string;
}

const slides: HeroSlide[] = [
  {
    imagen: hero1,
    subtitulo: "UN NUEVO LUGAR TE ESPERA.....",
    titulo: "Estos espacios te permiten",
    destacado:
      "conectan tu espíritu con la naturaleza",
    descripcion:
      "Fincas, terrenos y oportunidades en algunos de los lugares más hermosos de Costa Rica.",
  },

  {
    imagen: hero2,
    subtitulo: "UNA INVERSIÓN QUE TRAE BENEFICIOS....",
    titulo: "Ofrecemos lugares que permiten",
    destacado:
      "construir nuevas historias",
    descripcion:
      "Espacios seleccionados para vivir, invertir, descansar o iniciar un nuevo proyecto.",
  },

  {
    imagen: hero3,
    subtitulo: "OPORTUNIDADES ÚNICAS",
    titulo: "Descubre tierras que",
    destacado:
      "inspiran",
    descripcion:
      "Propiedades rodeadas de naturaleza con ubicación, potencial y tranquilidad.",
  },

  {
    imagen: hero4,
    subtitulo: "ESTE SERÁ TU PRÓXIMO DESTINO",
    titulo: "Encuentra un espacio",
    destacado:
      "que realmente se sienta tuyo",
    descripcion:
      "Conoce fincas y terrenos con características únicas en distintas regiones del país.",
  },
];

export default function HeroCarousel() {

  const [indiceActual, setIndiceActual] =
    useState(0);


  /* ===============================
     CAMBIO AUTOMÁTICO INFINITO
  =============================== */

  useEffect(() => {

    const intervalo = window.setInterval(
      () => {

        setIndiceActual(
          (indiceAnterior) =>
            (
              indiceAnterior + 1
            ) % slides.length
        );

      },
      17500
    );

    return () => {
      window.clearInterval(intervalo);
    };

  }, []);


  /* ===============================
     SIGUIENTE
  =============================== */

  const siguiente = () => {

    setIndiceActual(
      (indiceAnterior) =>
        (
          indiceAnterior + 1
        ) % slides.length
    );

  };


  /* ===============================
     ANTERIOR
  =============================== */

  const anterior = () => {

    setIndiceActual(
      (indiceAnterior) =>
        (
          indiceAnterior - 1
          + slides.length
        ) % slides.length
    );

  };


  /* ===============================
     SELECCIONAR INDICADOR
  =============================== */

  const seleccionarSlide = (
    indice: number
  ) => {

    setIndiceActual(indice);

  };


  const slide =
    slides[indiceActual];


  return (
    <section className="hero">

      {/* IMAGEN */}

      <div
        key={indiceActual}
        className="
          hero__imagen
          hero__imagen--entrada
        "
        style={{
          backgroundImage:
            `url(${slide.imagen})`,
        }}
      />


      {/* CAPA OSCURA */}

      <div className="hero__overlay" />


      {/* FLECHA IZQUIERDA */}

      <button
        type="button"
        className="
          hero__flecha
          hero__flecha--izquierda
        "
        onClick={anterior}
        aria-label="Imagen anterior"
      >
        <ChevronLeft size={28} />
      </button>


      {/* CONTENIDO */}

      <div
        key={`contenido-${indiceActual}`}
        className="hero__contenido"
      >

        <span className="hero__subtitulo">
          {slide.subtitulo}
        </span>

        <h1 className="hero__titulo">

          {slide.titulo}

          <span>
            {slide.destacado}
          </span>

        </h1>

        <p className="hero__descripcion">
          {slide.descripcion}
        </p>

        <a
          href="#propiedades"
          className="hero__boton"
        >
          Explorar fincas

          <ArrowRight size={18} />
        </a>

      </div>


      {/* FLECHA DERECHA */}

      <button
        type="button"
        className="
          hero__flecha
          hero__flecha--derecha
        "
        onClick={siguiente}
        aria-label="Imagen siguiente"
      >
        <ChevronRight size={28} />
      </button>


      {/* INDICADORES */}

      <div className="hero__indicadores">

        {slides.map(
          (_, index) => (

            <button
              key={index}
              type="button"
              onClick={() =>
                seleccionarSlide(index)
              }
              className={`
                hero__indicador
                ${
                  index === indiceActual
                    ? "hero__indicador--activo"
                    : ""
                }
              `}
              aria-label={
                `Ir a imagen ${index + 1}`
              }
            />

          )
        )}

      </div>


      {/* FIRMA */}

      <div className="hero__firma">

        <span>
          Costa Rica
        </span>

        <small>
          Naturaleza es vida
        </small>

      </div>

    </section>
  );
}