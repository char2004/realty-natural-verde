export type RolUsuario =
  | "usuario"
  | "admin";

export type EstadoAdmin =
  | "pendiente"
  | "aprobado"
  | "rechazado";

export type ProveedorAuth =
  | "password"
  | "google";

export interface UsuarioFirestore {
  uid: string;
  nombre: string;
  email: string;
  fotoUrl?: string;
  rol: RolUsuario;
  estadoAdmin: EstadoAdmin;
  proveedor: ProveedorAuth;
}