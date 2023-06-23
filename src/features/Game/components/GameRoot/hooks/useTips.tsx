import { useState } from "react";
import { CONFIG } from "../../../Game.consts";
import { useRandomCell } from "./useRandomCell";
import { socket } from "../../../../../api/instances";
import { EVENTS } from "../../../../../lib";

export const useTips = () => {
  const randomCell = useRandomCell();

  const [tips, setTips] = useState(CONFIG.MAX_TIPS);

  const get = () => {
    if (!tips) return;
    const nextData = randomCell.open({ income: false });
    setTips(tips - 1);

    socket.emit(EVENTS.CELL.TIPED.CLIENT, { data: nextData });
  };

  return { get, count: tips };
};
