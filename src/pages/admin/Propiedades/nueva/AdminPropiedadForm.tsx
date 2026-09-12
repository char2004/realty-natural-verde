import {
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  ArrowLeft,
  BadgeDollarSign,
  Building2,
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
  Plus,
  Save,
  Star,
  X,
} from "lucide-react";

import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import {
  useNavigate,
} from "react-router-dom";

import {
  db,
} from "../../../../api/firebase";

import {
  subirImagenCloudinary,
} from "../../../../api/cloudinary";

import logo from "../../../../assets/logo-natura-verde.png";

import "./AdminPropiedadForm.css";


/*
 * ==========================================
 * TIPOS
 * ==========================================
 */

type EstadoPropiedad =
  | "disponible"
  | "oferta";


interface ImagenSeleccionada {
  id: string;

  archivo: File;

  preview: string;

  principal: boolean;
}


interface ImagenCloudinary {
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


/*
 * ==========================================
 * COMPONENTE
 * ==========================================
 */

export default function AdminPropertyForm() {

  const navigate =
    useNavigate();


  /*
   * ========================================
   * REFERENCIAS
   * ========================================
   */

  const inputImagenesRef =
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
    useState<ImagenSeleccionada[]>(
      []
    );


  const [
    guardando,
    setGuardando,
  ] =
    useState(false);


  const [
    imagenesSubidas,
    setImagenesSubidas,
  ] =
    useState(0);


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
   * CAMBIAR CAMPOS
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
      nuevoEstado:
        EstadoPropiedad
    ): void => {

      setPropiedad(
        (anterior) => ({

          ...anterior,

          estado:
            nuevoEstado,

          /*
           * Si deja de estar en oferta,
           * eliminamos cualquier precio
           * de oferta escrito anteriormente.
           */

          precioOferta:
            nuevoEstado === "oferta"
              ? anterior.precioOferta
              : "",

        })
      );

    };


  /*
   * ========================================
   * SELECCIONAR IMÁGENES
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


      if (
        archivos.length === 0
      ) {

        return;

      }


      const archivosImagen =
        archivos.filter(
          (archivo) =>
            archivo.type.startsWith(
              "image/"
            )
        );


      if (
        archivosImagen.length !==
        archivos.length
      ) {

        setError(
          "Algunos archivos fueron ignorados porque no son imágenes."
        );

      } else {

        setError(
          null
        );

      }


      setImagenes(
        (anteriores) => {

          const yaExistePrincipal =
            anteriores.some(
              (imagen) =>
                imagen.principal
            );


          const nuevas =
            archivosImagen.map(
              (
                archivo,
                index
              ):
                ImagenSeleccionada => ({

                  id:
                    crypto.randomUUID(),

                  archivo,

                  preview:
                    URL.createObjectURL(
                      archivo
                    ),

                  principal:
                    !yaExistePrincipal &&
                    anteriores.length === 0 &&
                    index === 0,

                })
            );


          return [
            ...anteriores,
            ...nuevas,
          ];

        }
      );


      /*
       * Permite volver a seleccionar
       * el mismo archivo.
       */

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

          const imagenEliminar =
            anteriores.find(
              (imagen) =>
                imagen.id === id
            );


          if (
            imagenEliminar
          ) {

            URL.revokeObjectURL(
              imagenEliminar.preview
            );

          }


          const restantes =
            anteriores.filter(
              (imagen) =>
                imagen.id !== id
            );


          /*
           * Si eliminamos la imagen principal,
           * la primera imagen restante pasa
           * automáticamente a ser principal.
           */

          if (
            imagenEliminar?.principal &&
            restantes.length > 0
          ) {

            return restantes.map(
              (
                imagen,
                index
              ) => ({

                ...imagen,

                principal:
                  index === 0,

              })
            );

          }


