export type TileType = {
  id: number;
  value: string;
  matched: boolean;
  selected: boolean;
};

export type GameState = {
  score: number;
  tiles: TileType[];
  selectedTiles: number[];
  matchedTiles: number[];
};