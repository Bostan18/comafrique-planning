"use client";

import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { api } from "@/lib/api";
import { useReferentiels } from "@/lib/useReferentiels";
import { StatutBadge } from "@/components/Badge";
import type { Intervention } from "@/lib/types";

const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function PlanningContent() {
  const referentiels = useReferentiels();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const dateDebut = isoDate(weekStart);
    const dateFin = isoDate(addDays(weekStart, 5));
    api
      .get<Intervention[]>(
        `/interventions/?date_debut=${dateDebut}&date_fin=${dateFin}`
      )
      .then(setInterventions)
      .finally(() => setLoading(false));
  }, [weekStart]);

  const days = JOURS.map((label, idx) => ({
    label,
    date: addDays(weekStart, idx),
  }));

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Planning hebdomadaire</h1>
          <p className="page-subtitle">
            Semaine du {weekStart.toLocaleDateString("fr-FR")} au{" "}
            {addDays(weekStart, 5).toLocaleDateString("fr-FR")}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn btn-secondary"
            onClick={() => setWeekStart((w) => addDays(w, -7))}
          >
            ← Semaine précédente
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setWeekStart(startOfWeek(new Date()))}
          >
            Aujourd&apos;hui
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setWeekStart((w) => addDays(w, 7))}
          >
            Semaine suivante →
          </button>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Chargement…</div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `160px repeat(${days.length}, 1fr)`,
            gap: 1,
            background: "var(--color-border)",
            borderRadius: 10,
            overflow: "hidden",
            border: "1px solid var(--color-border)",
          }}
        >
          <div style={{ background: "#f8fafc", padding: 12, fontWeight: 600, fontSize: 12 }}>
            Technicien
          </div>
          {days.map((d) => (
            <div
              key={d.label}
              style={{
                background: "#f8fafc",
                padding: 12,
                fontWeight: 600,
                fontSize: 12,
                textAlign: "center",
              }}
            >
              {d.label}
              <br />
              <span style={{ fontWeight: 400, color: "var(--color-text-muted)" }}>
                {d.date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
              </span>
            </div>
          ))}

          {referentiels.techniciens.map((tech) => (
            <div key={`row-${tech.id}`} style={{ display: "contents" }}>
              <div
                style={{
                  background: "#fff",
                  padding: 12,
                  fontSize: 13,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {tech.nom}
              </div>
              {days.map((d) => {
                const dayIso = isoDate(d.date);
                const dayInterventions = interventions.filter(
                  (i) =>
                    i.technicien_id === tech.id &&
                    i.date_planification.slice(0, 10) === dayIso
                );
                return (
                  <div
                    key={`${tech.id}-${dayIso}`}
                    style={{
                      background: "#fff",
                      padding: 8,
                      minHeight: 70,
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    {dayInterventions.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          fontSize: 11,
                          padding: "4px 6px",
                          borderRadius: 6,
                          background: "var(--color-bg)",
                          border: "1px solid var(--color-border)",
                        }}
                        title={item.commentaires || ""}
                      >
                        <div style={{ fontWeight: 600 }}>
                          {item.client?.nom || "Client ?"}
                        </div>
                        {item.statut?.libelle && (
                          <StatutBadge libelle={item.statut.libelle} />
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default function PlanningPage() {
  return (
    <RequireAuth>
      <PlanningContent />
    </RequireAuth>
  );
}
