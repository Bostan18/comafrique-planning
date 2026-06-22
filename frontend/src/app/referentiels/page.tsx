"use client";

import { useState, FormEvent } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { useReferentiels } from "@/lib/useReferentiels";
import type { RefItem } from "@/lib/types";

interface RefSection {
  key: string;
  label: string;
  endpoint: string;
  field: "nom" | "libelle";
  items: RefItem[];
}

function ReferentielsContent() {
  const { isAdmin } = useAuth();
  const referentiels = useReferentiels();
  const [newValue, setNewValue] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  if (!isAdmin) {
    return (
      <div className="empty-state">
        Cette page est réservée aux administrateurs.
      </div>
    );
  }

  const sections: RefSection[] = [
    {
      key: "techniciens",
      label: "Techniciens",
      endpoint: "/referentiels/techniciens/",
      field: "nom",
      items: referentiels.techniciens,
    },
    {
      key: "supports",
      label: "Supports",
      endpoint: "/referentiels/supports/",
      field: "nom",
      items: referentiels.supports,
    },
    {
      key: "clients",
      label: "Clients",
      endpoint: "/referentiels/clients/",
      field: "nom",
      items: referentiels.clients,
    },
    {
      key: "types",
      label: "Types d'intervention",
      endpoint: "/referentiels/types-intervention/",
      field: "libelle",
      items: referentiels.types,
    },
    {
      key: "equipements",
      label: "Équipements",
      endpoint: "/referentiels/equipements/",
      field: "libelle",
      items: referentiels.equipements,
    },
  ];

  async function handleAdd(section: RefSection, e: FormEvent) {
    e.preventDefault();
    const value = (newValue[section.key] || "").trim();
    if (!value) return;
    setError(null);
    try {
      await api.post(section.endpoint, { [section.field]: value });
      setNewValue((v) => ({ ...v, [section.key]: "" }));
      window.location.reload();
    } catch {
      setError(`Impossible d'ajouter à ${section.label}.`);
    }
  }

  async function handleDeactivate(section: RefSection, item: RefItem) {
    const confirmed = window.confirm(
      `Désactiver "${item.nom || item.libelle}" ? Il ne sera plus proposé dans les nouvelles interventions.`
    );
    if (!confirmed) return;
    try {
      await api.patch(`${section.endpoint}${item.id}/desactiver`, {});
      window.location.reload();
    } catch {
      setError(`Impossible de désactiver cet élément.`);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Référentiels</h1>
          <p className="page-subtitle">
            Gestion des listes utilisées dans les formulaires d&apos;intervention
          </p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
        }}
      >
        {sections.map((section) => (
          <div key={section.key} className="card" style={{ padding: 20 }}>
            <h3 style={{ marginTop: 0, fontSize: 14 }}>{section.label}</h3>

            <form
              onSubmit={(e) => handleAdd(section, e)}
              style={{ display: "flex", gap: 8, marginBottom: 14 }}
            >
              <input
                type="text"
                placeholder="Ajouter…"
                value={newValue[section.key] || ""}
                onChange={(e) =>
                  setNewValue((v) => ({ ...v, [section.key]: e.target.value }))
                }
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  border: "1px solid var(--color-border)",
                  borderRadius: 6,
                  fontSize: 13,
                }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: "8px 14px" }}>
                Ajouter
              </button>
            </form>

            <div>
              {section.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid var(--color-border)",
                    fontSize: 13,
                  }}
                >
                  <span>{item.nom || item.libelle}</span>
                  <button
                    className="btn btn-danger"
                    style={{ padding: "4px 10px", fontSize: 11 }}
                    onClick={() => handleDeactivate(section, item)}
                  >
                    Désactiver
                  </button>
                </div>
              ))}
              {section.items.length === 0 && (
                <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
                  Aucun élément actif.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function ReferentielsPage() {
  return (
    <RequireAuth>
      <ReferentielsContent />
    </RequireAuth>
  );
}
