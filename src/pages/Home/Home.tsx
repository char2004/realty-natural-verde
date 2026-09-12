import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import Header
  from "../../components/Header/Header";

import HeroCarousel
  from "../../components/HeroCarousel/HeroCarousel";

import PropertyCarousel
  from "../../components/PropertyCarousel/PropertyCarousel";

import PropertyPreview
  from "../../components/PropertyPreview/PropertyPreview";

import ContactCTA
  from "../../components/ContactCTA/ContactCTA";

import Servicios
  from "../../components/Servicios/Servicios";

import Footer
  from "../../components/Footer/Footer";

import type {
  PropertyCardData,
} from "../../components/PropertyCard/PropertyCard";

import {
  db,
} from "../../api/firebase";

import "./Home.css";


interface PropiedadFirestore {

  id: string;

  nombre: string;

  ubicacion: string;

  imagen: string;

  precio: string;

  precioAnterior?: string;

  area: string;

  estado:
    | "disponible"
    | "oferta"
    | "vendida";

  visible: boolean;

  creadoEn: number;

}


/* =========================================
   FORMATEAR PRECIO
========================================= */

function formatearPrecio(
  precio: unknown
): string {

  if (
    typeof precio !== "number" ||
    precio <= 0
  ) {
    return "Consultar precio";
  }

  return new Intl.NumberFormat(
    "es-CR",
    {
      style: "currency",
      currency: "CRC",
      maximumFractionDigits: 0,
    }
  ).format(
    precio
  );

}


/* =========================================
   FORMATEAR ÁREA
========================================= */

function formatearArea(
  valor: unknown,
  unidad: unknown
): string {

  if (
    typeof valor !== "number" ||
    valor <= 0
  ) {
    return "Área por consultar";
  }

  const unidadTexto =
    typeof unidad === "string"
      ? unidad
      : "";

  return `${valor.toLocaleString(
    "es-CR"
  )} ${unidadTexto}`;

}


/* =========================================
   HOME
========================================= */

