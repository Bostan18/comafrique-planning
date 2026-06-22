"use client";

import { useEffect, useState, useCallback } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { useReferentiels } from "@/lib/useReferentiels";
import { StatutBadge, PrioriteBadge } from "@/components/Badge";
import { InterventionForm } from "@/components/InterventionForm";
import type { Intervention, InterventionInput } from "@/lib/types";

function formatDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleDateString("fr-FR");
}

function InterventionsContent() {
  const { canEdit } = useAuth();
  const referentiels = useReferentiels();

  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterTechnicien, setFilterTechnicien] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [filterClient, setFilterClient] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Intervention | null>(null);
  const [exporting, setExporting] = useState(false);

  const loadInterventions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterTechnicien) params.set("technicien_id", filterTechnicien);
      if (filterStatut) params.set("statut_id", filterStatut);
      if (filterClient) params.set("client_id", filterClient);
      const query = params.toString();
      const data = await api.get<Intervention[]>(
        `/interventions/${query ? `?${query}` : ""}`
      );
      setInterventions(data);
    } catch {
      setError("Impossible de charger les interventions.");
    } finally {
      setLoading(false);
    }
  }, [filterTechnicien, filterStatut, filterClient]);

  useEffect(() => {
    loadInterventions();
  }, [loadInterventions]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(item: Intervention) {
    setEditing(item);
    setFormOpen(true);
  }

  async function handleFormSubmit(data: InterventionInput) {
    if (editing) {
      await api.patch(`/interventions/${editing.id}`, data);
    } else {
      await api.post("/interventions/", data);
    }
    setFormOpen(false);
    setEditing(null);
    await loadInterventions();
  }

  async function handleDelete(item: Intervention) {
    const confirmed = window.confirm(
      `Supprimer l'intervention du ${formatDate(item.date_planification)} pour ${
        item.client?.nom || "ce client"
      } ?`
    );
    if (!confirmed) return;
    await api.delete(`/interventions/${item.id}`);
    await loadInterventions();
  }

  async function handleExport() {
    setExporting(true);
    try {
      const blob = await api.download("/export/interventions.xlsx");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Planning_Interventions_Comafrique_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Échec de l'export Excel.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Interventions</h1>
          <p className="page-subtitle">
            {interventions.length} intervention
            {interventions.length > 1 ? "s" : ""}
            {(filterTechnicien || filterStatut || filterClient) && " (filtrées)"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn btn-secondary"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? "Export…" : "Exporter en Excel"}
          </button>
          {canEdit && (
            <button className="btn btn-primary" onClick={openCreate}>
              + Nouvelle intervention
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="toolbar">
        <select
          value={filterTechnicien}
          onChange={(e) => setFilterTechnicien(e.target.value)}
        >
          <option value="">Tous les techniciens</option>
          {referentiels.techniciens.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nom}
            </option>
          ))}
        </select>

        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          {referentiels.statuts.map((s) => (
            <option key={s.id} value={s.id}>
              {s.libelle}
            </option>
          ))}
        </select>

        <select
          value={filterClient}
          onChange={(e) => setFilterClient(e.target.value)}
        >
          <option value="">Tous les clients</option>
          {referentiels.clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty-state">Chargement des interventions…</div>
        ) : interventions.length === 0 ? (
          <div className="empty-state">
            Aucune intervention ne correspond à ces critères.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date planif.</th>
                <th>Client</th>
                <th>Technicien</th>
                <th>Type</th>
                <th>Priorité</th>
                <th>Statut</th>
                <th>Réalisation</th>
                {canEdit && <th></th>}
              </tr>
            </thead>
            <tbody>
              {interventions.map((item) => (
                <tr key={item.id}>
                  <td>{formatDate(item.date_planification)}</td>
                  <td>{item.client?.nom || "—"}</td>
                  <td>{item.technicien?.nom || "—"}</td>
                  <td>{item.type_intervention?.libelle || "—"}</td>
                  <td>
                    {item.priorite?.libelle ? (
                      <PrioriteBadge libelle={item.priorite.libelle} />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    {item.statut?.libelle ? (
                      <StatutBadge libelle={item.statut.libelle} />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{formatDate(item.date_realisation)}</td>
                  {canEdit && (
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: "5px 10px", fontSize: 12 }}
                          onClick={() => openEdit(item)}
                        >
                          Modifier
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: "5px 10px", fontSize: 12 }}
                          onClick={() => handleDelete(item)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {formOpen && (
        <InterventionForm
          referentiels={referentiels}
          initial={editing}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setFormOpen(false);
            setEditing(null);
          }}
        />
      )}
    </>
  );
}

export default function InterventionsPage() {
  return (
    <RequireAuth>
      <InterventionsContent />
    </RequireAuth>
  );
}
