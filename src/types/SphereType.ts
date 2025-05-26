export interface Sphere {
  center: { x: number; y: number; z: number };
  radius: number;
  class: string;
  color: string;
}

export interface Node {
  class: string;
  u?: { center: [number, number, number]; radius: number; class: string }[];
  k?: { center: [number, number, number]; radius: number; class: string }[];
}

export interface TreeData {
  nodes: Node[];
}