export default function Home() {

  const [
    propiedades,
    setPropiedades,
  ] =
    useState<PropiedadFirestore[]>(
      []
    );


  const [
    cargando,
    setCargando,
  ] =
    useState(true);


  /* =========================================
     CARGAR PROPIEDADES
  ========================================= */

  useEffect(
    () => {

      const referencia =
        collection(
          db,
          "propiedades"
        );


      const unsubscribe =
        onSnapshot(

          referencia,

          (snapshot) => {

            const lista:
              PropiedadFirestore[] =
                snapshot.docs.map(
                  (documento) => {

                    const datos =
                      documento.data();


                    /* =========================
                       ESTADO
                    ========================= */

                    const estado:
                      PropiedadFirestore["estado"] =
                        datos.estado === "vendida"
                          ? "vendida"

                          : datos.estado === "oferta"
                            ? "oferta"

                            : "disponible";


                    /* =========================
                       UBICACIÓN
                    ========================= */

                    const ubicacion =
                      [
                        datos.ubicacion
                          ?.distrito,

                        datos.ubicacion
                          ?.canton,

                        datos.ubicacion
                          ?.provincia,
                      ]
                        .filter(Boolean)
                        .join(", ");


                    /* =========================
                       PRECIO
                    ========================= */

                    let precio =
                      formatearPrecio(
                        datos.precio
                      );


                    let precioAnterior:
                      string | undefined;


                    if (
                      estado === "oferta" &&
                      typeof datos.precioOferta ===
                        "number" &&
                      datos.precioOferta > 0
                    ) {

                      precioAnterior =
                        formatearPrecio(
                          datos.precio
                        );


                      precio =
                        formatearPrecio(
                          datos.precioOferta
                        );

                    }


                    /* =========================
                       IMAGEN
                    ========================= */

                    const imagen =
                      typeof datos
                        .imagenPrincipal
                        ?.url === "string"

                        ? datos
                            .imagenPrincipal
                            .url

                        : "";


                    /* =========================
                       FECHA
                    ========================= */

                    const creadoEn =
                      typeof datos
                        .creadoEn
                        ?.seconds === "number"

                        ? datos
                            .creadoEn
                            .seconds

                        : 0;


                    return {

                      id:
                        documento.id,

                      nombre:
                        typeof datos.titulo ===
                          "string"

                          ? datos.titulo

                          : "Propiedad",

                      ubicacion:
                        ubicacion ||
                        "Costa Rica",

                      imagen,

                      precio,

                      precioAnterior,

                      area:
                        formatearArea(
                          datos.area?.valor,
                          datos.area?.unidad
                        ),

                      estado,

                      visible:
                        datos.visible !==
                        false,

                      creadoEn,

                    };

                  }
                );


            /* =================================
               MÁS RECIENTES PRIMERO
            ================================= */

            lista.sort(
              (
                propiedadA,
                propiedadB
              ) =>
                propiedadB.creadoEn -
                propiedadA.creadoEn
            );


            setPropiedades(
              lista
            );


            setCargando(
              false
            );

          },

          (error) => {

            console.error(
              "Error obteniendo propiedades:",
              error
            );


            setCargando(
              false
            );

          }

        );


      return () => {
        unsubscribe();
      };

    },
    []
  );


  /* =========================================
     SOLO VISIBLES
  ========================================= */

  const visibles =
    useMemo(
      () => {

        return propiedades.filter(
          (propiedad) =>
            propiedad.visible
        );

      },
      [
        propiedades,
      ]
    );


  /* =========================================
     PROPIEDADES ACTIVAS

     DISPONIBLE + OFERTA

     VENDIDAS NO ENTRAN
  ========================================= */

  const activas =
    useMemo(
      () => {

        return visibles.filter(
          (propiedad) =>

            propiedad.estado ===
              "disponible" ||

            propiedad.estado ===
              "oferta"
        );

      },
      [
        visibles,
      ]
    );


  /* =========================================
     PROPIEDADES EN OFERTA

     El arreglo ya viene ordenado por fecha,
     así que las ofertas quedan de:
     más reciente → más antigua.
  ========================================= */

  const ofertas:
    PropertyCardData[] =
      useMemo(
        () => {

          return activas
            .filter(
              (propiedad) =>
                propiedad.estado ===
                "oferta"
            )
            .map(
              (propiedad) => ({

                id:
                  propiedad.id,

                nombre:
                  propiedad.nombre,

                ubicacion:
                  propiedad.ubicacion,

                imagen:
                  propiedad.imagen,

                precio:
                  propiedad.precio,

                precioAnterior:
                  propiedad
                    .precioAnterior,

                area:
                  propiedad.area,

                estado:
                  propiedad.estado,

              })
            );

        },
        [
          activas,
        ]
      );


  /* =========================================
     TODAS LAS PROPIEDADES ACTIVAS

     DISPONIBLE + OFERTA
  ========================================= */

  const todasLasPropiedades:
    PropertyCardData[] =
      useMemo(
        () => {

          return activas.map(
            (propiedad) => ({

              id:
                propiedad.id,

              nombre:
                propiedad.nombre,

              ubicacion:
                propiedad.ubicacion,

              imagen:
                propiedad.imagen,

              precio:
                propiedad.precio,

              precioAnterior:
                propiedad
                  .precioAnterior,

              area:
                propiedad.area,

              estado:
                propiedad.estado,

            })
          );

        },
        [
          activas,
        ]
      );


      console.log(
  "TODAS FIRESTORE:",
  propiedades
);

console.log(
  "ACTIVAS:",
  activas
);

console.log(
  "OFERTAS:",
  ofertas
);

console.log(
  "TODAS LAS PROPIEDADES:",
  todasLasPropiedades
);


  /* =========================================
     RENDER
  ========================================= */

  return (

    <>

      <Header />


      <main>

        <HeroCarousel />


        {/* =================================
            PROPIEDADES EN OFERTA
        ================================= */}

        {!cargando &&
          ofertas.length > 0 && (

          <PropertyCarousel

            titulo="Fincas en"

            destacado="oferta"

            descripcion={
              "Descubre propiedades seleccionadas con condiciones especiales y excelentes oportunidades para invertir en Costa Rica."
            }

            propiedades={
              ofertas
            }

            variante="ofertas"

          />

        )}


        {/* =================================
            TODAS LAS PROPIEDADES
        ================================= */}

        {!cargando &&
          todasLasPropiedades.length > 0 && (

          <PropertyPreview
            propiedades={
              todasLasPropiedades
            }
          />

        )}

        <Servicios />


        <ContactCTA />

      </main>


      <Footer />

    </>

  );

}