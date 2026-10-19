import type { Lang } from "@/lib/i18n";

export type OwnerDict = {
  ownerTitle: string;
  statusLabel: string;
  edit: string;
  activate: string;
  pause: string;
  markSold: string;
  markRented: string;
  close: string;
  delete: string;
  deleteConfirm: string;
  save: string;
  statusNames: Record<string, string>;
};

export const ownerText: Record<Lang, OwnerDict> = {
  pl: {
    ownerTitle: "Zarządzaj ogłoszeniem",
    statusLabel: "Status",
    edit: "Edytuj ogłoszenie",
    activate: "Aktywuj",
    pause: "Wstrzymaj",
    markSold: "Oznacz jako sprzedane",
    markRented: "Oznacz jako wynajęte",
    close: "Zamknij",
    delete: "Usuń ogłoszenie",
    deleteConfirm: "Potwierdź usunięcie",
    save: "Zapisz zmiany",
    statusNames: { active: "Aktywne", paused: "Wstrzymane", sold: "Sprzedane", rented: "Wynajęte", closed: "Zamknięte", pending_review: "W weryfikacji" },
  },
  es: {
    ownerTitle: "Gestionar anuncio",
    statusLabel: "Estado",
    edit: "Editar anuncio",
    activate: "Activar",
    pause: "Pausar",
    markSold: "Marcar como vendido",
    markRented: "Marcar como alquilado",
    close: "Cerrar",
    delete: "Eliminar anuncio",
    deleteConfirm: "Confirmar eliminación",
    save: "Guardar cambios",
    statusNames: { active: "Activo", paused: "Pausado", sold: "Vendido", rented: "Alquilado", closed: "Cerrado", pending_review: "En revisión" },
  },
  en: {
    ownerTitle: "Manage listing",
    statusLabel: "Status",
    edit: "Edit listing",
    activate: "Activate",
    pause: "Pause",
    markSold: "Mark as sold",
    markRented: "Mark as rented",
    close: "Close",
    delete: "Delete listing",
    deleteConfirm: "Confirm deletion",
    save: "Save changes",
    statusNames: { active: "Active", paused: "Paused", sold: "Sold", rented: "Rented", closed: "Closed", pending_review: "Under review" },
  },
};