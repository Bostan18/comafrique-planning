"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { RefItem, Referentiels } from "@/lib/types";

const EMPTY: Referentiels = {
  techniciens: [],
  supports: [],
  clients: [],
  types: [],
  equipements: [],
  statuts: [],
  priorites: [],
};

export function useReferentiels() {
  const [data, setData] = useState<Referentiels>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [
          techniciens,
          supports,
          clients,
          types,
          equipements,
          statuts,
          priorites,
        ] = await Promise.all([
          api.get<RefItem[]>("/referentiels/techniciens/"),
          api.get<RefItem[]>("/referentiels/supports/"),
          api.get<RefItem[]>("/referentiels/clients/"),
          api.get<RefItem[]>("/referentiels/types-intervention/"),
          api.get<RefItem[]>("/referentiels/equipements/"),
          api.get<RefItem[]>("/referentiels/statuts"),
          api.get<RefItem[]>("/referentiels/priorites"),
        ]);
        if (!cancelled) {
          setData({
            techniciens,
            supports,
            clients,
            types,
            equipements,
            statuts,
            priorites,
          });
        }
      } catch {
        if (!cancelled) {
          setError("Impossible de charger les référentiels");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { ...data, loading, error };
}
