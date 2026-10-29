"use client";

import { useCallback, useEffect, useState } from "react";

// Préférences dans le navigateur uniquement (pas de compte). Vide côté serveur, chargé après le premier rendu.
export function useStoredSet(key: string): [Set<string>, (id: string) => void] {
  const [items, setItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(key);
      if (saved) setItems(new Set(JSON.parse(saved) as string[]));
    } catch {
      // Stockage indisponible (navigation privée, données bloquées) : on repart de zéro.
    }
  }, [key]);

  const toggle = useCallback(
    (id: string) => {
      setItems((current) => {
        const next = new Set(current);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        try {
          window.localStorage.setItem(key, JSON.stringify([...next]));
        } catch {
          // Sans stockage, le choix reste valable pour la session.
        }
        return next;
      });
    },
    [key],
  );

  return [items, toggle];
}
