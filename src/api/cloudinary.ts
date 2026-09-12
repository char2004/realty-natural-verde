export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
  resourceType: string;
  format: string | null;
  width: number | null;
  height: number | null;
  bytes: number;
  originalFilename: string;
}


interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  resource_type: string;

  format?: string;

  width?: number;

  height?: number;

  bytes: number;

  original_filename?: string;
}


const cloudName =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;


const uploadPreset =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;


function validarConfiguracion(): void {

  if (!cloudName) {
    throw new Error(
      "No se configuró VITE_CLOUDINARY_CLOUD_NAME."
    );
  }

  if (!uploadPreset) {
    throw new Error(
      "No se configuró VITE_CLOUDINARY_UPLOAD_PRESET."
    );
  }

}


export async function subirImagenCloudinary(
  archivo: File
): Promise<CloudinaryUploadResult> {

  validarConfiguracion();


  const formData =
    new FormData();


  formData.append(
    "file",
    archivo
  );


  formData.append(
    "upload_preset",
    uploadPreset
  );


  const respuesta =
    await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );


  if (!respuesta.ok) {

    const mensaje =
      await respuesta.text();


    throw new Error(
      `Error subiendo imagen a Cloudinary: ${mensaje}`
    );

  }


  const datos =
    (await respuesta.json()) as CloudinaryResponse;


  return {
    secureUrl:
      datos.secure_url,

    publicId:
      datos.public_id,

    resourceType:
      datos.resource_type,

    format:
      datos.format ?? null,

    width:
      datos.width ?? null,

    height:
      datos.height ?? null,

    bytes:
      datos.bytes,

    originalFilename:
      datos.original_filename ??
      archivo.name,
  };

}


export async function subirArchivoCloudinary(
  archivo: File
): Promise<CloudinaryUploadResult> {

  validarConfiguracion();


  const formData =
    new FormData();


  formData.append(
    "file",
    archivo
  );


  formData.append(
    "upload_preset",
    uploadPreset
  );


  const respuesta =
    await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      {
        method: "POST",
        body: formData,
      }
    );


  if (!respuesta.ok) {

    const mensaje =
      await respuesta.text();


    throw new Error(
      `Error subiendo archivo a Cloudinary: ${mensaje}`
    );

  }


  const datos =
    (await respuesta.json()) as CloudinaryResponse;


  return {
    secureUrl:
      datos.secure_url,

    publicId:
      datos.public_id,

    resourceType:
      datos.resource_type,

    format:
      datos.format ?? null,

    width:
      datos.width ?? null,

    height:
      datos.height ?? null,

    bytes:
      datos.bytes,

    originalFilename:
      datos.original_filename ??
      archivo.name,
  };

}