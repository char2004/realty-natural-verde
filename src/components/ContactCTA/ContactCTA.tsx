import {
  ArrowRight,
  Mail,
  MessageCircle,
  Phone,
  Sparkles,
} from "lucide-react";

import imagen1
  from "../../assets/images/hero/finc1.jpeg";

import imagen2
  from "../../assets/images/hero/finc2.jpeg";

import imagen3
  from "../../assets/images/hero/finc3.jpeg";

import imagen4
  from "../../assets/images/hero/finc4.jpeg";

import "./ContactCTA.css";


const imagenes = [
  imagen1,
  imagen2,
  imagen3,
  imagen4,
];


export default function ContactCTA() {

  return (

    <section
      className="contactCTA"
      id="contacto"
    >

      {/* =====================================
          CARRUSEL DE FONDO
      ===================================== */}

      <div
        className="contactCTA__carousel"
        aria-hidden="true"
      >

        {imagenes.map(
          (
            imagen,
            index
          ) => (

            <div
              key={imagen}
              className={`
                contactCTA__slide
                contactCTA__slide--${index + 1}
              `}
            >

              <img
                src={imagen}
                alt=""
              />

            </div>

          )
        )}

      </div>


      {/* =====================================
          CAPAS DE COLOR
      ===================================== */}

      <div
        className="contactCTA__overlay"
      />


      <div
        className="
          contactCTA__decoracion
          contactCTA__decoracion--uno
        "
      />

      <div
        className="
          contactCTA__decoracion
          contactCTA__decoracion--dos
        "
      />


      {/* =====================================
          CONTENIDO
      ===================================== */}

      <div
        className="contactCTA__contenedor"
      >

        <div
          className="contactCTA__contenido"
        >

          <span
            className="contactCTA__eyebrow"
          >

            <Sparkles
              size={14}
            />

            ¿ENCONTRASTE ALGO QUE TE INTERESE?

          </span>


          <h2
            className="contactCTA__titulo"
          >

            El siguiente lugar puede ser

            <span>
              parte de tu historia
            </span>

          </h2>


          <p
            className="contactCTA__descripcion"
          >
            Podemos ayudarte a conocer más
            sobre una propiedad, resolver tus
            dudas o acompañarte durante el
            proceso para encontrar la opción
            adecuada para ti.
          </p>


          {/* =================================
              DATOS DE CONTACTO
          ================================= */}

          <div
            className="contactCTA__datos"
          >

            <a
              href="tel:+50684337225"
              className="contactCTA__dato"
            >

              <span
                className="contactCTA__datoIcono"
              >
                <Phone
                  size={18}
                />
              </span>

              <div>

                <small>
                  TELÉFONO
                </small>

                <strong>
                  +506 8433 7225
                </strong>

              </div>

            </a>


            <a
              href="mailto:realtynaturaverde@gmail.com"
              className="contactCTA__dato"
            >

              <span
                className="contactCTA__datoIcono"
              >
                <Mail
                  size={18}
                />
              </span>

              <div>

                <small>
                  CORREO
                </small>

                <strong>
                  realtynaturaverde@gmail.com
                </strong>

              </div>

            </a>

          </div>


          {/* =================================
              ACCIONES
          ================================= */}

          <div
            className="contactCTA__acciones"
          >

            <a
              href="https://wa.me/50684337225"
              target="_blank"
              rel="noreferrer"
              className="
                contactCTA__boton
                contactCTA__boton--principal
              "
            >

              <MessageCircle
                size={19}
              />

              Hablar por WhatsApp

              <ArrowRight
                size={17}
              />

            </a>


            <a
              href="mailto:realtynaturaverde@gmail.com"
              className="
                contactCTA__boton
                contactCTA__boton--secundario
              "
            >

              <Mail
                size={18}
              />

              Enviar correo

            </a>

          </div>

        </div>


        {/* =====================================
            SELLO
        ===================================== */}

        <div
          className="contactCTA__sello"
        >

          <div
            className="contactCTA__selloCirculo"
          >

            <span
              className="contactCTA__selloPequeno"
            >
              REALTY
            </span>


            <span
              className="contactCTA__selloGrande"
            >
              Natural
            </span>

            <span
              className="contactCTA__selloGrande"
            >
              Verde
            </span>


            <small>
              COSTA RICA
            </small>

          </div>

        </div>

      </div>

    </section>

  );

}