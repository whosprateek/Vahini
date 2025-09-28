export type Station = {
  id: string
  name: string
  zone: string
  region: "north" | "east" | "south" | "west"
  voltage: string
}

const stations: Station[] = [
  { id: "STA-N-01", name: "Sector A Primary", zone: "A", region: "north", voltage: "33kV" },
  { id: "STA-N-02", name: "Sector A Distribution", zone: "A", region: "north", voltage: "11kV" },
  { id: "STA-E-01", name: "Sector B Secondary", zone: "B", region: "east", voltage: "33kV" },
  { id: "STA-E-02", name: "Market Substation", zone: "B", region: "east", voltage: "11kV" },
  { id: "STA-S-01", name: "Sector C Primary", zone: "C", region: "south", voltage: "33kV" },
  { id: "STA-S-02", name: "Industrial Hub", zone: "C", region: "south", voltage: "11kV" },
  { id: "STA-W-01", name: "Sector D Primary", zone: "D", region: "west", voltage: "33kV" },
  { id: "STA-W-02", name: "Residential Grid", zone: "D", region: "west", voltage: "11kV" },
]

export function getStations(region: string) {
  if (region === 'all') return stations
  return stations.filter(s => s.region === region)
}
