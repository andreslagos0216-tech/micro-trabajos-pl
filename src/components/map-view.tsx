"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export type MapPoint = {
  id: string;
  title: string;
  lat: number;
  lng: number;
  city: string;
  pay: string;
};

function escapeHtml(value: string) {
  const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return value.replace(/[&<>"']/g, (c) => map[c]);
}

export function MapView({ points, openLabel }: { points: MapPoint[]; openLabel: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: { remove: () => void } | null = null;
    let cancelled = false;

    // Leaflet solo se carga en el navegador
    import("leaflet").then((L) => {
      if (cancelled || !ref.current) return;

      const instance = L.map(ref.current).setView([52.07, 19.48], 6);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(instance);

      const bounds: [number, number][] = [];
      for (const p of points) {
        const marker = L.circleMarker([p.lat, p.lng], {
          radius: 8,
          color: "#1d4ed8",
          weight: 2,
          fillColor: "#3b82f6",
          fillOpacity: 0.85,
        }).addTo(instance);
        marker.bindPopup(
          `<strong>${escapeHtml(p.title)}</strong><br/>${escapeHtml(p.city)} · ${escapeHtml(p.pay)}<br/>` +
            `<a href="/jobs/${p.id}">${escapeHtml(openLabel)}</a>`
        );
        bounds.push([p.lat, p.lng]);
      }

      if (bounds.length > 1) instance.fitBounds(bounds, { padding: [30, 30] });
      map = instance;
    });

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [points, openLabel]);

  return (
    <div
      ref={ref}
      className="z-0 h-[70vh] min-h-[360px] w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"
    />
  );
}
