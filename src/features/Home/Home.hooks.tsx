import { useCallback, useEffect, useMemo, useState } from "react";
import { socket } from "../../api/instances";
import { Game, GameStatus } from "./Home.types";
import { DTO_Player, EVENTS, GameRow } from "../../lib";
import { INITIAL_GAME_DATA } from "./Home.consts";

export const usePlayers = () => {
  const [players, setPlayers] = useState<DTO_Player[]>([]);

  useEffect(() => {
    const updatePlayers = ({ players }: { players: DTO_Player[] }) => setPlayers(players);

    socket.on(EVENTS.PLAYER.CONNECT.SERVER, updatePlayers);
    socket.on(EVENTS.PLAYER.DISCONNECT.SERVER, updatePlayers);

    return () => {
      socket.off(EVENTS.PLAYER.CONNECT.SERVER, updatePlayers);
      socket.off(EVENTS.PLAYER.DISCONNECT.SERVER, updatePlayers);
    };
  }, []);

  return { players, totalPlayers: players.length };
};

const INITIAL_GAME = {
  state: GameStatus.Init,
  data: INITIAL_GAME_DATA,
};
export const useGame = () => {
  const [game, setGame] = useState<Game>(INITIAL_GAME);

  const changeGameStatus = useCallback(
    (status: GameStatus) => setGame((prev) => ({ ...prev, state: status })),
    []
  );

  const run = useCallback(({ data }: { data: GameRow[] }) => {
    setGame({
      state: GameStatus.Process,
      data,
    });
  }, []);

  const reset = useCallback(() => {
    setGame(INITIAL_GAME);
  }, []);

  return useMemo(
    () => ({
      run,
      data: game.data,
      status: game.state,
      changeStatus: changeGameStatus,
      reset,
    }),
    [changeGameStatus, game.state, run, game.data, reset]
  );
};
