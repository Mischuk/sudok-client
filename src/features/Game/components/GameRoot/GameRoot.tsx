import { useContext, useEffect, useState } from "react";
import { BoardField, Controls, Root } from "./GameRoot.styles";
import { Board } from "../Board/Board";
import { DataContext, HistoryContext, SelectContext } from "../../Game.context";
import { Control } from "../../../../components/Control/Control";
import { InputNumbers } from "../InputNumbers/InputNumbers";
import { useCurrents } from "./hooks/useCurrents";
import { useTips } from "./hooks/useTips";
import { useRandomCell } from "./hooks/useRandomCell";
import { socket } from "../../../../api/instances";
import { EVENTS, CellNotes } from "../../../../lib";
import { AuthContext } from "../../../Auth/Auth.context";
import { toggleNum } from "../../../../utils";
import { Progress } from "../Progress/Progress";
import { useProgress } from "./hooks/useProgress";

export const GameRoot = () => {
  const { id } = useContext(AuthContext);
  const { progress } = useProgress();
  const history = useContext(HistoryContext);
  const tips = useTips();
  const { selected, onSelectCell } = useContext(SelectContext);
  const { currents } = useCurrents();
  const randomCell = useRandomCell();
  const [isNotes, setIsNotes] = useState(false);
  const { voidCellsTotal } = useContext(DataContext);

  const onBackward = () => history.prev();

  const onClearCell = () => {
    if (!selected.position) return;
    history.push();

    const { updateCell } = currents(selected);

    const nextData = updateCell({ value: null, notes: [], error: false });

    onSelectCell({
      value: null,
      position: selected.position,
    });

    socket.emit(EVENTS.CELL.OPENED, { data: nextData });
  };

  const onTip = () => tips.get();

  const onClickNum = (num: CellNotes) => {
    if (!selected.position || selected.value) return;

    const { cell, updateCell, updateSquare } = currents(selected);

    if (isNotes) {
      updateCell({ notes: [...toggleNum(cell.notes, num)] });
    }

    if (!isNotes) {
      const error = cell.answer !== num;

      const nextData = updateSquare({
        value: num,
        nextCell: {
          value: num,
          error,
        },
      });

      onSelectCell({ value: num, position: selected.position });

      if (error) {
        socket.emit(EVENTS.CELL.MISTAKE.CLIENT, { data: nextData });
      } else {
        socket.emit(EVENTS.CELL.OPENED, { data: nextData });
      }
    }
  };

  useEffect(() => {
    const onCellTipedServer = () => {
      const nextData = randomCell.open({ income: true });
      socket.emit(EVENTS.CELL.OPENED, { data: nextData });
    };

    socket.on(EVENTS.CELL.TIPED.SERVER, onCellTipedServer);

    return () => {
      socket.off(EVENTS.CELL.TIPED.SERVER, onCellTipedServer);
    };
  }, [id, randomCell, voidCellsTotal]);

  return (
    <Root>
      <Progress values={progress} />

      <BoardField>
        <Board />
      </BoardField>

      <Controls>
        <Control onClick={onBackward} icon="back" />
        <Control onClick={onClearCell} icon="erase" />
        <Control
          isActive={isNotes}
          label={isNotes ? "ON" : "OFF"}
          onClick={() => setIsNotes(!isNotes)}
          icon="note"
        />
        <Control
          label={`${tips.count}`}
          isActive={!!tips.count}
          styles={{ border: "none" }}
          onClick={onTip}
          icon="tip"
        />
      </Controls>

      <InputNumbers onClick={(index) => onClickNum(index)} isNotes={isNotes} />
    </Root>
  );
};
