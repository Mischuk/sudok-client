import { createContext } from "react";
import { DTO_Player } from "../../lib";
import { GameStatus } from "./Home.types";

export const HomeContext = createContext<{ players: DTO_Player[]; status: GameStatus }>({
  players: [],
  status: GameStatus.Init,
});
