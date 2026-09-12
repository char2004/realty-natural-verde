import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import {
  db,
} from "./firebase";

import type {
  PropiedadPublica,
  EstadoPropiedad,
} from "../types/property.types";


function convertirPropiedad(
  id: string,
  datos: Record<string, any>
): PropiedadPublica {

  const estado: EstadoPropiedad =
    datos.estado === "vendida"
      ? "vendida"
      : datos.estado === "oferta"
        ? "oferta"
        : "disponible";


  return {
    id,

    titulo:
      typeof datos.titulo === "string"
        ? datos.titulo
        : "",

    tipoPropiedad:
      typeof datos.tipoPropiedad === "string"
        ? datos.tipoPropiedad
        : "finca",

    precio:
      typeof datos.precio === "number"
        ? datos.precio
        : 0,

    precioOferta:
      typeof datos.precioOferta === "number"
        ? datos.precioOferta
        : null,

    ubicacion: {
      provincia:
        datos.ubicacion?.provincia ?? "",

      canton:
        datos.ubicacion?.canton ?? "",

      distrito:
        datos.ubicacion?.distrito ?? "",

      direccion:
        datos.ubicacion?.direccion ?? "",
    },

    area: {
      valor:
        typeof datos.area?.valor === "number"
          ? datos.area.valor
          : null,

      unidad:
        datos.area?.unidad ?? "",
    },

    caracteristicas: {
      topografia:
        datos.caracteristicas?.topografia ?? "",

      zonificacion:
        datos.caracteristicas?.zonificacion ?? "",

      servicios:
        datos.caracteristicas?.servicios ?? "",

      acceso:
        datos.caracteristicas?.acceso ?? "",

      habitaciones:
        typeof datos.caracteristicas
          ?.habitaciones === "number"
          ? datos.caracteristicas.habitaciones
          : null,

      banos:
        typeof datos.caracteristicas
          ?.banos === "number"
          ? datos.caracteristicas.banos
          : null,
    },

    descripcion:
      datos.descripcion ?? "",

    estado,

    destacada:
      datos.destacada === true,

    visible:
      datos.visible !== false,

    imagenPrincipal:
      datos.imagenPrincipal?.url
        ? datos.imagenPrincipal
        : null,

    imagenesSecundarias:
      Array.isArray(
        datos.imagenesSecundarias
      )
        ? datos.imagenesSecundarias
        : [],
  };
}


export async function obtenerPropiedadesPublicas():
Promise<PropiedadPublica[]> {

  const referencia =
    collection(
      db,
      "propiedades"
    );

  const consulta =
    query(
      referencia,
      where(
        "visible",
        "==",
        true
      )
    );

  const snapshot =
    await getDocs(
      consulta
    );


  return snapshot.docs.map(
    (documento) =>
      convertirPropiedad(
        documento.id,
        documento.data()
      )
  );
}