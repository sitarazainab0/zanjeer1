export interface NearbyUser {
  id: string;
  name: string;
  nameUr: string;
  code: string;
  distance: string;
  signal: "strong" | "medium" | "weak";
}

export const nearbyUsers: NearbyUser[] = [];

