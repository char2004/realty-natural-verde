import {
  ArrowRight,
  BadgeDollarSign,
  Banknote,
  Building2,
  Check,
  CircleDollarSign,
  Handshake,
  HeartHandshake,
  MessageCircle,
  SearchCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import "./Servicios.css";


export default function ServicesSection() {

  const abrirWhatsApp = (
    servicio: string
  ): void => {

    const telefono =
      "50684337225";

    const mensaje =
      encodeURIComponent(
        `Hola, me gustaría recibir más información sobre el servicio de ${servicio} de Realty Natural Verde.`
      );

    window.open(
      `https://api.whatsapp.com/send?phone=${telefono}&text=${mensaje}`,
      "_blank",
      "noopener,noreferrer"
    );

  };


  return (

    <section
      className="services"
      id="servicios"
    >

      {/* =====================================
          DECORACIONES
      ===================================== */}

      <div
        className="
          services__shape
          services__shape--orange
        "
      />

      <div
        className="
          services__shape
          services__shape--green
        "
      />

      <div
        className="
          services__shape
          services__shape--yellow
        "
      />


      <div
        className="services__container"
      >

        {/* =====================================
            ENCABEZADO
        ===================================== */}

        <header
          className="services__header"
        >

          <div
            className="services__eyebrow"
          >

            <Sparkles
              size={15}
            />

            <span>
              MÁS QUE PROPIEDADES
            </span>

          </div>


          <div
            className="services__header-grid"
          >

            <h2>

              Te acompañamos para que
              encontrar tu propiedad sea

              <span>
                mucho más sencillo.
              </span>

            </h2>


            <div
              className="services__intro"
            >

              <p>
                Nuestro trabajo no termina
                al mostrarte una propiedad.
                También podemos orientarte
                durante diferentes etapas
                del proceso para ayudarte
                a tomar una decisión con
                mayor claridad.
              </p>


              <div
                className="services__intro-tag"
              >

                <HeartHandshake
                  size={18}
                />

                Acompañamiento cercano

              </div>

            </div>

          </div>

        </header>


        {/* =====================================
            SERVICIO 01
            ASESORAMIENTO
        ===================================== */}

        <article
          className="
            service-card
            service-card--advice
          "
        >

          <div
            className="service-card__visual"
          >

            <span
              className="service-card__number"
            >
              01
            </span>


            <div
              className="service-card__icon-main"
            >

              <Handshake
                size={52}
                strokeWidth={1.7}
              />

            </div>


            <div
              className="
                service-card__floating
                service-card__floating--one
              "
            >

              <SearchCheck
                size={21}
              />

            </div>


            <div
              className="
                service-card__floating
                service-card__floating--two
              "
            >

              <ShieldCheck
                size={20}
              />

            </div>


            <div
              className="service-card__visual-text"
            >

              <span>
                ACOMPAÑAMIENTO
              </span>

              <strong>
                De principio
                a fin
              </strong>

            </div>

          </div>


          <div
            className="service-card__content"
          >

            <div
              className="service-card__label"
            >
              SERVICIO 01
            </div>


            <h3>
              Asesoramiento
              <span>
                inmobiliario
              </span>
            </h3>


            <p
              className="service-card__description"
            >
              Comprar una propiedad puede
              generar muchas preguntas.
              Te ayudamos a conocer las
              opciones disponibles y
              entender mejor cada etapa
              para que puedas tomar una
              decisión informada.
            </p>


            <div
              className="service-card__benefits"
            >

              <div>

                <span
                  className="service-card__check"
                >
                  <Check
                    size={15}
                  />
                </span>

                <p>
                  Orientación para encontrar
                  propiedades acordes a lo
                  que buscas.
                </p>

              </div>


              <div>

                <span
                  className="service-card__check"
                >
                  <Check
                    size={15}
                  />
                </span>

                <p>
                  Resolución de dudas sobre
                  las opciones disponibles.
                </p>

              </div>


              <div>

                <span
                  className="service-card__check"
                >
                  <Check
                    size={15}
                  />
                </span>

                <p>
                  Acompañamiento durante
                  el proceso de compra.
                </p>

              </div>

            </div>


            <button
              type="button"
              className="service-card__button"
              onClick={
                () =>
                  abrirWhatsApp(
                    "asesoramiento inmobiliario"
                  )
              }
            >

              <MessageCircle
                size={18}
              />

              Solicitar asesoramiento

              <ArrowRight
                size={17}
              />

            </button>

          </div>

        </article>


        {/* =====================================
            DIVISOR
        ===================================== */}

        <div
          className="services__divider"
        >

          <span />

          <div>

            <Building2
              size={18}
            />

          </div>

          <span />

        </div>


        {/* =====================================
            SERVICIO 02
            CRÉDITO BANCARIO
        ===================================== */}

        <article
          className="
            service-card
            service-card--credit
          "
        >

          <div
            className="service-card__content"
          >

            <div
              className="
                service-card__label
                service-card__label--orange
              "
            >
              SERVICIO 02
            </div>


            <h3>
              Crédito
              <span>
                bancario
              </span>
            </h3>


            <p
              className="service-card__description"
            >
              Si necesitas financiamiento
              para adquirir una propiedad,
              podemos orientarte sobre el
              proceso y ayudarte a comprender
              mejor las alternativas que
              puedes consultar con entidades
              financieras.
            </p>


            <div
              className="
                service-card__benefits
                service-card__benefits--credit
              "
            >

              <div>

                <span
                  className="service-card__check"
                >
                  <Check
                    size={15}
                  />
                </span>

                <p>
                  Orientación sobre opciones
                  de financiamiento.
                </p>

              </div>


              <div>

                <span
                  className="service-card__check"
                >
                  <Check
                    size={15}
                  />
                </span>

                <p>
                  Información para comprender
                  los pasos de una solicitud
                  de crédito.
                </p>

              </div>


              <div>

                <span
                  className="service-card__check"
                >
                  <Check
                    size={15}
                  />
                </span>

                <p>
                  Acompañamiento para resolver
                  dudas durante el proceso.
                </p>

              </div>

            </div>


            <div
              className="service-card__credit-note"
            >

              <CircleDollarSign
                size={19}
              />

              <p>
                La aprobación y condiciones
                del crédito dependen de la
                evaluación de la entidad
                financiera correspondiente.
              </p>

            </div>


            <button
              type="button"
              className="
                service-card__button
                service-card__button--orange
              "
              onClick={
                () =>
                  abrirWhatsApp(
                    "crédito bancario"
                  )
              }
            >

              <MessageCircle
                size={18}
              />

              Consultar financiamiento

              <ArrowRight
                size={17}
              />

            </button>

          </div>


          <div
            className="service-card__visual"
          >

            <span
              className="service-card__number"
            >
              02
            </span>


            <div
              className="
                service-card__icon-main
                service-card__icon-main--credit
              "
            >

              <Banknote
                size={54}
                strokeWidth={1.7}
              />

            </div>


            <div
              className="
                service-card__floating
                service-card__floating--credit-one
              "
            >

              <BadgeDollarSign
                size={22}
              />

            </div>


            <div
              className="
                service-card__floating
                service-card__floating--credit-two
              "
            >

              <Building2
                size={20}
              />

            </div>


            <div
              className="service-card__visual-text"
            >

              <span>
                FINANCIAMIENTO
              </span>

              <strong>
                Una posibilidad
                más cerca
              </strong>

            </div>

          </div>

        </article>


        {/* =====================================
            CIERRE
        ===================================== */}

        <div
          className="services__footer"
        >

          <div
            className="services__footer-icon"
          >

            <HeartHandshake
              size={27}
            />

          </div>


          <div>

            <span>
              ¿TIENES ALGUNA DUDA?
            </span>

            <h3>
              Cuéntanos qué estás buscando.
            </h3>

            <p>
              Podemos ayudarte a conocer las
              propiedades y servicios que se
              adapten mejor a tus necesidades.
            </p>

          </div>


          <button
            type="button"
            onClick={
              () =>
                abrirWhatsApp(
                  "sus propiedades y servicios"
                )
            }
          >

            Hablar con nosotros

            <ArrowRight
              size={18}
            />

          </button>

        </div>

      </div>

    </section>

  );

}