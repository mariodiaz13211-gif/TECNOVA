export const STATUS_LABELS = {
  PENDING: "Pendiente",
  CONTACTED: "Contactado",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
} as const;

export const STATUS_OPTIONS = Object.entries(STATUS_LABELS) as [keyof typeof STATUS_LABELS, string][];

export const STATUS_COLOR: Record<keyof typeof STATUS_LABELS, string> = {
  PENDING: "text-cyan",
  CONTACTED: "text-electric",
  CONFIRMED: "text-paper",
  CANCELLED: "text-silver-dim",
};
