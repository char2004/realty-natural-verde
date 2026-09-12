export type EstadoPropiedad =
  | "disponible"
  | "oferta"
  | "vendida";


export interface ImagenPropiedadPublica {
  url: string;
  publicId?: string;
  orden?: number;
  width?: number | null;
  height?: number | null;
  formato?: string | null;
}


export interface PropiedadPublica {
  id: string;

  titulo: string;
  tipoPropiedad: string;

  precio: number;
  precioOferta: number | null;

  ubicacion: {
    provincia: string;
    canton: string;
    distrito: string;
    direccion: string;
  };

  area: {
    valor: number | null;
    unidad: string;
  };

  caracteristicas: {
    topografia: string;
    zonificacion: string;
    servicios: string;
    acceso: string;
    habitaciones: number | null;
    banos: number | null;
  };

  descripcion: string;

  estado: EstadoPropiedad;

  destacada: boolean;
  visible: boolean;

  imagenPrincipal: ImagenPropiedadPublica | null;

  imagenesSecundarias:
    ImagenPropiedadPublica[];
}