          return restantes;

        }
      );

    };


  /*
   * ========================================
   * ESTABLECER PRINCIPAL
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
                imagen.id === id,

            })
          )
      );

    };


  /*
   * ========================================
   * SUBIR IMÁGENES A CLOUDINARY
   * ========================================
   */

  const subirImagenes =
    async (): Promise<
      ImagenCloudinary[]
    > => {

      const resultados:
        ImagenCloudinary[] = [];


      setImagenesSubidas(
        0
      );


      for (
        let index = 0;
        index < imagenes.length;
        index++
      ) {

        const imagen =
          imagenes[index];


        setEstadoGuardado(
          `Subiendo imagen ${index + 1} de ${imagenes.length}...`
        );


        const resultado =
          await subirImagenCloudinary(
            imagen.archivo
          );


        resultados.push({

          url:
            resultado.secureUrl,

          publicId:
            resultado.publicId,

          principal:
            imagen.principal,

          orden:
            index,

          width:
            resultado.width,

          height:
            resultado.height,

          formato:
            resultado.format,

        });


        setImagenesSubidas(
          index + 1
        );

      }


      return resultados;

    };


  /*
   * ========================================
   * VALIDACIÓN
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
        !propiedad.precio.trim()
      ) {

        setError(
          "Ingresa el precio de la propiedad."
        );

        return false;

      }


      if (
        Number(
          propiedad.precio
        ) <= 0
      ) {

        setError(
          "El precio debe ser mayor a cero."
        );

        return false;

      }


      if (
        !propiedad.provincia.trim()
      ) {

        setError(
          "Ingresa la provincia donde se encuentra la propiedad."
        );

        return false;

      }


      if (
        !propiedad.descripcion.trim()
      ) {

        setError(
          "Ingresa una descripción para la propiedad."
        );

        return false;

      }


      if (
        imagenes.length === 0
      ) {

        setError(
          "Selecciona al menos una imagen para la propiedad."
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
          "Selecciona una imagen principal."
        );

        return false;

      }


      /*
       * ====================================
       * VALIDAR OFERTA
       * ====================================
       */

      if (
        propiedad.estado ===
          "oferta" &&
        !propiedad.precioOferta.trim()
      ) {

        setError(
          "Ingresa el precio de oferta."
        );

        return false;

      }


      if (
        propiedad.estado ===
          "oferta" &&
        Number(
          propiedad.precioOferta
        ) <= 0
      ) {

        setError(
          "El precio de oferta debe ser mayor a cero."
        );

        return false;

      }


      if (
        propiedad.estado ===
          "oferta" &&
        Number(
          propiedad.precioOferta
        ) >=
        Number(
          propiedad.precio
        )
      ) {

        setError(
          "El precio de oferta debe ser menor al precio normal."
        );

        return false;

      }


      setError(
        null
      );


      return true;

    };


  /*
   * ========================================
   * GUARDAR PROPIEDAD
   * ========================================
   */

  const guardarPropiedad =
    async (
      event:
        FormEvent<HTMLFormElement>
    ): Promise<void> => {

      event.preventDefault();


      /*
       * Evita doble clic mientras
       * se está guardando.
       */

      if (
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


        setEstadoGuardado(
          "Preparando fotografías..."
        );


        /*
         * ==================================
         * 1. SUBIR IMÁGENES A CLOUDINARY
         * ==================================
         */

        const imagenesCloudinary =
          await subirImagenes();


        /*
         * ==================================
         * 2. LOCALIZAR PRINCIPAL
         * ==================================
         */

        const imagenPrincipal =
          imagenesCloudinary.find(
            (imagen) =>
              imagen.principal
          );


        if (
          !imagenPrincipal
        ) {

          throw new Error(
            "No se pudo determinar la imagen principal."
          );

        }


        /*
         * ==================================
         * 3. IMÁGENES SECUNDARIAS
         * ==================================
         */

        const imagenesSecundarias =
          imagenesCloudinary
            .filter(
              (imagen) =>
                !imagen.principal
            )
            .sort(
              (a, b) =>
                a.orden -
                b.orden
            );


        /*
         * ==================================
         * 4. GENERAR ID EN FIRESTORE
         * ==================================
         */

        setEstadoGuardado(
          "Guardando información..."
        );


        const referenciaPropiedad =
          doc(
            collection(
              db,
              "propiedades"
            )
          );


        /*
         * ==================================
         * 5. PREPARAR DOCUMENTO
         * ==================================
         */

        const datosPropiedad = {

          titulo:
            propiedad.titulo.trim(),


          tipoPropiedad:
            propiedad.tipoPropiedad,


          precio:
            Number(
              propiedad.precio
            ),


          /*
           * Solamente guardamos precioOferta
           * cuando realmente está en oferta.
           */

          precioOferta:
            propiedad.estado ===
              "oferta"
              ? Number(
                  propiedad.precioOferta
                )
              : null,


          /*
           * =================================
           * UBICACIÓN
           * =================================
           */

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


          /*
           * =================================
           * ÁREA
           * =================================
           */

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


          /*
           * =================================
           * CARACTERÍSTICAS
           * =================================
           */

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
            propiedad.estado,


          destacada:
            propiedad.destacada,


          visible:
            propiedad.visible,


          /*
           * =================================
           * IMAGEN PRINCIPAL
           * =================================
           */

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


          /*
           * =================================
           * IMÁGENES SECUNDARIAS
           * =================================
           */

          imagenesSecundarias:
            imagenesSecundarias.map(
              (imagen) => ({

                url:
                  imagen.url,

                publicId:
                  imagen.publicId,

                orden:
                  imagen.orden,

                width:
                  imagen.width,

                height:
                  imagen.height,

                formato:
                  imagen.formato,

              })
            ),


          cantidadImagenes:
            imagenesCloudinary.length,


          /*
           * Al crear una propiedad todavía
           * no existe una venta.
           *
           * Cuando se venda posteriormente,
           * desde Editar propiedad se podrá
           * agregar este ID.
           */

          ventaId:
            null,


          creadoEn:
            serverTimestamp(),


          actualizadoEn:
            serverTimestamp(),

        };


        /*
         * ==================================
         * 6. GUARDAR EN FIRESTORE
         * ==================================
         */

        await setDoc(
          referenciaPropiedad,
          datosPropiedad
        );


        setEstadoGuardado(
          "Propiedad registrada."
        );


        /*
         * ==================================
         * 7. LIBERAR PREVIEWS LOCALES
         * ==================================
         */

        imagenes.forEach(
          (imagen) => {

            URL.revokeObjectURL(
              imagen.preview
            );

          }
        );


        /*
         * ==================================
         * 8. REGRESAR AL PANEL
         * ==================================
         */

        navigate(
          "/admin/propiedades",
          {
            replace: true,
          }
        );

      } catch (error) {

        console.error(
          "Error registrando propiedad:",
          error
        );


        setEstadoGuardado(
          ""
        );


        if (
          error instanceof Error
        ) {

          setError(
            error.message
          );

        } else {

          setError(
            "No fue posible registrar la propiedad."
          );

        }


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
   * TEXTO DE GUARDADO
   * ========================================
   */

  const textoGuardado =
    (): string => {

      if (
        !guardando
      ) {

        return "Guardar propiedad";

      }


      if (
        imagenesSubidas <
        imagenes.length
      ) {

        return (
          `Subiendo imágenes ${imagenesSubidas} de ${imagenes.length}...`
        );

      }


      if (
        estadoGuardado
      ) {

        return estadoGuardado;

      }


      return "Guardando propiedad...";

    };


  /*
   * ========================================
   * RENDER
   * ========================================
   */

  return (

    <main className="admin-property-form">

      {/* ===================================
          BARRA SUPERIOR
          =================================== */}

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


      {/* ===================================
          FORMULARIO
          =================================== */}

      <form
        className="admin-property-form__container"
        onSubmit={
          guardarPropiedad
        }
      >

        {/* =================================
            ENCABEZADO
            ================================= */}

        <section className="admin-property-form__heading">

          <div>

            <span className="admin-property-form__eyebrow">
              Gestión de inmuebles
            </span>

            <h1>
              Agregar propiedad
            </h1>

            <p>
              Registra la información,
              fotografías y características
              principales de la propiedad.
            </p>

          </div>


          <button
            type="submit"
            className="admin-property-form__save"
            disabled={
              guardando
            }
          >

            <Save
              size={18}
            />

            {
              textoGuardado()
            }

          </button>

        </section>


        {/* =================================
            ERROR
            ================================= */}

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

          {/* =================================
              COLUMNA PRINCIPAL
              ================================= */}

          <div className="admin-property-form__main">

            {/* ===============================
                INFORMACIÓN GENERAL
                =============================== */}

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
                    Información principal que
                    se mostrará públicamente.
                  </p>

                </div>

              </div>


              <div className="property-form-grid">

                {/* TÍTULO */}

                <label className="property-form-field property-form-field--full">

                  <span>
                    Título de la propiedad *
                  </span>

                  <input
                    type="text"
                    placeholder="Ej. Exclusiva finca en Bijagua"
                    value={
                      propiedad.titulo
                    }
                    disabled={
                      guardando
                    }
                    onChange={
                      (event) =>
                        cambiarCampo(
                          "titulo",
                          event.target.value
                        )
                    }
                  />

                </label>


                {/* TIPO */}

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
                      disabled={
                        guardando
                      }
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


                {/* ESTADO */}

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
                        propiedad.estado
                      }
                      disabled={
                        guardando
                      }
                      onChange={(event) =>
                        cambiarEstado(
                            event.target.value as EstadoPropiedad
                        )
                        }
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


                {/* PRECIO */}

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
                      placeholder="0"
                      value={
                        propiedad.precio
                      }
                      disabled={
                        guardando
                      }
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


                {/* PRECIO DE OFERTA */}

                {
                  propiedad.estado ===
                    "oferta" && (

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
                          placeholder="Precio especial"
                          value={
                            propiedad.precioOferta
                          }
                          disabled={
                            guardando
                          }
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

                  )
                }

              </div>

            </section>


            {/* ===============================
                UBICACIÓN
                =============================== */}

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
                    Indica dónde se encuentra
                    la propiedad.
                  </p>

                </div>

              </div>


              <div className="property-form-grid">

                <label className="property-form-field">

                  <span>
                    Provincia *
                  </span>

                  <input
                    type="text"
                    placeholder="Ej. Alajuela"
                    value={
                      propiedad.provincia
                    }
                    disabled={
                      guardando
                    }
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
                    type="text"
                    placeholder="Ej. Guatuso"
                    value={
                      propiedad.canton
                    }
                    disabled={
                      guardando
                    }
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
                    type="text"
                    placeholder="Distrito"
                    value={
                      propiedad.distrito
                    }
                    disabled={
                      guardando
                    }
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
                    type="text"
                    placeholder="Ej. Ruta 1, Liberia, Guanacaste"
                    value={
                      propiedad.direccion
                    }
                    disabled={
                      guardando
                    }
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


            {/* ===============================
                CARACTERÍSTICAS
                =============================== */}

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
                    Datos relevantes del terreno
                    o inmueble.
                  </p>

                </div>

              </div>


              <div className="property-form-grid">

                {/* ÁREA */}

                <label className="property-form-field">

                  <span>
                    Área
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Ej. 729"
                    value={
                      propiedad.area
                    }
                    disabled={
                      guardando
                    }
                    onChange={
                      (event) =>
                        cambiarCampo(
                          "area",
                          event.target.value
                        )
                    }
                  />

                </label>


                {/* UNIDAD */}

                <label className="property-form-field">

                  <span>
                    Unidad
                  </span>

                  <select
                    value={
                      propiedad.unidadArea
                    }
                    disabled={
                      guardando
                    }
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


                {/* TOPOGRAFÍA */}

                <label className="property-form-field">

                  <span>
                    Topografía
                  </span>

                  <input
                    type="text"
                    placeholder="Ej. Mixto y montañoso"
                    value={
                      propiedad.topografia
                    }
                    disabled={
                      guardando
                    }
                    onChange={
                      (event) =>
                        cambiarCampo(
                          "topografia",
                          event.target.value
                        )
                    }
                  />

                </label>


                {/* ZONIFICACIÓN */}

                <label className="property-form-field">

                  <span>
                    Zonificación
                  </span>

                  <input
                    type="text"
                    placeholder="Ej. Agrícola"
                    value={
                      propiedad.zonificacion
                    }
                    disabled={
                      guardando
                    }
                    onChange={
                      (event) =>
                        cambiarCampo(
                          "zonificacion",
                          event.target.value
                        )
                    }
                  />

                </label>


                {/* HABITACIONES */}

                <label className="property-form-field">

                  <span>
                    Habitaciones
                  </span>

                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={
                      propiedad.habitaciones
                    }
                    disabled={
                      guardando
                    }
                    onChange={
                      (event) =>
                        cambiarCampo(
                          "habitaciones",
                          event.target.value
                        )
                    }
                  />

                </label>


                {/* BAÑOS */}

                <label className="property-form-field">

                  <span>
                    Baños
                  </span>

                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={
                      propiedad.banos
                    }
                    disabled={
                      guardando
                    }
                    onChange={
                      (event) =>
                        cambiarCampo(
                          "banos",
                          event.target.value
                        )
                    }
                  />

                </label>


                {/* SERVICIOS */}

                <label className="property-form-field property-form-field--full">

                  <span>
                    Servicios
                  </span>

                  <input
                    type="text"
                    placeholder="Ej. Agua, electricidad, internet..."
                    value={
                      propiedad.servicios
                    }
                    disabled={
                      guardando
                    }
                    onChange={
                      (event) =>
                        cambiarCampo(
                          "servicios",
                          event.target.value
                        )
                    }
                  />

                </label>


                {/* ACCESO */}

                <label className="property-form-field property-form-field--full">

                  <span>
                    Acceso
                  </span>

                  <input
                    type="text"
                    placeholder="Ej. Camino público, acceso vehicular..."
                    value={
                      propiedad.acceso
                    }
                    disabled={
                      guardando
                    }
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


            {/* ===============================
                DESCRIPCIÓN
                =============================== */}

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

                  <p>
                    Describe los principales
                    atractivos de la propiedad.
                  </p>

                </div>

              </div>


              <label className="property-form-field">

                <textarea
                  rows={8}
                  placeholder="Escribe la descripción de la propiedad..."
                  value={
                    propiedad.descripcion
                  }
                  disabled={
                    guardando
                  }
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


            {/* ===============================
                GALERÍA
                =============================== */}

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
                    Selecciona la imagen principal
                    y las fotografías secundarias.
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
                disabled={
                  guardando
                }
                onChange={
                  seleccionarImagenes
                }
              />


              <button
                type="button"
                className="property-images-upload"
                disabled={
                  guardando
                }
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
                  Seleccionar fotografías
                </strong>

                <span>
                  Puedes seleccionar varias
                  imágenes al mismo tiempo.
                </span>

              </button>


              {
                imagenes.length >
                  0 && (

                  <>

                    <div className="property-images-info">

                      <Camera
                        size={16}
                      />

                      <span>

                        {
                          imagenes.length
                        }

                        {
                          imagenes.length ===
                            1
                            ? " fotografía seleccionada"
                            : " fotografías seleccionadas"
                        }

                      </span>

                    </div>


                    <div className="property-images-grid">

                      {
                        imagenes.map(
                          (imagen) => (

                            <article
                              key={
                                imagen.id
                              }
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
                                  src={
                                    imagen.preview
                                  }
                                  alt={
                                    imagen.archivo.name
                                  }
                                />


                                {
                                  imagen.principal && (

                                    <span className="property-image-card__principal">

                                      <Star
                                        size={13}
                                        fill="currentColor"
                                      />

                                      Principal

                                    </span>

                                  )
                                }


                                <button
                                  type="button"
                                  className="property-image-card__delete"
                                  title="Eliminar imagen"
                                  disabled={
                                    guardando
                                  }
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

                                <span
                                  title={
                                    imagen.archivo.name
                                  }
                                >

                                  {
                                    imagen.archivo.name
                                  }

                                </span>


                                {
                                  !imagen.principal && (

                                    <button
                                      type="button"
                                      disabled={
                                        guardando
                                      }
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

                                  )
                                }

                              </div>

                            </article>

                          )
                        )
                      }

                    </div>


                    <button
                      type="button"
                      className="property-images-add-more"
                      disabled={
                        guardando
                      }
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

                )
              }

            </section>

          </div>


          {/* =================================
              SIDEBAR
              ================================= */}

          <aside className="admin-property-form__sidebar">

            {/* ===============================
                PUBLICACIÓN
                =============================== */}

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
                    Mostrar la propiedad
                    en el sitio.
                  </span>

                </div>


                <input
                  type="checkbox"
                  checked={
                    propiedad.visible
                  }
                  disabled={
                    guardando
                  }
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
                    Mostrar en secciones
                    destacadas.
                  </span>

                </div>


                <input
                  type="checkbox"
                  checked={
                    propiedad.destacada
                  }
                  disabled={
                    guardando
                  }
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


            {/* ===============================
                RESUMEN
                =============================== */}

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
                        : "En oferta"
                    }

                  </strong>

                </div>


                <div>

                  <span>
                    Fotografías
                  </span>

                  <strong>
                    {
                      imagenes.length
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    Imagen principal
                  </span>

                  <strong>

                    {
                      imagenes.some(
                        (imagen) =>
                          imagen.principal
                      )
                        ? "Seleccionada"
                        : "Pendiente"
                    }

                  </strong>

                </div>


                {
                  guardando && (

                    <div>

                      <span>
                        Progreso
                      </span>

                      <strong>
                        {
                          estadoGuardado
                        }
                      </strong>

                    </div>

                  )
                }

              </div>

            </section>


            {/* ===============================
                GUARDAR
                =============================== */}

            <button
              type="submit"
              className="admin-property-form__sidebar-save"
              disabled={
                guardando
              }
            >

              <Save
                size={17}
              />

              {
                textoGuardado()
              }

            </button>

          </aside>

        </div>

      </form>

    </main>

  );

}