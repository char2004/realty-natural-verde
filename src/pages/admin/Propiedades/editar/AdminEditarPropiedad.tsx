import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  ArrowLeft,
  BadgeDollarSign,
  Building2,
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  CircleDollarSign,
  FileText,
  ImagePlus,
  Images,
  Info,
  LandPlot,
  MapPin,
  Phone,
  Plus,
  ReceiptText,
  Save,
  Star,
  Trash2,
  UserRound,
  Eye,
  X,
} from "lucide-react";

import {
  collection,
  doc,
  getDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  db,
} from "../../../../api/firebase";

import {
  subirArchivoCloudinary,
  subirImagenCloudinary,
} from "../../../../api/cloudinary";

import logo from "../../../../assets/logo-natura-verde.png";

/*
 * Podemos reutilizar exactamente
 * los estilos de Nueva propiedad.
 */
import "../nueva/AdminPropiedadForm.css";


/*
 * ==========================================
 * TIPOS
 * ==========================================
 */

type EstadoPropiedad =
  | "disponible"
  | "oferta"
  | "vendida";


type TipoPago =
  | ""
  | "efectivo"
  | "transferencia"
  | "deposito"
  | "financiamiento"
  | "otro";


interface ImagenExistente {
  id: string;

  tipo:
    "existente";

  url: string;

  publicId: string;

  principal: boolean;

  orden: number;

  width: number | null;

  height: number | null;

  formato: string | null;
}


interface ImagenNueva {
  id: string;

  tipo:
    "nueva";

  archivo: File;

  preview: string;

  principal: boolean;
}


type ImagenPropiedad =
  | ImagenExistente
  | ImagenNueva;


interface ImagenGuardada {
  url: string;

  publicId: string;

  principal: boolean;

  orden: number;

  width: number | null;

  height: number | null;

  formato: string | null;
}


interface DatosPropiedad {
  titulo: string;

  tipoPropiedad: string;

  precio: string;

  precioOferta: string;

  provincia: string;

  canton: string;

  distrito: string;

  direccion: string;

  area: string;

  unidadArea: string;

  topografia: string;

  zonificacion: string;

  servicios: string;

  acceso: string;

  habitaciones: string;

  banos: string;

  descripcion: string;

  estado: EstadoPropiedad;

  destacada: boolean;

  visible: boolean;
}


interface DatosVenta {
  nombreComprador: string;

  telefonoComprador: string;

  fechaCompra: string;

  tipoPago: TipoPago;

  montoVenta: string;

  notas: string;
}


/*
 * ==========================================
 * VALORES INICIALES
 * ==========================================
 */

const propiedadInicial:
  DatosPropiedad = {

    titulo: "",

    tipoPropiedad:
      "finca",

    precio: "",

    precioOferta: "",

    provincia: "",

    canton: "",

    distrito: "",

    direccion: "",

    area: "",

    unidadArea:
      "m2",

    topografia: "",

    zonificacion: "",

    servicios: "",

    acceso: "",

    habitaciones: "",

    banos: "",

    descripcion: "",

    estado:
      "disponible",

    destacada:
      false,

    visible:
      true,

  };


const ventaInicial:
  DatosVenta = {

    nombreComprador: "",

    telefonoComprador: "",

    fechaCompra: "",

    tipoPago: "",

    montoVenta: "",

    notas: "",

  };


/*
 * ==========================================
 * COMPONENTE
 * ==========================================
 */

