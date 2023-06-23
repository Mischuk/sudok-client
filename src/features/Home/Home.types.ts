import { GameRow } from "../../lib";

export enum GameStatus {
  Init = "Init",
  Prepare = "Prepare",
  Process = "Process",
}

export interface Game {
  state: GameStatus;
  data: GameRow[];
}
