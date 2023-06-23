import { CellValue, GameRow } from "../../lib";

export interface CellCoordinates {
  row: number;
  col: number;
}

export interface SelectedCell {
  position: CellCoordinates | null;
  value: CellValue;
}

export interface RandomItem {
  row: number;
  col: number;
  answer: number;
}

export interface History {
  selected: SelectedCell;
  data: GameRow[];
}
