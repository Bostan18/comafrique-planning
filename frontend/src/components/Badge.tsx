const STATUT_VARIANT: Record<string, string> = {
  "Planifiée": "info",
  "En cours": "warning",
  "Terminée": "success",
  "Annulée": "danger",
  "Reportée": "neutral",
};

const PRIORITE_VARIANT: Record<string, string> = {
  Haute: "danger",
  Normale: "info",
  Basse: "neutral",
};

export function StatutBadge({ libelle }: { libelle: string }) {
  const variant = STATUT_VARIANT[libelle] || "neutral";
  return <span className={`badge badge-${variant}`}>{libelle}</span>;
}

export function PrioriteBadge({ libelle }: { libelle: string }) {
  const variant = PRIORITE_VARIANT[libelle] || "neutral";
  return <span className={`badge badge-${variant}`}>{libelle}</span>;
}