export default function AdminEditarPropiedad() {

  const navigate =
    useNavigate();


  const {
    propiedadId,
  } =
    useParams<{
      propiedadId: string;
    }>();


  /*
   * ========================================
   * REFERENCIAS
   * ========================================
   */

  const inputImagenesRef =
    useRef<HTMLInputElement | null>(
      null
    );


  const inputComprobanteRef =
    useRef<HTMLInputElement | null>(
      null
    );


  /*
   * ========================================
   * ESTADOS
   * ========================================
   */

  const [
    propiedad,
    setPropiedad,
  ] =
    useState<DatosPropiedad>(
      propiedadInicial
    );


  const [
    imagenes,
    setImagenes,
  ] =
    useState<ImagenPropiedad[]>(
      []
    );


  const [
    venta,
    setVenta,
  ] =
    useState<DatosVenta>(
      ventaInicial
    );


  const [
    ventaId,
    setVentaId,
  ] =
    useState<string | null>(
      null
    );


  const [
    comprobanteActual,
    setComprobanteActual,
  ] =
    useState<{
      url: string;
      publicId: string;
      nombre: string;
      resourceType: string;
      formato: string | null;
    } | null>(
      null
    );


  const [
    nuevoComprobante,
    setNuevoComprobante,
  ] =
    useState<File | null>(
      null
    );

    const [
    fueVendida,
    setFueVendida,
  ] = useState(false);

  const [
  comprobanteVisor,
  setComprobanteVisor,
] = useState<{
  url: string;
  nombre: string;
  tipo: "imagen" | "pdf";
  temporal: boolean;
} | null>(null);

  const [
    cargando,
    setCargando,
  ] =
    useState(true);


  const [
    guardando,
    setGuardando,
  ] =
    useState(false);


  const [
    estadoGuardado,
    setEstadoGuardado,
  ] =
    useState("");


  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );


  /*
   * ========================================
   * CARGAR PROPIEDAD
   * ========================================
   */

  useEffect(
    () => {

      if (!propiedadId) {
        return;
      }


      let activo =
        true;


      const cargarPropiedad =
        async (): Promise<void> => {

          try {

            const referenciaPropiedad =
            doc(
              db,
              "propiedades",
              propiedadId
            );


          const snapshotPropiedad =
            await getDoc(
              referenciaPropiedad
            );


          /*
           * Si el componente ya se desmontó,
           * no actualizamos estados.
           */

          if (
            !activo
          ) {

            return;

          }


          if (
            !snapshotPropiedad.exists()
          ) {

            setError(
              "La propiedad no existe."
            );

            return;

          }


          const datos =
            snapshotPropiedad.data();

            const propiedadFueVendida =
              datos.estado === "vendida" ||
              (
                typeof datos.ventaId === "string" &&
                datos.ventaId.trim() !== ""
              );

            setFueVendida(
              propiedadFueVendida
            );


          /*
           * ===================================
           * CARGAR DATOS DE LA PROPIEDAD
           * ===================================
           */

          setPropiedad({

            titulo:
              typeof datos.titulo ===
                "string"
                ? datos.titulo
                : "",

            tipoPropiedad:
              typeof datos.tipoPropiedad ===
                "string"
                ? datos.tipoPropiedad
                : "finca",

            precio:
              typeof datos.precio ===
                "number"
                ? String(
                    datos.precio
                  )
                : "",

            precioOferta:
              typeof datos.precioOferta ===
                "number"
                ? String(
                    datos.precioOferta
                  )
                : "",

            provincia:
              typeof datos.ubicacion
                ?.provincia ===
                "string"
                ? datos.ubicacion
                    .provincia
                : "",

            canton:
              typeof datos.ubicacion
                ?.canton ===
                "string"
                ? datos.ubicacion
                    .canton
                : "",

            distrito:
              typeof datos.ubicacion
                ?.distrito ===
                "string"
                ? datos.ubicacion
                    .distrito
                : "",

            direccion:
              typeof datos.ubicacion
                ?.direccion ===
                "string"
                ? datos.ubicacion
                    .direccion
                : "",

            area:
              typeof datos.area
                ?.valor ===
                "number"
                ? String(
                    datos.area.valor
                  )
                : "",

            unidadArea:
              typeof datos.area
                ?.unidad ===
                "string"
                ? datos.area
                    .unidad
                : "m2",

            topografia:
              typeof datos
                .caracteristicas
                ?.topografia ===
                "string"
                ? datos
                    .caracteristicas
                    .topografia
                : "",

            zonificacion:
              typeof datos
                .caracteristicas
                ?.zonificacion ===
                "string"
                ? datos
                    .caracteristicas
                    .zonificacion
                : "",

            servicios:
              typeof datos
                .caracteristicas
                ?.servicios ===
                "string"
                ? datos
                    .caracteristicas
                    .servicios
                : "",

            acceso:
              typeof datos
                .caracteristicas
                ?.acceso ===
                "string"
                ? datos
                    .caracteristicas
                    .acceso
                : "",

            habitaciones:
              typeof datos
                .caracteristicas
                ?.habitaciones ===
                "number"
                ? String(
                    datos
                      .caracteristicas
                      .habitaciones
                  )
                : "",

            banos:
              typeof datos
                .caracteristicas
                ?.banos ===
                "number"
                ? String(
                    datos
                      .caracteristicas
                      .banos
                  )
                : "",

            descripcion:
              typeof datos.descripcion ===
                "string"
                ? datos.descripcion
                : "",

            estado:
              datos.estado ===
                "vendida"
                ? "vendida"
                : datos.estado ===
                    "oferta"
                  ? "oferta"
                  : "disponible",

            destacada:
              datos.destacada ===
              true,

            visible:
              datos.visible !==
              false,

          });


          /*
           * ===================================
           * CARGAR IMÁGENES
           * ===================================
           */

          const imagenesCargadas:
            ImagenPropiedad[] =
            [];


          if (
            typeof datos
              .imagenPrincipal
              ?.url ===
              "string"
          ) {

            imagenesCargadas.push({

              id:
                crypto.randomUUID(),

              tipo:
                "existente",

              url:
                datos
                  .imagenPrincipal
                  .url,

              publicId:
                typeof datos
                  .imagenPrincipal
                  .publicId ===
                  "string"
                  ? datos
                      .imagenPrincipal
                      .publicId
                  : "",

              principal:
                true,

              orden:
                0,

              width:
                typeof datos
                  .imagenPrincipal
                  .width ===
                  "number"
                  ? datos
                      .imagenPrincipal
                      .width
                  : null,

              height:
                typeof datos
                  .imagenPrincipal
                  .height ===
                  "number"
                  ? datos
                      .imagenPrincipal
                      .height
                  : null,

              formato:
                typeof datos
                  .imagenPrincipal
                  .formato ===
                  "string"
                  ? datos
                      .imagenPrincipal
                      .formato
                  : null,

            });

          }


          const secundarias =
            Array.isArray(
              datos.imagenesSecundarias
            )
              ? datos.imagenesSecundarias
              : [];


          secundarias.forEach(
            (
              imagen,
              index
            ) => {

              if (
                typeof imagen?.url !==
                "string"
              ) {

                return;

              }


              imagenesCargadas.push({

                id:
                  crypto.randomUUID(),

                tipo:
                  "existente",

                url:
                  imagen.url,

                publicId:
                  typeof imagen.publicId ===
                    "string"
                    ? imagen.publicId
                    : "",

                principal:
                  false,

                orden:
                  typeof imagen.orden ===
                    "number"
                    ? imagen.orden
                    : index + 1,

                width:
                  typeof imagen.width ===
                    "number"
                    ? imagen.width
                    : null,

                height:
                  typeof imagen.height ===
                    "number"
                    ? imagen.height
                    : null,

                formato:
                  typeof imagen.formato ===
                    "string"
                    ? imagen.formato
                    : null,

              });

            }
          );


          setImagenes(
            imagenesCargadas
          );


          /*
           * ===================================
           * CARGAR VENTA
           * ===================================
           */

          const idVenta =
            typeof datos.ventaId ===
              "string" &&
            datos.ventaId.trim()
              ? datos.ventaId
              : null;


          setVentaId(
            idVenta
          );


          if (
            !idVenta
          ) {

            return;

          }


          const referenciaVenta =
            doc(
              db,
              "ventas",
              idVenta
            );


          const snapshotVenta =
            await getDoc(
              referenciaVenta
            );


          if (
            !activo
          ) {

            return;

          }


          if (
            !snapshotVenta.exists()
          ) {

            return;

          }


          const datosVenta =
            snapshotVenta.data();


          setVenta({

            nombreComprador:
              typeof datosVenta
                .comprador
                ?.nombre ===
                "string"
                ? datosVenta
                    .comprador
                    .nombre
                : "",

            telefonoComprador:
              typeof datosVenta
                .comprador
                ?.telefono ===
                "string"
                ? datosVenta
                    .comprador
                    .telefono
                : "",

            fechaCompra:
              typeof datosVenta
                .fechaCompra ===
                "string"
                ? datosVenta
                    .fechaCompra
                : "",

            tipoPago:
            datosVenta.tipoPago === "efectivo" ||
            datosVenta.tipoPago === "transferencia" ||
            datosVenta.tipoPago === "deposito" ||
            datosVenta.tipoPago === "financiamiento" ||
            datosVenta.tipoPago === "otro"
              ? datosVenta.tipoPago
              : "",

            montoVenta:
              typeof datosVenta
                .montoVenta ===
                "number"
                ? String(
                    datosVenta
                      .montoVenta
                  )
                : "",

            notas:
              typeof datosVenta.notas ===
                "string"
                ? datosVenta.notas
                : "",

          });


          /*
           * ===================================
           * COMPROBANTE
           * ===================================
           */

          const comprobante =
            datosVenta.comprobante;


          if (
            comprobante &&
            typeof comprobante.url ===
              "string"
          ) {

            setComprobanteActual({

              url:
                comprobante.url,

              publicId:
                typeof comprobante
                  .publicId ===
                  "string"
                  ? comprobante
                      .publicId
                  : "",

              nombre:
                typeof comprobante
                  .nombre ===
                  "string"
                  ? comprobante
                      .nombre
                  : "Comprobante",

              resourceType:
                typeof comprobante
                  .resourceType ===
                  "string"
                  ? comprobante
                      .resourceType
                  : "auto",

              formato:
                typeof comprobante
                  .formato ===
                  "string"
                  ? comprobante
                      .formato
                  : null,

            });

          }

        } catch (error) {

          console.error(
            "Error cargando propiedad:",
            error
          );


          if (
            activo
          ) {

            setError(
              error instanceof Error
                ? error.message
                : "No fue posible cargar la propiedad."
            );

          }

        } finally {

          if (
            activo
          ) {

            setCargando(
              false
            );

          }

        }

      };


    void cargarPropiedad();


    /*
     * Limpieza del efecto.
     */

    return () => {

      activo =
        false;

    };

  },
  [
    propiedadId,
  ]
);

  /*
   * ========================================
   * CAMBIAR DATOS
   * ========================================
   */

  const cambiarCampo =
    (
      campo:
        keyof DatosPropiedad,

      valor:
        string | boolean
    ): void => {

      setPropiedad(
        (anterior) => ({

          ...anterior,

          [campo]:
            valor,

        })
      );

    };


  /*
   * ========================================
   * CAMBIAR ESTADO
   * ========================================
   */

  const cambiarEstado =
    (
      estado:
        EstadoPropiedad
    ): void => {

      setPropiedad(
        (anterior) => ({

          ...anterior,

          estado,

          precioOferta:
            estado ===
              "oferta"
              ? anterior.precioOferta
              : "",

        })
      );

    };


  /*
   * ========================================
   * DATOS DE VENTA
   * ========================================
   */

  const cambiarVenta =
    (
      campo:
        keyof DatosVenta,

      valor:
        string
    ): void => {

      setVenta(
        (anterior) => ({

          ...anterior,

          [campo]:
            valor,

        })
      );

    };


  /*
   * ========================================
   * AGREGAR IMÁGENES
   * ========================================
   */

  const seleccionarImagenes =
    (
      event:
        ChangeEvent<HTMLInputElement>
    ): void => {

      const archivos =
        Array.from(
          event.target.files ??
          []
        );


      const archivosValidos =
        archivos.filter(
          (archivo) =>
            archivo.type.startsWith(
              "image/"
            )
        );


      if (
        archivosValidos.length !==
        archivos.length
      ) {

        setError(
          "Algunos archivos fueron ignorados porque no son imágenes."
        );

      }


      setImagenes(
        (anteriores) => {

          const existePrincipal =
            anteriores.some(
              (imagen) =>
                imagen.principal
            );


          const nuevas:
            ImagenNueva[] =
            archivosValidos.map(
              (
                archivo,
                index
              ) => ({

                id:
                  crypto.randomUUID(),

                tipo:
                  "nueva",

                archivo,

                preview:
                  URL.createObjectURL(
                    archivo
                  ),

                principal:
                  !existePrincipal &&
                  anteriores.length ===
                    0 &&
                  index ===
                    0,

              })
            );


          return [
            ...anteriores,
            ...nuevas,
          ];

        }
      );


      event.target.value =
        "";

    };


  /*
   * ========================================
   * ELIMINAR IMAGEN
   * ========================================
   */

  const eliminarImagen =
    (
      id: string
    ): void => {

      setImagenes(
        (anteriores) => {

          const eliminar =
            anteriores.find(
              (imagen) =>
                imagen.id ===
                id
            );


          if (
            eliminar?.tipo ===
            "nueva"
          ) {

            URL.revokeObjectURL(
              eliminar.preview
            );

          }


          const restantes =
            anteriores.filter(
              (imagen) =>
                imagen.id !==
                id
            );


          /*
           * Si era la principal,
           * la primera restante se vuelve principal.
           */

          if (
            eliminar?.principal &&
            restantes.length >
              0
          ) {

            return restantes.map(
              (
                imagen,
                index
              ) => ({

                ...imagen,

                principal:
                  index ===
                  0,

              })
            );

          }


          return restantes;

        }
      );

    };


  /*
   * ========================================
   * CAMBIAR PRINCIPAL
   * ========================================
   */

  const establecerPrincipal =
    (
      id: string
    ): void => {

      setImagenes(
        (anteriores) =>
          anteriores.map(
            (imagen) => ({

              ...imagen,

              principal:
                imagen.id ===
                id,

            })
          )
      );

    };


  /*
   * ========================================
   * COMPROBANTE
   * ========================================
   */

  const seleccionarComprobante =
  (
    event:
      ChangeEvent<HTMLInputElement>
  ): void => {

    const archivo =
      event.target.files?.[0];


    if (
      !archivo
    ) {

      return;

    }


    const tiposPermitidos = [
      "image/jpeg",
      "application/pdf",
    ];


    if (
      !tiposPermitidos.includes(
        archivo.type
      )
    ) {

      setError(
        "El comprobante debe ser un archivo JPG, JPEG o PDF."
      );

      event.target.value =
        "";

      return;

    }


    /*
     * Opcional:
     * máximo 10 MB.
     */

    const maximo =
      10 * 1024 * 1024;


    if (
      archivo.size >
      maximo
    ) {

      setError(
        "El comprobante no puede superar los 10 MB."
      );

      event.target.value =
        "";

      return;

    }


    setNuevoComprobante(
      archivo
    );


    setError(
      null
    );


    event.target.value =
      "";

  };

  const abrirComprobanteNuevo = (): void => {
  if (!nuevoComprobante) {
    return;
  }

  const url = URL.createObjectURL(
    nuevoComprobante
  );

  setComprobanteVisor({
    url,
    nombre: nuevoComprobante.name,
    tipo:
      nuevoComprobante.type === "application/pdf"
        ? "pdf"
        : "imagen",
    temporal: true,
  });
};


