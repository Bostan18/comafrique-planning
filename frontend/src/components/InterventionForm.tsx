"use client";

import { useState, FormEvent, useEffect } from "react";
import type { Intervention, InterventionInput, Referentiels } from "@/lib/types";

interface Props {
  referentiels: Referentiels;
  initial?: Intervention | null;
  onSubmit: (data: InterventionInput) => Promise<void>;
  onCancel: () => void;
}

function toInputDate(value: string | null | undefined): string {
  if (!value) return "";
  return value.slice(0, 10);
}

export function InterventionForm({
  referentiels,
  initial,
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] = useState<InterventionInput>({
    date_planification: toInputDate(initial?.date_planification) || "",
    date_realisation: toInputDate(initial?.date_realisation) || null,
    technicien_id: initial?.technicien_id || 0,
    support_id: initial?.support_id || null,
    client_id: initial?.client_id || null,
    type_intervention_id: initial?.type_intervention_id || null,
    equipement_id: initial?.equipement_id || null,
    priorite_id: initial?.priorite_id || null,
    statut_id: initial?.statut_id || referentiels.statuts[0]?.id || 0,
    nb_vehicules: initial?.nb_vehicules || null,
    duree_heures: initial?.duree_heures || null,
    commentaires: initial?.commentaires || "",
    preuve_bl_url: initial?.preuve_bl_url || "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!initial && referentiels.statuts.length && !form.statut_id) {
      setForm((f) => ({ ...f, statut_id: referentiels.statuts[0].id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referentiels.statuts]);

  function update<K extends keyof InterventionInput>(
    key: K,
    value: InterventionInput[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.technicien_id || !form.date_planification || !form.statut_id) {
      setError("Veuillez remplir au minimum le technicien, la date et le statut.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Échec de l'enregistrement"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 20,
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: 560,
          maxHeight: "90vh",
          overflowY: "auto",
          padding: 28,
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: 18 }}>
          {initial ? "Modifier l'intervention" : "Nouvelle intervention"}
        </h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="field">
              <label htmlFor="date_planification">Date planifiée *</label>
              <input
                id="date_planification"
                type="date"
                required
                value={form.date_planification}
                onChange={(e) => update("date_planification", e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="date_realisation">Date de réalisation</label>
              <input
                id="date_realisation"
                type="date"
                value={form.date_realisation || ""}
                onChange={(e) =>
                  update("date_realisation", e.target.value || null)
                }
              />
            </div>

            <div className="field">
              <label htmlFor="technicien">Technicien *</label>
              <select
                id="technicien"
                required
                value={form.technicien_id || ""}
                onChange={(e) => update("technicien_id", Number(e.target.value))}
              >
                <option value="" disabled>
                  Sélectionner…
                </option>
                {referentiels.techniciens.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="support">Support</label>
              <select
                id="support"
                value={form.support_id || ""}
                onChange={(e) =>
                  update("support_id", e.target.value ? Number(e.target.value) : null)
                }
              >
                <option value="">—</option>
                {referentiels.supports.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="client">Client</label>
              <select
                id="client"
                value={form.client_id || ""}
                onChange={(e) =>
                  update("client_id", e.target.value ? Number(e.target.value) : null)
                }
              >
                <option value="">—</option>
                {referentiels.clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="type">Type d&apos;intervention</label>
              <select
                id="type"
                value={form.type_intervention_id || ""}
                onChange={(e) =>
                  update(
                    "type_intervention_id",
                    e.target.value ? Number(e.target.value) : null
                  )
                }
              >
                <option value="">—</option>
                {referentiels.types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.libelle}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="equipement">Équipement</label>
              <select
                id="equipement"
                value={form.equipement_id || ""}
                onChange={(e) =>
                  update(
                    "equipement_id",
                    e.target.value ? Number(e.target.value) : null
                  )
                }
              >
                <option value="">—</option>
                {referentiels.equipements.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.libelle}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="nb_vehicules">Nb véhicules</label>
              <input
                id="nb_vehicules"
                type="number"
                min={0}
                value={form.nb_vehicules ?? ""}
                onChange={(e) =>
                  update(
                    "nb_vehicules",
                    e.target.value ? Number(e.target.value) : null
                  )
                }
              />
            </div>

            <div className="field">
              <label htmlFor="priorite">Priorité</label>
              <select
                id="priorite"
                value={form.priorite_id || ""}
                onChange={(e) =>
                  update(
                    "priorite_id",
                    e.target.value ? Number(e.target.value) : null
                  )
                }
              >
                <option value="">—</option>
                {referentiels.priorites.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.libelle}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="statut">Statut *</label>
              <select
                id="statut"
                required
                value={form.statut_id || ""}
                onChange={(e) => update("statut_id", Number(e.target.value))}
              >
                {referentiels.statuts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.libelle}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="duree">Durée (heures)</label>
              <input
                id="duree"
                type="number"
                min={0}
                step={0.5}
                value={form.duree_heures ?? ""}
                onChange={(e) =>
                  update(
                    "duree_heures",
                    e.target.value ? Number(e.target.value) : null
                  )
                }
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="commentaires">Commentaires</label>
            <textarea
              id="commentaires"
              rows={3}
              value={form.commentaires || ""}
              onChange={(e) => update("commentaires", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="preuve">Lien preuve / BL</label>
            <input
              id="preuve"
              type="text"
              placeholder="https://…"
              value={form.preuve_bl_url || ""}
              onChange={(e) => update("preuve_bl_url", e.target.value)}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 8,
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={submitting}
            >
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
