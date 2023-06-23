import { useContext, useEffect, useState } from "react";
import { Difficults } from "../../components/Difficults/Difficults";
import { HomeContext } from "./Home.context";
import { useGame, usePlayers } from "./Home.hooks";
import { Root, Waiting } from "./Home.styles";
import { socket } from "../../api/instances";
import { GameStatus } from "./Home.types";
import { Game } from "../Game/Game";
import { EVENTS } from "../../lib";
import { MIN_PLAYERS } from "../../utils/consts";
import { MenuPopup } from "./MenuPopup/MenuPopup";
import { AuthContext } from "../Auth/Auth.context";

const Home = () => {
  const user = useContext(AuthContext);
  const { players, totalPlayers } = usePlayers();
  const { data, status, changeStatus, run, reset } = useGame();
  const [endGame, setEndGame] = useState({
    isFinish: false,
    win: false,
  });

  useEffect(() => {
    const prepare = () => changeStatus(GameStatus.Prepare);

    socket.on(EVENTS.GAME.PREPARE.SERVER, prepare);

    return () => {
      socket.off(EVENTS.GAME.PREPARE.SERVER, prepare);
    };
  }, [changeStatus]);

  useEffect(() => {
    socket.on(EVENTS.GAME.START.SERVER, run);

    return () => {
      socket.off(EVENTS.GAME.START.SERVER, run);
    };
  }, [run]);

  useEffect(() => {
    const handleEndGame = ({ id }: { id: string }) => {
      setEndGame({
        isFinish: true,
        win: user.id === id,
      });
    };

    socket.on(EVENTS.GAME.END, handleEndGame);
    return () => {
      socket.off(EVENTS.GAME.END, handleEndGame);
    };
  }, [user.id]);

  useEffect(() => {
    const handleRestartGame = () => {
      setEndGame({
        isFinish: false,
        win: false,
      });

      reset();
    };

    socket.on(EVENTS.GAME.RESTART.SERVER, handleRestartGame);

    return () => {
      socket.off(EVENTS.GAME.RESTART.SERVER, handleRestartGame);
    };
  }, [reset]);

  const isWaiting = totalPlayers !== MIN_PLAYERS && totalPlayers > 0;
  const isInitial = status === GameStatus.Init;
  const isProcess = status === GameStatus.Process || status === GameStatus.Prepare;
  const isDiffing = isInitial && totalPlayers === MIN_PLAYERS;

  return (
    <HomeContext.Provider value={{ status, players }}>
      <Root>
        {isWaiting && !isProcess && <Waiting>Waiting for the second player...</Waiting>}
        {isDiffing && <Difficults />}
        {isProcess && <Game initialData={data} />}
        {endGame.isFinish && <MenuPopup win={endGame.win} />}
      </Root>
    </HomeContext.Provider>
  );
};
export { Home };
