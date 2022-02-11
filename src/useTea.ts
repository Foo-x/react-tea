import type { Dispatch } from 'react';
import { useCallback, useEffect, useReducer } from 'react';
import type { Cmd } from './Cmd';
import type { Effect } from './Sub';

export type UseTeaInit<Model, Msg> = () => [Model, Cmd<Msg>];

export type UseTeaUpdateProps<Model, Msg> = {
  model: Model;
  msg: Msg;
};
export type UseTeaUpdate<Model, Msg> = (
  useTeaUpdateProps: UseTeaUpdateProps<Model, Msg>
) => [Model, Cmd<Msg>];

type UseTeaProps<Model, Msg> = {
  init: UseTeaInit<Model, Msg>;
  update: UseTeaUpdate<Model, Msg>;
  subscriptions: Effect<Model, Msg>[];
};

export const useTea = <Model, Msg>({
  init,
  update,
  subscriptions,
}: UseTeaProps<Model, Msg>): [Model, Dispatch<Msg>] => {
  const reducer = useCallback(
    ([model]: [Model, Cmd<Msg>], msg: Msg): [Model, Cmd<Msg>] => {
      return update({ model, msg });
    },
    [update]
  );

  const [[model, cmd], dispatch] = useReducer(reducer, undefined, init);

  useEffect(() => {
    if (typeof cmd === 'symbol') {
      return;
    }
    if (!Array.isArray(cmd)) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      cmd(dispatch);
      return;
    }

    cmd.forEach((cmdUnit) => cmdUnit(dispatch));
  }, [cmd]);

  subscriptions.forEach((sub) => sub({ model, dispatch }));

  return [model, dispatch];
};
