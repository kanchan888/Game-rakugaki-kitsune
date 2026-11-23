export interface Vec {
  x: number;
  y: number;
}

export interface Segment {
  a: Vec;
  b: Vec;
}

export interface Stage {
  name: string;
  width: number;
  height: number;
  start: Vec;
  goal: Vec;
  checkpoints: Vec[];
  ground: Segment[];
  inkPickups: Vec[];
  stars: Vec[];
}
