import { useState } from "react";
import {
  Link,
  NavLink,
} from "react-router-dom";

import {
  Menu,
  X,
  Phone,
} from "lucide-react";

import logo from "../../assets/logo-natura-verde.png";

import "./Header.css";

interface HeaderProps {
  transparente?: boolean;
}

export default function Header({
  transparente = false,
}: HeaderProps) {

  const [menuAbierto, setMenuAbierto] =
    useState(false);

  const cerrarMenu = () => {
    setMenuAbierto(false);
  };

  return (
    <>
      <header
        className={`
          header
          ${
            transparente
              ? "header--transparente"
              : ""
          }
        `}
      >
        <div className="header__contenedor">

          {/* LOGOTIPO */}
          <Link
            to="/"
            className="header__logo"
            onClick={cerrarMenu}
          >
            <img
              src={logo}
              alt="Realty Natura Verde"
              className="header__logoImagen"
            />
          </Link>

          {/* NAVEGACIÓN */}
          <nav
            className={`
              header__nav
              ${
                menuAbierto
                  ? "header__nav--abierto"
                  : ""
              }
            `}
          >
            <NavLink
              to="/"
              onClick={cerrarMenu}
              className={({ isActive }) =>
                isActive
                  ? "nav__link nav__link--activo"
                  : "nav__link"
              }
            >
              Inicio
            </NavLink>

            <a
              href="/#servicios"
              onClick={cerrarMenu}
              className="nav__link"
            >
              Servicios
            </a>

            <NavLink
              to="/fincas"
              onClick={cerrarMenu}
              className={({ isActive }) =>
                isActive
                  ? "nav__link nav__link--activo"
                  : "nav__link"
              }
            >
              Fincas
            </NavLink>

            <a
              href="/#contacto"
              onClick={cerrarMenu}
              className="nav__link"
            >
              Contacto
            </a>
          </nav>

          {/* ACCIONES */}
          <div className="header__acciones">

            <a
              href="tel:+50684337225"
              className="header__telefono"
            >
              <Phone size={17} />

              <span>
                +506 8433 7225
              </span>
            </a>

            <button
              type="button"
              className="header__menuBoton"
              onClick={() =>
                setMenuAbierto(
                  !menuAbierto
                )
              }
              aria-label="Abrir menú"
            >
              {menuAbierto
                ? <X size={25} />
                : <Menu size={25} />
              }
            </button>
          </div>
        </div>
      </header>

      {menuAbierto && (
        <div
          className="header__overlay"
          onClick={cerrarMenu}
        />
      )}
    </>
  );
}