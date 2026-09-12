import {
  Link,
} from "react-router-dom";

import logo
  from "../../assets/logo-natura-verde.png";

import "./Footer.css";


export default function Footer() {

  const anioActual =
    new Date().getFullYear();


  return (
    <footer className="footer">

      <div className="footer__contenedor">

        {/* =========================
            MARCA
        ========================= */}

        <div className="footer__marca">

          <Link
            to="/"
            className="footer__logo"
          >
            <img
              src={logo}
              alt="Realty Natura Verde"
            />
          </Link>


          <p className="footer__descripcion">
            Conectamos personas con
            propiedades rodeadas de
            naturaleza y oportunidades
            en Costa Rica.
          </p>

        </div>

      </div>


      {/* =========================
          PARTE INFERIOR
      ========================= */}

      <div className="footer__inferior">

        <div className="footer__inferiorContenido">

          <p>
            © {anioActual}{" "}
            Realty Natural Verde.
            Todos los derechos reservados.
          </p>


          <span>
            Naturaleza

            <b>•</b>

            Inversión

            <b>•</b>

            Futuro
          </span>

        </div>

      </div>

    </footer>
  );
}