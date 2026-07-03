import type { ListSection } from "@/features/dashboard/types/dashboard.types";

/**
 * OJO: Esta función quedara en desuso cuando cada lista se alimente de su propio endpoint.
 * Con 3 hooks independientes, ListsGrid recibirá las secciones ya separadas por props
 * y no hará falta filtrar arrays, si el equipo de back no manda esto lo mantenemos mockeado con un unico endopoint
 */

export function findSection(
  lists: ListSection[] | null,
  domain: string,
): ListSection | null {
  return lists?.find((s) => s.domain === domain) ?? null;
}
