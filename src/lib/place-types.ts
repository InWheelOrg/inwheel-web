export type AccessibilityLevel = "good" | "limited" | "no";
export type DoorType = "automatic" | "manual" | "revolving" | "none";
export type SurfaceType =
  | "asphalt"
  | "paving_stones"
  | "cobblestone"
  | "gravel"
  | "concrete"
  | "wood"
  | "carpet"
  | "tiles";
export type Category =
  | "mall"
  | "airport"
  | "train_station"
  | "restaurant"
  | "cafe"
  | "shop"
  | "toilet"
  | "parking"
  | "entrance"
  | "other"
  | (string & {});

export type DoorProps = {
  type?: DoorType;
  width?: AccessibilityLevel;
};

export type EntranceProps = {
  is_level?: boolean;
  has_fixed_ramp?: boolean;
  has_removable_ramp?: boolean;
  slope_percent?: AccessibilityLevel;
  width?: AccessibilityLevel;
  door?: DoorProps;
  has_intercom?: boolean;
  audit_flags?: string[];
};

export type PathwayProps = {
  width?: AccessibilityLevel;
  surface?: SurfaceType;
  is_kerbstone_free?: boolean;
  has_steps?: boolean;
  audit_flags?: string[];
};

export type RestroomProps = {
  is_accessible?: boolean;
  door_width?: AccessibilityLevel;
  turning_radius?: AccessibilityLevel;
  has_grab_rails?: boolean;
  has_roll_in_shower?: boolean;
  toilet_seat_height?: AccessibilityLevel;
  has_emergency_pull?: boolean;
  has_changing_table?: boolean;
  audit_flags?: string[];
};

export type ParkingProps = {
  has_disabled_spaces?: boolean;
  count?: number;
  distance_to_entrance?: AccessibilityLevel;
  width?: AccessibilityLevel;
  has_dedicated_signage?: boolean;
  audit_flags?: string[];
};

export type ElevatorProps = {
  width?: AccessibilityLevel;
  depth?: AccessibilityLevel;
  door_width?: AccessibilityLevel;
  has_braille?: boolean;
  has_audio?: boolean;
  audit_flags?: string[];
};

export type AccessibilityProfile = {
  id?: string;
  place_id?: string;
  source_reports?: { source: string; value: string; recorded_at: string }[];
  entrance?: EntranceProps | null;
  pathways?: PathwayProps | null;
  restroom?: RestroomProps | null;
  parking?: ParkingProps | null;
  elevator?: ElevatorProps | null;
  updated_at?: string;
  submitted_at?: string;
  user_verified?: boolean;
};

export type Place = {
  id: string;
  osm_id?: number;
  osm_type?: "node" | "way" | "relation";
  name: string;
  lng: number;
  lat: number;
  category: Category;
  rank?: 1 | 2 | 3;
  parent_id?: string;
  accessibility?: AccessibilityProfile;
  tags?: Record<string, string>;
  source?: string;
  status?: "active" | "closed" | "osm_removed";
  created_at?: string;
  updated_at?: string;
  submitted_at?: string;
};

export type PlacePage = {
  data: Place[];
  next_cursor?: string;
};

export const ACCESSIBILITY_SECTIONS = [
  "entrance",
  "pathways",
  "restroom",
  "parking",
  "elevator",
] as const;
export type AccessibilitySection = (typeof ACCESSIBILITY_SECTIONS)[number];
