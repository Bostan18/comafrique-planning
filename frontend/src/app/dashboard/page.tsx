"use client";

import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { api } from "@/lib/api";
import type { Intervention } from "@/lib/types";

function DashboardContent() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Intervention[]>("/interventions/")
      .then(setInterventions)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
        </div>
        <div className="empty-state">Chargement…</div>
      </>
    );
  }

  const total = interventions.length;
  const terminees = interventions.filter(
    (i) => i.statut?.libelle === "Terminée"
  ).length;
  const enCours = interventions.filter(
    (i) => i.statut?.libelle === "En cours"
  ).length;
  const planifiees = interventions.filter(
    (i) => i.statut?.libelle === "Planifiée"
  ).length;
  const tauxRealisation = total > 0 ? Math.round((terminees / total) * 100) : 0;

  const parTechnicien = interventions.reduce<Record<string, number>>(
    (acc, i) => {
      const nom = i.technicien?.nom || "Non assigné";
      acc[nom] = (acc[nom] || 0) + 1;
      return acc;
    },
    {}
  );

  const topClients = interventions.reduce<Record<string, number>>((acc, i) => {
    const nom = i.client?.nom || "Non renseigné";
    acc[nom] = (acc[nom] || 0) + 1;
    return acc;
  }, {});

  const topClientsList = Object.entries(topClients)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Indicateurs calculés en temps réel</p>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="card kpi-card">
          <div className="kpi-value">{total}</div>
          <div className="kpi-label">Interventions au total</div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-value" style={{ color: "var(--color-success)" }}>
            {terminees}
          </div>
          <div className="kpi-label">Terminées ({tauxRealisation}%)</div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-value" style={{ color: "var(--color-warning)" }}>
            {enCours}
          </div>
          <div className="kpi-label">En cours</div>
        </div>
        <div className="card kpi-card">
          <div className="kpi-value" style={{ color: "var(--color-info)" }}>
            {planifiees}
          </div>
          <div className="kpi-label">Planifiées</div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
        }}
      >
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginTop: 0, fontSize: 14 }}>Charge par technicien</h3>
          {Object.entries(parTechnicien).map(([nom, count]) => (
            <div
              key={nom}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid var(--color-border)",
                fontSize: 13,
              }}
            >
              <span>{nom}</span>
              <strong>{count}</strong>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ marginTop: 0, fontSize: 14 }}>Top 5 clients</h3>
          {topClientsList.map(([nom, count]) => (
            <div
              key={nom}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid var(--color-border)",
                fontSize: 13,
              }}
            >
              <span>{nom}</span>
              <strong>{count}</strong>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}
