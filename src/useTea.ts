import { useCallback, useEffect, useReducer } from 'react';
import type { Cmd, Dispatch } from './cmd';

export type Init<Model, Msg> = () => [Model, Cmd<Msg>];
export type Update<Model, Msg> = (model: Model, msg: Msg) => [Model, Cmd<Msg>];

type TeaMsg<Msg> =
  | {
      type: 'dispatch';
      msg: Msg;
    }
  | {
      type: 'clear-and-dispatch';
      cmd: Cmd<Msg>;
      msg: Msg;
    };

export type UseTeaProps<Model, Msg> = {
  init: Init<Model, Msg>;
  update: Update<Model, Msg>;
};

export const useTea = <Model, Msg>({
  init,
  update,
}: UseTeaProps<Model, Msg>): [Model, Dispatch<Msg>] => {
  const reducer = useCallback(
    (
      [model, cmd]: [Model, Cmd<Msg>],
      teaMsg: TeaMsg<Msg>
    ): [Model, Cmd<Msg>] => {
      switch (teaMsg.type) {
        case 'dispatch': {
          const [newModel, newCmd] = update(model, teaMsg.msg);
          return [newModel, new Set([...cmd, ...newCmd])];
        }

        case 'clear-and-dispatch': {
          const clearedCmd = new Set(
            [...cmd].filter((cmdUnit) => !teaMsg.cmd.has(cmdUnit))
          );
          return reducer([model, clearedCmd], {
            type: 'dispatch',
            msg: teaMsg.msg,
          });
        }

        default: {
          const exhaustiveCheck: never = teaMsg;
          return exhaustiveCheck;
        }
      }
    },
    [update]
  );

  const [[model, cmd], teaDispatch] = useReducer(reducer, undefined, init);

  const dispatch = useCallback(
    (msg: Msg) => {
      teaDispatch({ type: 'dispatch', msg });
    },
    [teaDispatch]
  );

  const clearAndDispatch = useCallback(
    (msg: Msg) => {
      teaDispatch({ type: 'clear-and-dispatch', cmd, msg });
    },
    [cmd, teaDispatch]
  );

  useEffect(() => {
    if (cmd.size === 0) {
      return;
    }

    cmd.forEach((cmdUnit) => cmdUnit(clearAndDispatch));
  }, [cmd, clearAndDispatch]);

  return [model, dispatch];
};
