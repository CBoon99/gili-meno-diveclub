import { useCallback, useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import {
  GILI_MENO_CENTER,
  MAP_CATEGORY_COLOR,
  MAP_CATEGORY_LABEL,
  type MapPlaceCategory,
  giliMenoPlaces,
} from '@/lib/gili-meno-places'

function createDivIcon(color: string) {
  return L.divIcon({
    className: 'gili-meno-map-marker',
    html: `<span style="display:block;width:14px;height:14px;border-radius:999px;background:${color};border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.35)"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

const icons: Record<MapPlaceCategory, L.DivIcon> = {
  'dive-site': createDivIcon(MAP_CATEGORY_COLOR['dive-site']),
  restaurant: createDivIcon(MAP_CATEGORY_COLOR.restaurant),
  accommodation: createDivIcon(MAP_CATEGORY_COLOR.accommodation),
  sightseeing: createDivIcon(MAP_CATEGORY_COLOR.sightseeing),
}

const ALL_CATEGORIES: MapPlaceCategory[] = ['dive-site', 'restaurant', 'accommodation', 'sightseeing']

function FitBoundsToPlaces({ places }: { places: typeof giliMenoPlaces }) {
  const map = useMap()

  useEffect(() => {
    if (places.length === 0) return
    const bounds = L.latLngBounds(places.map((p) => [p.lat, p.lng]))
    map.fitBounds(bounds, { padding: [28, 28], maxZoom: 16, animate: true })
  }, [map, places])

  return null
}

export default function GiliMenoMap() {
  const [active, setActive] = useState<Set<MapPlaceCategory>>(() => new Set(ALL_CATEGORIES))

  const toggle = useCallback((c: MapPlaceCategory) => {
    setActive((prev) => {
      const next = new Set(prev)
      if (next.has(c)) next.delete(c)
      else next.add(c)
      if (next.size === 0) next.add(c)
      return next
    })
  }, [])

  const visible = useMemo(() => giliMenoPlaces.filter((p) => active.has(p.category)), [active])

  return (
    <div className="overflow-hidden rounded-2xl border border-white/15 bg-ocean-900/60 shadow-xl shadow-black/20 backdrop-blur">
      <div className="flex flex-wrap gap-2 border-b border-white/10 p-4">
        {ALL_CATEGORIES.map((c) => {
          const on = active.has(c)
          return (
            <button
              key={c}
              type="button"
              onClick={() => toggle(c)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                on
                  ? 'text-ocean-950 shadow-md'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/75'
              }`}
              style={
                on
                  ? {
                      backgroundColor: MAP_CATEGORY_COLOR[c],
                      boxShadow: `0 0 0 1px rgba(255,255,255,0.2)`,
                    }
                  : undefined
              }
            >
              {MAP_CATEGORY_LABEL[c]}
            </button>
          )
        })}
      </div>
      <div
        className="relative h-[min(68vh,520px)] w-full [&_.leaflet-control-attribution]:rounded-bl-xl [&_.leaflet-control-attribution]:bg-ocean-950/90 [&_.leaflet-control-attribution]:text-[10px] [&_.leaflet-control-attribution]:text-white/60"
        role="region"
        aria-label="Interactive map of Gili Meno with dive sites and local places"
      >
        <MapContainer
          center={[GILI_MENO_CENTER.lat, GILI_MENO_CENTER.lng]}
          zoom={15}
          className="z-0 h-full w-full"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBoundsToPlaces places={visible} />
          {visible.map((p) => (
            <Marker key={p.id} position={[p.lat, p.lng]} icon={icons[p.category]}>
              <Popup className="[&_.leaflet-popup-content-wrapper]:rounded-xl [&_.leaflet-popup-content-wrapper]:border [&_.leaflet-popup-content-wrapper]:border-ocean-700 [&_.leaflet-popup-content-wrapper]:bg-ocean-900 [&_.leaflet-popup-content]:m-3 [&_.leaflet-popup-content]:min-w-[200px] [&_.leaflet-popup-content]:text-white [&_.leaflet-popup-tip]:bg-ocean-900">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ocean-300">
                    {MAP_CATEGORY_LABEL[p.category]}
                  </p>
                  <p className="font-display text-base font-semibold text-white">{p.name}</p>
                  {p.blurb && <p className="text-sm leading-snug text-white/75">{p.blurb}</p>}
                  {p.href && (
                    <a
                      href={p.href}
                      className="inline-flex text-sm font-semibold text-ocean-400 hover:text-ocean-300"
                    >
                      Read more →
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
