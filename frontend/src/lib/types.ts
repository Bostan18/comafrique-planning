export type Role = "admin" | "editeur" | "lecteur";

export interface UserOut {
  id: number;
  nom: string;
  email: string;
  role: Role;
  actif: boolean;
}

export interface RefItem {
  id: number;
  nom?: string;
  libelle?: string;
  actif: boolean;
  ordre_affichage?: number;
}

export interface Intervention {
  id: number;
  date_planification: string;
  date_realisation: string | null;
  technicien_id: number;
  support_id: number | null;
  client_id: number | null;
  type_intervention_id: number | null;
  equipement_id: number | null;
  priorite_id: number | null;
  statut_id: number;
  nb_vehicules: number | null;
  duree_heures: number | null;
  commentaires: string | null;
  preuve_bl_url: string | null;
  cree_le: string;
  modifie_le: string | null;

  technicien?: RefItem;
  support?: RefItem;
  client?: RefItem;
  type_intervention?: RefItem;
  equipement?: RefItem;
  priorite?: RefItem;
  statut?: RefItem;
}

export interface InterventionInput {
  date_planification: string;
  date_realisation?: string | null;
  technicien_id: number;
  support_id?: number | null;
  client_id?: number | null;
  type_intervention_id?: number | null;
  equipement_id?: number | null;
  priorite_id?: number | null;
  statut_id: number;
  nb_vehicules?: number | null;
  duree_heures?: number | null;
  commentaires?: string | null;
  preuve_bl_url?: string | null;
}

export interface Referentiels {
  techniciens: RefItem[];
  supports: RefItem[];
  clients: RefItem[];
  types: RefItem[];
  equipements: RefItem[];
  statuts: RefItem[];
  priorites: RefItem[];
}