const abrirComprobanteActual = (): void => {
  if (!comprobanteActual) {
    return;
  }

  const nombre =
    comprobanteActual.nombre.toLowerCase();

  const esPdf =
    comprobanteActual.formato === "pdf" ||
    nombre.endsWith(".pdf");

  setComprobanteVisor({
    url: comprobanteActual.url,
    nombre: comprobanteActual.nombre,
    tipo: esPdf
      ? "pdf"
      : "imagen",
    temporal: false,
  });
};


const cerrarComprobante = (): void => {
  if (
    comprobanteVisor?.temporal
  ) {
    URL.revokeObjectURL(
      comprobanteVisor.url
    );
  }

  setComprobanteVisor(null);
};


  /*
   * ========================================
   * VALIDAR
   * ========================================
   */

  const validarFormulario =
    (): boolean => {

      if (
        !propiedad.titulo.trim()
      ) {

        setError(
          "Ingresa el título de la propiedad."
        );

        return false;

      }


      if (
        Number(
          propiedad.precio
        ) <= 0
      ) {

        setError(
          "Ingresa un precio válido."
        );

        return false;

      }


      if (
        !propiedad.provincia.trim()
      ) {

        setError(
          "Ingresa la provincia."
        );

        return false;

      }


      if (
        !propiedad.descripcion.trim()
      ) {

        setError(
          "Ingresa la descripción."
        );

        return false;

      }


      if (
        imagenes.length ===
        0
      ) {

        setError(
          "La propiedad debe tener al menos una fotografía."
        );

        return false;

      }


      if (
        !imagenes.some(
          (imagen) =>
            imagen.principal
        )
      ) {

        setError(
          "Selecciona una fotografía principal."
        );

        return false;

      }


      if (
        propiedad.estado ===
          "oferta"
      ) {

        if (
          !propiedad.precioOferta.trim()
        ) {

          setError(
            "Ingresa el precio de oferta."
          );

          return false;

        }


        if (
          Number(
            propiedad.precioOferta
          ) <= 0 ||
          Number(
            propiedad.precioOferta
          ) >=
          Number(
            propiedad.precio
          )
        ) {

          setError(
            "El precio de oferta debe ser mayor a cero y menor al precio normal."
          );

          return false;

        }

      }


      /*
       * La venta solamente se valida
       * cuando la propiedad está vendida.
       */

      if (
        fueVendida
      ) {

        if (
          !venta.nombreComprador.trim()
        ) {

          setError(
            "Ingresa el nombre del comprador."
          );

          return false;

        }


        if (
          !venta.fechaCompra
        ) {

          setError(
            "Selecciona la fecha de venta."
          );

          return false;

        }


        if (
          !venta.tipoPago
        ) {

          setError(
            "Selecciona el tipo de pago."
          );

          return false;

        }

      }


      setError(
        null
      );


      return true;

    };


  /*
   * ========================================
   * PREPARAR IMÁGENES
   * ========================================
   */

  const prepararImagenes =
  async (): Promise<
    ImagenGuardada[]
  > => {

    const nuevas =
      imagenes.filter(
        (
          imagen
        ): imagen is ImagenNueva =>
          imagen.tipo ===
          "nueva"
      );


    if (
      nuevas.length > 0
    ) {

      setEstadoGuardado(
        `Subiendo ${nuevas.length} fotografía${
          nuevas.length === 1
            ? ""
            : "s"
        }...`
      );

    }


    const resultadosNuevos =
      await Promise.all(
        nuevas.map(
          async (
            imagen
          ) => {

            const resultado =
              await subirImagenCloudinary(
                imagen.archivo
              );


            return {

              id:
                imagen.id,

              url:
                resultado.secureUrl,

              publicId:
                resultado.publicId,

              width:
                resultado.width,

              height:
                resultado.height,

              formato:
                resultado.format,

            };

          }
        )
      );


    return imagenes.map(
      (
        imagen,
        index
      ): ImagenGuardada => {

        if (
          imagen.tipo ===
          "existente"
        ) {

          return {

            url:
              imagen.url,

            publicId:
              imagen.publicId,

            principal:
              imagen.principal,

            orden:
              index,

            width:
              imagen.width,

            height:
              imagen.height,

            formato:
              imagen.formato,

          };

        }


        const subida =
          resultadosNuevos.find(
            (resultado) =>
              resultado.id ===
              imagen.id
          );


        if (
          !subida
        ) {

          throw new Error(
            "No se pudo procesar una de las nuevas fotografías."
          );

        }


        return {

          url:
            subida.url,

          publicId:
            subida.publicId,

          principal:
            imagen.principal,

          orden:
            index,

          width:
            subida.width,

          height:
            subida.height,

          formato:
            subida.formato,

        };

      }
    );

  };


  /*
   * ========================================
   * GUARDAR
   * ========================================
   */

  const guardarCambios =
    async (
      event:
        FormEvent<HTMLFormElement>
    ): Promise<void> => {

      event.preventDefault();


      if (
        !propiedadId ||
        guardando
      ) {

        return;

      }


      if (
        !validarFormulario()
      ) {

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        return;

      }


      try {

        setGuardando(
          true
        );


        setError(
          null
        );


        /*
         * ==================================
         * 1. PROCESAR IMÁGENES
         * ==================================
         */

        setEstadoGuardado(
          "Procesando fotografías..."
        );


        const imagenesFinales =
          await prepararImagenes();


        const imagenPrincipal =
          imagenesFinales.find(
            (imagen) =>
              imagen.principal
          );


        if (
          !imagenPrincipal
        ) {

          throw new Error(
            "No se encontró una imagen principal."
          );

        }


        const imagenesSecundarias =
          imagenesFinales
            .filter(
              (imagen) =>
                !imagen.principal
            )
            .map(
              (
                imagen,
                index
              ) => ({

                url:
                  imagen.url,

                publicId:
                  imagen.publicId,

                orden:
                  index + 1,

                width:
                  imagen.width,

                height:
                  imagen.height,

                formato:
                  imagen.formato,

              })
            );


        /*
         * ==================================
         * 2. PREPARAR VENTA
         * ==================================
         */

        let referenciaVenta =
          ventaId
            ? doc(
                db,
                "ventas",
                ventaId
              )
            : null;


        /*
         * Si se marca como vendida y aún no
         * existe una venta, creamos su ID.
         */

        if (
          propiedad.estado ===
            "vendida" &&
          !referenciaVenta
        ) {

          referenciaVenta =
            doc(
              collection(
                db,
                "ventas"
              )
            );

        }


        /*
         * ==================================
         * 3. COMPROBANTE
         * ==================================
         */

        let comprobanteFinal =
          comprobanteActual;


        if (
          propiedad.estado ===
            "vendida" &&
          nuevoComprobante
        ) {

          setEstadoGuardado(
            "Subiendo comprobante..."
          );


          const resultado =
            await subirArchivoCloudinary(
              nuevoComprobante
            );


          comprobanteFinal = {

            url:
              resultado.secureUrl,

            publicId:
              resultado.publicId,

            nombre:
              nuevoComprobante.name,

            resourceType:
              resultado.resourceType,

            formato:
              resultado.format,

          };

        }


        /*
         * ==================================
         * 4. BATCH
         * ==================================
         */

        setEstadoGuardado(
          "Guardando cambios..."
        );


        const batch =
          writeBatch(
            db
          );


        const referenciaPropiedad =
          doc(
            db,
            "propiedades",
            propiedadId
          );


        batch.update(
          referenciaPropiedad,
          {

            titulo:
              propiedad.titulo.trim(),

            tipoPropiedad:
              propiedad.tipoPropiedad,

            precio:
              Number(
                propiedad.precio
              ),

            precioOferta:
              propiedad.estado ===
                "oferta"
                ? Number(
                    propiedad.precioOferta
                  )
                : null,

            ubicacion: {

              provincia:
                propiedad.provincia.trim(),

              canton:
                propiedad.canton.trim(),

              distrito:
                propiedad.distrito.trim(),

              direccion:
                propiedad.direccion.trim(),

            },

            area: {

              valor:
                propiedad.area
                  ? Number(
                      propiedad.area
                    )
                  : null,

              unidad:
                propiedad.unidadArea,

            },

            caracteristicas: {

              topografia:
                propiedad.topografia.trim(),

              zonificacion:
                propiedad.zonificacion.trim(),

              servicios:
                propiedad.servicios.trim(),

              acceso:
                propiedad.acceso.trim(),

              habitaciones:
                propiedad.habitaciones
                  ? Number(
                      propiedad.habitaciones
                    )
                  : null,

              banos:
                propiedad.banos
                  ? Number(
                      propiedad.banos
                    )
                  : null,

            },

            descripcion:
              propiedad.descripcion.trim(),

            estado:
              fueVendida
                ? "vendida"
                : propiedad.estado,

            destacada:
              propiedad.destacada,

            visible:
              propiedad.visible,

            imagenPrincipal: {

              url:
                imagenPrincipal.url,

              publicId:
                imagenPrincipal.publicId,

              width:
                imagenPrincipal.width,

              height:
                imagenPrincipal.height,

              formato:
                imagenPrincipal.formato,

            },

            imagenesSecundarias,

            cantidadImagenes:
              imagenesFinales.length,

            /*
             * Si está vendida apuntamos
             * al documento privado.
             *
             * Si no, no exponemos una venta.
             */
            ventaId:
              fueVendida
                ? referenciaVenta?.id ?? null
                : null,

            actualizadoEn:
              serverTimestamp(),

          }
        );


        /*
         * ==================================
         * 5. GUARDAR DATOS DE VENTA
         * ==================================
         */

        if (
          fueVendida &&
          referenciaVenta
        ) {

          batch.set(
            referenciaVenta,
            {

              propiedadId,

              comprador: {

                nombre:
                  venta.nombreComprador.trim(),

                telefono:
                  venta.telefonoComprador.trim(),

              },

              fechaCompra:
                venta.fechaCompra,

              tipoPago:
                venta.tipoPago,

              montoVenta:
                venta.montoVenta
                  ? Number(
                      venta.montoVenta
                    )
                  : Number(
                      propiedad.precioOferta ||
                      propiedad.precio
                    ),

              notas:
                venta.notas.trim(),

              comprobante:
                comprobanteFinal,

              actualizadoEn:
                serverTimestamp(),

              /*
               * merge evita perder creadoEn
               * en una venta ya existente.
               */
              ...(
                !ventaId
                  ? {
                      creadoEn:
                        serverTimestamp(),
                    }
                  : {}
              ),

            },
            {
              merge: true,
            }
          );

        }

        /*
        * Si anteriormente existía una venta
        * pero ahora se indica que NO fue vendida,
        * eliminamos el documento privado.
        */
        if (
          !fueVendida &&
          ventaId
        ) {
          const referenciaVentaAnterior =
            doc(
              db,
              "ventas",
              ventaId
            );

          batch.delete(
            referenciaVentaAnterior
          );
        }


        await batch.commit();


        /*
         * Actualizamos el ID local
         * en caso de que se haya creado.
         */

        if (
          fueVendida &&
          referenciaVenta
        ) {

          setVentaId(
            referenciaVenta.id
          );

        }else {
          setVentaId(
            null
          );
        }


        /*
         * Liberar previews locales.
         */

        imagenes.forEach(
          (imagen) => {

            if (
              imagen.tipo ===
              "nueva"
            ) {

              URL.revokeObjectURL(
                imagen.preview
              );

            }

          }
        );


        navigate(
          "/admin/propiedades",
          {
            replace: true,
          }
        );

      } catch (error) {

        console.error(
          "Error actualizando propiedad:",
          error
        );


        setEstadoGuardado(
          ""
        );


        setError(
          error instanceof Error
            ? error.message
            : "No fue posible actualizar la propiedad."
        );


        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

      } finally {

        setGuardando(
          false
        );

      }

    };


  /*
   * ========================================
   * ID INVÁLIDO
   * ========================================
   */

  if (!propiedadId) {

    return (

      <main className="admin-property-form">

        <div className="admin-property-form__container">

          <section className="property-form-section">

            <h2>
              No se pudo abrir la propiedad
            </h2>

            <p>
              No se recibió el identificador de la propiedad.
            </p>

            <button
              type="button"
              className="admin-property-form__back"
              onClick={() => navigate("/admin/propiedades")}
            >
              <ArrowLeft size={18} />
              Volver a propiedades
            </button>

          </section>

        </div>

      </main>

    );

  }


  /*
   * ========================================
   * CARGANDO
   * ========================================
   */

  if (
    cargando
  ) {

    return (

      <main className="admin-property-form">

        <div
          className="admin-property-form__container"
        >

          <section className="property-form-section">

            <h2>
              Cargando propiedad...
            </h2>

            <p>
              Estamos obteniendo la información registrada.
            </p>

          </section>

        </div>

      </main>

    );

  }


  /*
   * ========================================
   * RENDER
   * ========================================
   */

  return (

    <main className="admin-property-form">

      <header className="admin-property-form__topbar">

        <div className="admin-property-form__topbar-content">

          <div className="admin-property-form__brand">

            <img
              src={logo}
              alt="Realty Natura Verde"
              className="admin-property-form__logo"
            />

            <span>
              Panel administrativo
            </span>

          </div>


          <button
            type="button"
            className="admin-property-form__back"
            disabled={guardando}
            onClick={
              () =>
                navigate(
                  "/admin/propiedades"
                )
            }
          >

            <ArrowLeft
              size={18}
            />

            Volver a propiedades

          </button>

        </div>

      </header>


      <form
        className="admin-property-form__container"
        onSubmit={
          guardarCambios
        }
      >

        {/* ENCABEZADO */}

        <section className="admin-property-form__heading">

          <div>

            <span className="admin-property-form__eyebrow">
              Gestión de inmuebles
            </span>

            <h1>
              Editar propiedad
            </h1>

            <p>
              Actualiza la información, fotografías
              y estado de la propiedad.
            </p>

          </div>


          <button
            type="submit"
            className="admin-property-form__save"
            disabled={guardando}
          >

            <Save
              size={18}
            />

            {
              guardando
                ? estadoGuardado ||
                  "Guardando..."
                : "Guardar cambios"
            }

          </button>

        </section>


        {error && (

          <div className="admin-property-form__error">

            <Info
              size={19}
            />

            <span>
              {error}
            </span>

          </div>

        )}

        <div className="admin-property-form__layout">

          <div className="admin-property-form__main">

            {/* =================================
                INFORMACIÓN GENERAL
                ================================= */}

            <section className="property-form-section">

              <div className="property-form-section__header">

                <div className="property-form-section__icon">

                  <Building2
                    size={20}
                  />

                </div>

                <div>

                  <h2>
                    Información general
                  </h2>

                  <p>
                    Información principal de la propiedad.
                  </p>

                </div>

              </div>


              <div className="property-form-grid">

                <label className="property-form-field property-form-field--full">

                  <span>
                    Título *
                  </span>

                  <input
                    value={propiedad.titulo}
                    disabled={guardando}
                    onChange={
                      (event) =>
                        cambiarCampo(
                          "titulo",
                          event.target.value
                        )
                    }
                  />

                </label>


                <label className="property-form-field">

                  <span>
                    Tipo de propiedad
                  </span>

                  <div className="property-form-select">

                    <Building2
                      size={17}
                    />

                    <select
                      value={
                        propiedad.tipoPropiedad
                      }
                      disabled={guardando}
                      onChange={
                        (event) =>
                          cambiarCampo(
                            "tipoPropiedad",
                            event.target.value
                          )
                      }
                    >

                      <option value="finca">
                        Finca
                      </option>

                      <option value="terreno">
                        Terreno
                      </option>

                      <option value="casa">
                        Casa
                      </option>

                      <option value="quinta">
                        Quinta
                      </option>

                      <option value="lote">
                        Lote
                      </option>

                      <option value="otro">
                        Otro
                      </option>

                    </select>

                    <ChevronDown
                      size={16}
                    />

                  </div>

                </label>

                <section className="property-form-section">

                  <div className="property-form-section__header">

                    <div className="property-form-section__icon">
                      <CircleDollarSign
                        size={20}
                      />
                    </div>

                    <div>

                      <h2>
                        Estado de venta
                      </h2>

                      <p>
                        Indica si esta propiedad ya fue vendida.
                      </p>

                    </div>

                  </div>


                  <div className="property-form-grid">

                    <label className="property-form-field property-form-field--full">

                      <span>
                        ¿La propiedad fue vendida?
                      </span>

                      <select
                        value={
                          fueVendida
                            ? "si"
                            : "no"
                        }
                        disabled={guardando}
                        onChange={(event) => {

                          const vendida =
                            event.target.value === "si";


                          setFueVendida(
                            vendida
                          );


                          if (
                            vendida
                          ) {

                            setPropiedad(
                              (anterior) => ({
                                ...anterior,
                                estado:
                                  "vendida",
                                precioOferta:
                                  "",
                              })
                            );

                          } else {

                            /*
                            * Si deja de estar vendida
                            * volvemos a Disponible.
                            */

                            setPropiedad(
                              (anterior) => ({
                                ...anterior,
                                estado:
                                  "disponible",
                              })
                            );


                            /*
                            * Limpiamos todos los
                            * datos locales de venta.
                            */

                            setVenta(
                              ventaInicial
                            );

                            setNuevoComprobante(
                              null
                            );

                            setComprobanteActual(
                              null
                            );

                          }

                        }}
                      >

                        <option value="no">
                          No
                        </option>

                        <option value="si">
                          Sí
                        </option>

                      </select>

                    </label>

                  </div>

                </section>


                {/* AQUÍ SÍ APARECE VENDIDA */}

                <label className="property-form-field">

                  <span>
                    Estado
                  </span>

                  <div className="property-form-select">

                    <Check
                      size={17}
                    />

                    <select
                      value={
                        propiedad.estado === "vendida"
                          ? "disponible"
                          : propiedad.estado
                      }
                      disabled={
                        guardando ||
                        fueVendida
                      }
                      onChange={(event) => {

                        const valor =
                          event.target.value;

                        if (
                          valor === "disponible" ||
                          valor === "oferta"
                        ) {

                          cambiarEstado(
                            valor
                          );

                        }

                      }}
                    >
                      <option value="disponible">
                        Disponible
                      </option>

                      <option value="oferta">
                        En oferta
                      </option>
                    </select>

                    <ChevronDown
                      size={16}
                    />

                  </div>

                </label>


                <label className="property-form-field">

                  <span>
                    Precio *
                  </span>

                  <div className="property-form-input-icon">

                    <CircleDollarSign
                      size={17}
                    />

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        propiedad.precio
                      }
                      disabled={guardando}
                      onChange={
                        (event) =>
                          cambiarCampo(
                            "precio",
                            event.target.value
                          )
                      }
                    />

                  </div>

                </label>


                {!fueVendida &&
                  propiedad.estado === "oferta" && (

                  <label className="property-form-field">

                    <span>
                      Precio de oferta *
                    </span>

                    <div className="property-form-input-icon">

                      <BadgeDollarSign
                        size={17}
                      />

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          propiedad.precioOferta
                        }
                        disabled={guardando}
                        onChange={
                          (event) =>
                            cambiarCampo(
                              "precioOferta",
                              event.target.value
                            )
                        }
                      />

                    </div>

                  </label>

                )}

              </div>

            </section>


            {/* =================================
                UBICACIÓN
                ================================= */}

            <section className="property-form-section">

              <div className="property-form-section__header">

                <div className="property-form-section__icon">

                  <MapPin
                    size={20}
                  />

                </div>

                <div>

                  <h2>
                    Ubicación
                  </h2>

                  <p>
                    Ubicación actual de la propiedad.
                  </p>

                </div>

              </div>


              <div className="property-form-grid">

                <label className="property-form-field">

                  <span>
                    Provincia *
                  </span>

                  <input
                    value={
                      propiedad.provincia
                    }
                    disabled={guardando}
                    onChange={
                      (event) =>
                        cambiarCampo(
                          "provincia",
                          event.target.value
                        )
                    }
                  />

                </label>


                <label className="property-form-field">

                  <span>
                    Cantón
                  </span>

                  <input
                    value={
                      propiedad.canton
                    }
                    disabled={guardando}
                    onChange={
                      (event) =>
                        cambiarCampo(
                          "canton",
                          event.target.value
                        )
                    }
                  />

                </label>


                <label className="property-form-field">

                  <span>
                    Distrito
                  </span>

                  <input
                    value={
                      propiedad.distrito
                    }
                    disabled={guardando}
                    onChange={
                      (event) =>
                        cambiarCampo(
                          "distrito",
                          event.target.value
                        )
                    }
                  />

                </label>


                <label className="property-form-field property-form-field--full">

                  <span>
                    Dirección / referencia
                  </span>

                  <input
                    value={
                      propiedad.direccion
                    }
                    disabled={guardando}
                    onChange={
                      (event) =>
                        cambiarCampo(
                          "direccion",
                          event.target.value
                        )
                    }
                  />

                </label>

              </div>

            </section>


            {/* =================================
                CARACTERÍSTICAS
                ================================= */}

            <section className="property-form-section">

              <div className="property-form-section__header">

                <div className="property-form-section__icon">

                  <LandPlot
                    size={20}
                  />

                </div>

                <div>

                  <h2>
                    Características
                  </h2>

                  <p>
                    Datos relevantes del inmueble.
                  </p>

                </div>

              </div>


              <div className="property-form-grid">

                <label className="property-form-field">

                  <span>
                    Área
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      propiedad.area
                    }
                    disabled={guardando}
                    onChange={
                      (event) =>
                        cambiarCampo(
                          "area",
                          event.target.value
                        )
                    }
                  />

                </label>


                <label className="property-form-field">

                  <span>
                    Unidad
                  </span>

                  <select
                    value={
                      propiedad.unidadArea
                    }
                    disabled={guardando}
                    onChange={
                      (event) =>
                        cambiarCampo(
                          "unidadArea",
                          event.target.value
                        )
                    }
                  >

                    <option value="m2">
                      m²
                    </option>

                    <option value="hectareas">
                      Hectáreas
                    </option>

                    <option value="manzanas">
                      Manzanas
                    </option>

                  </select>

                </label>


                <label className="property-form-field">

                  <span>
                    Topografía
                  </span>

                  <input
                    value={
                      propiedad.topografia
                    }
                    disabled={guardando}
                    onChange={
                      (event) =>
                        cambiarCampo(
                          "topografia",
                          event.target.value
                        )
                    }
                  />

                </label>


                <label className="property-form-field">

                  <span>
                    Zonificación
                  </span>

                  <input
                    value={
                      propiedad.zonificacion
                    }
                    disabled={guardando}
                    onChange={
                      (event) =>
                        cambiarCampo(
                          "zonificacion",
                          event.target.value
                        )
                    }
                  />

                </label>


                <label className="property-form-field">

                  <span>
                    Habitaciones
                  </span>

                  <input
                    type="number"
                    min="0"
                    value={
                      propiedad.habitaciones
                    }
                    disabled={guardando}
                    onChange={
                      (event) =>
                        cambiarCampo(
                          "habitaciones",
                          event.target.value
                        )
                    }
                  />

                </label>


                <label className="property-form-field">

                  <span>
                    Baños
                  </span>

                  <input
                    type="number"
                    min="0"
                    value={
                      propiedad.banos
                    }
                    disabled={guardando}
                    onChange={
                      (event) =>
                        cambiarCampo(
                          "banos",
                          event.target.value
                        )
                    }
                  />

                </label>


                <label className="property-form-field property-form-field--full">

                  <span>
                    Servicios
                  </span>

                  <input
                    value={
                      propiedad.servicios
                    }
                    disabled={guardando}
                    onChange={
                      (event) =>
                        cambiarCampo(
                          "servicios",
                          event.target.value
                        )
                    }
                  />

                </label>


                <label className="property-form-field property-form-field--full">

                  <span>
                    Acceso
                  </span>

                  <input
                    value={
                      propiedad.acceso
                    }
                    disabled={guardando}
                    onChange={
                      (event) =>
                        cambiarCampo(
                          "acceso",
                          event.target.value
                        )
                    }
                  />

                </label>

              </div>

            </section>


            {/* =================================
                DESCRIPCIÓN
                ================================= */}

            <section className="property-form-section">

              <div className="property-form-section__header">

                <div className="property-form-section__icon">

                  <FileText
                    size={20}
                  />

                </div>

                <div>

                  <h2>
                    Descripción
                  </h2>

                </div>

              </div>


              <label className="property-form-field">

                <textarea
                  rows={8}
                  value={
                    propiedad.descripcion
                  }
                  disabled={guardando}
                  onChange={
                    (event) =>
                      cambiarCampo(
                        "descripcion",
                        event.target.value
                      )
                  }
                />

              </label>

            </section>


            {/* =================================
                FOTOGRAFÍAS
                ================================= */}

            <section className="property-form-section">

              <div className="property-form-section__header">

                <div className="property-form-section__icon">

                  <Images
                    size={20}
                  />

                </div>

                <div>

                  <h2>
                    Fotografías
                  </h2>

                  <p>
                    Puedes conservar, eliminar,
                    agregar o cambiar la imagen principal.
                  </p>

                </div>

              </div>


              <input
                ref={
                  inputImagenesRef
                }
                type="file"
                accept="image/*"
                multiple
                hidden
                disabled={guardando}
                onChange={
                  seleccionarImagenes
                }
              />


              <button
                type="button"
                className="property-images-upload"
                disabled={guardando}
                onClick={
                  () =>
                    inputImagenesRef
                      .current
                      ?.click()
                }
              >

                <div className="property-images-upload__icon">

                  <ImagePlus
                    size={26}
                  />

                </div>

                <strong>
                  Agregar fotografías
                </strong>

                <span>
                  Las fotografías actuales se conservarán.
                </span>

              </button>


              {imagenes.length > 0 && (

                <>

                  <div className="property-images-info">

                    <Camera
                      size={16}
                    />

                    <span>
                      {imagenes.length}
                      {
                        imagenes.length === 1
                          ? " fotografía"
                          : " fotografías"
                      }
                    </span>

                  </div>


                  <div className="property-images-grid">

                    {imagenes.map(
                      (imagen) => {

                        const url =
                          imagen.tipo ===
                            "existente"
                            ? imagen.url
                            : imagen.preview;


                        return (

                          <article
                            key={imagen.id}
                            className={`
                              property-image-card
                              ${
                                imagen.principal
                                  ? "property-image-card--principal"
                                  : ""
                              }
                            `}
                          >

                            <div className="property-image-card__preview">

                              <img
                                src={url}
                                alt="Fotografía de propiedad"
                              />


                              {imagen.principal && (

                                <span className="property-image-card__principal">

                                  <Star
                                    size={13}
                                    fill="currentColor"
                                  />

                                  Principal

                                </span>

                              )}


                              <button
                                type="button"
                                className="property-image-card__delete"
                                title="Quitar fotografía"
                                disabled={guardando}
                                onClick={
                                  () =>
                                    eliminarImagen(
                                      imagen.id
                                    )
                                }
                              >

                                <X
                                  size={17}
                                />

                              </button>

                            </div>


                            <div className="property-image-card__content">

                              <span>

                                {
                                  imagen.tipo ===
                                    "existente"
                                    ? "Fotografía registrada"
                                    : imagen.archivo.name
                                }

                              </span>


                              {!imagen.principal && (

                                <button
                                  type="button"
                                  disabled={guardando}
                                  onClick={
                                    () =>
                                      establecerPrincipal(
                                        imagen.id
                                      )
                                  }
                                >

                                  <Star
                                    size={14}
                                  />

                                  Hacer principal

                                </button>

                              )}

                            </div>

                          </article>

                        );

                      }
                    )}

                  </div>


                  <button
                    type="button"
                    className="property-images-add-more"
                    disabled={guardando}
                    onClick={
                      () =>
                        inputImagenesRef
                          .current
                          ?.click()
                    }
                  >

                    <Plus
                      size={16}
                    />

                    Agregar más fotografías

                  </button>

                </>

              )}

            </section>


            {/* =================================
                INFORMACIÓN DE VENTA

                SOLO SE RENDERIZA SI VENDIDA
                ================================= */}

            {fueVendida && (

              <section className="property-form-section property-form-section--private">

                <div className="property-form-section__header">

                  <div className="property-form-section__icon">

                    <ReceiptText
                      size={20}
                    />

                  </div>

                  <div>

                    <h2>
                      Información de venta
                    </h2>

                    <p>
                      Información privada del comprador
                      y de la operación.
                    </p>

                  </div>

                </div>


                <div className="property-private-notice">

                  <Info
                    size={17}
                  />

                  <span>
                    Estos datos solamente se guardarán
                    porque la propiedad está marcada
                    como Vendida.
                  </span>

                </div>


                <div className="property-form-grid">

                  <label className="property-form-field">

                    <span>
                      Nombre del comprador *
                    </span>

                    <div className="property-form-input-icon">

                      <UserRound
                        size={17}
                      />

                      <input
                        type="text"
                        value={
                          venta.nombreComprador
                        }
                        disabled={guardando}
                        onChange={
                          (event) =>
                            cambiarVenta(
                              "nombreComprador",
                              event.target.value
                            )
                        }
                      />

                    </div>

                  </label>


                  <label className="property-form-field">

                    <span>
                      Teléfono
                    </span>

                    <div className="property-form-input-icon">

                      <Phone
                        size={17}
                      />

                      <input
                        type="tel"
                        value={
                          venta.telefonoComprador
                        }
                        disabled={guardando}
                        onChange={
                          (event) =>
                            cambiarVenta(
                              "telefonoComprador",
                              event.target.value
                            )
                        }
                      />

                    </div>

                  </label>


                  <label className="property-form-field">

                    <span>
                      Fecha de compra *
                    </span>

                    <div className="property-form-input-icon">

                      <CalendarDays
                        size={17}
                      />

                      <input
                        type="date"
                        value={
                          venta.fechaCompra
                        }
                        disabled={guardando}
                        onChange={
                          (event) =>
                            cambiarVenta(
                              "fechaCompra",
                              event.target.value
                            )
                        }
                      />

                    </div>

                  </label>


                  <label className="property-form-field">

                    <span>
                      Tipo de pago *
                    </span>

                    <select
                      value={
                        venta.tipoPago
                      }
                      disabled={guardando}
                      onChange={
                        (event) =>
                          cambiarVenta(
                            "tipoPago",
                            event.target.value
                          )
                      }
                    >

                      <option value="">
                        Seleccionar
                      </option>

                      <option value="efectivo">
                        Efectivo
                      </option>

                      <option value="transferencia">
                        Transferencia bancaria
                      </option>

                      <option value="deposito">
                        Depósito bancario
                      </option>

                      <option value="financiamiento">
                        Financiamiento
                      </option>

                      <option value="otro">
                        Otro
                      </option>

                    </select>

                  </label>


                  <label className="property-form-field">

                    <span>
                      Monto final de venta
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        venta.montoVenta
                      }
                      disabled={guardando}
                      onChange={
                        (event) =>
                          cambiarVenta(
                            "montoVenta",
                            event.target.value
                          )
                      }
                    />

                  </label>


                  <label className="property-form-field property-form-field--full">

                    <span>
                      Notas administrativas
                    </span>

                    <textarea
                      rows={4}
                      value={
                        venta.notas
                      }
                      disabled={guardando}
                      onChange={
                        (event) =>
                          cambiarVenta(
                            "notas",
                            event.target.value
                          )
                      }
                    />

                  </label>

                </div>


                {/* COMPROBANTE */}

                <div className="property-proof">

                  <span className="property-proof__label">
                    Comprobante de pago
                  </span>


                  <input
                    ref={
                      inputComprobanteRef
                    }
                    type="file"
                    accept=".jpg,.jpeg,.pdf,image/jpeg,application/pdf"
                    hidden
                    disabled={guardando}
                    onChange={
                      seleccionarComprobante
                    }
                  />


                  {nuevoComprobante
                    ? (

                      <div className="property-proof__file">

                        <div className="property-proof__file-icon">

                          <ReceiptText
                            size={20}
                          />

                        </div>


                        <div className="property-proof__file-info">

                          <strong>
                            {nuevoComprobante.name}
                          </strong>

                          <span>
                            Nuevo comprobante
                          </span>

                        </div>


                        <button
                          type="button"
                          disabled={guardando}
                          onClick={
                            () =>
                              setNuevoComprobante(
                                null
                              )
                          }
                        >

                          <button
                            type="button"
                            title="Ver comprobante"
                            disabled={guardando}
                            onClick={abrirComprobanteNuevo}
                          >
                            <Eye size={17} />
                          </button>

                          <Trash2
                            size={17}
                          />

                        </button>

                      </div>

                    )
                    : comprobanteActual
                    ? (

                      <div className="property-proof__file">

                        <div className="property-proof__file-icon">

                          <ReceiptText
                            size={20}
                          />

                        </div>


                        <div className="property-proof__file-info">

                          <strong>
                            {comprobanteActual.nombre}
                          </strong>

                          <span>
                            Comprobante registrado
                          </span>

                        </div>


                        {/* VER COMPROBANTE */}
                        <button
                          type="button"
                          title="Ver comprobante"
                          disabled={guardando}
                          onClick={
                            abrirComprobanteActual
                          }
                        >

                          <Eye
                            size={17}
                          />

                        </button>


                        {/* REEMPLAZAR COMPROBANTE */}
                        <button
                          type="button"
                          title="Reemplazar comprobante"
                          disabled={guardando}
                          onClick={
                            () =>
                              inputComprobanteRef
                                .current
                                ?.click()
                          }
                        >

                          <ReceiptText
                            size={17}
                          />

                        </button>

                      </div>

                    )
                    : (

                      <button
                        type="button"
                        className="property-proof__upload"
                        disabled={guardando}
                        onClick={
                          () =>
                            inputComprobanteRef
                              .current
                              ?.click()
                        }
                      >

                        <ReceiptText
                          size={19}
                        />

                        <div>

                          <strong>
                            Seleccionar comprobante
                          </strong>

                          <span>
                            Imagen JPG o PDF. Opcional.
                          </span>

                        </div>

                      </button>

                    )
                  }

                </div>

              </section>

            )}

          </div>


          {/* =================================
              SIDEBAR
              ================================= */}

          <aside className="admin-property-form__sidebar">

            <section className="property-form-sidebar-card">

              <h3>
                Publicación
              </h3>


              <label className="property-form-switch-row">

                <div>

                  <strong>
                    Visible
                  </strong>

                  <span>
                    Mostrar en el sitio.
                  </span>

                </div>

                <input
                  type="checkbox"
                  checked={
                    propiedad.visible
                  }
                  disabled={guardando}
                  onChange={
                    (event) =>
                      cambiarCampo(
                        "visible",
                        event.target.checked
                      )
                  }
                />

              </label>


              <label className="property-form-switch-row">

                <div>

                  <strong>
                    Destacada
                  </strong>

                  <span>
                    Mostrar en secciones destacadas.
                  </span>

                </div>

                <input
                  type="checkbox"
                  checked={
                    propiedad.destacada
                  }
                  disabled={guardando}
                  onChange={
                    (event) =>
                      cambiarCampo(
                        "destacada",
                        event.target.checked
                      )
                  }
                />

              </label>

            </section>


            <section className="property-form-sidebar-card">

              <h3>
                Resumen
              </h3>


              <div className="property-form-summary">

                <div>

                  <span>
                    Estado
                  </span>

                  <strong>

                    {
                      propiedad.estado ===
                        "disponible"
                        ? "Disponible"
                        : propiedad.estado ===
                            "oferta"
                          ? "En oferta"
                          : "Vendida"
                    }

                  </strong>

                </div>


                <div>

                  <span>
                    Fotografías
                  </span>

                  <strong>
                    {imagenes.length}
                  </strong>

                </div>


                <div>

                  <span>
                    Venta
                  </span>

                  <strong>

                    {
                      propiedad.estado ===
                        "vendida"
                        ? ventaId
                          ? "Registrada"
                          : "Por registrar"
                        : "No aplica"
                    }

                  </strong>

                </div>


                {guardando && (

                  <div>

                    <span>
                      Progreso
                    </span>

                    <strong>
                      {estadoGuardado}
                    </strong>

                  </div>

                )}

              </div>

            </section>


            <button
              type="submit"
              className="admin-property-form__sidebar-save"
              disabled={guardando}
            >

              <Save
                size={17}
              />

              {
                guardando
                  ? "Guardando..."
                  : "Guardar cambios"
              }

            </button>

          </aside>

        </div>

      </form>

      {comprobanteVisor && (

  <div
    className="proof-viewer"
    onClick={cerrarComprobante}
  >

    <div
      className="proof-viewer__modal"
      onClick={(event) =>
        event.stopPropagation()
      }
    >

      <div className="proof-viewer__header">

        <div>
          <strong>
            Comprobante
          </strong>

          <span>
            {comprobanteVisor.nombre}
          </span>
        </div>

        <button
          type="button"
          onClick={cerrarComprobante}
        >
          <X size={22} />
        </button>

      </div>


      <div className="proof-viewer__content">

        {comprobanteVisor.tipo === "pdf"
          ? (

            <iframe
              src={comprobanteVisor.url}
              title={comprobanteVisor.nombre}
              className="proof-viewer__pdf"
            />

          )
          : (

            <img
              src={comprobanteVisor.url}
              alt={comprobanteVisor.nombre}
              className="proof-viewer__image"
            />

          )
        }

      </div>

    </div>

  </div>

)}

    </main>

  );

}