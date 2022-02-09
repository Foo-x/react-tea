import { useCallback, useEffect, useReducer } from 'react';
import type { Cmd, Dispatch } from './Cmd';
import { Sub } from './Sub';

export type Init<Model, Msg> = () => [Model, Cmd<Msg>];
export type Update<Model, Msg> = (model: Model, msg: Msg) => [Model, Cmd<Msg>];

export type UseTeaProps<Model, Msg> = {
  init: Init<Model, Msg>;
  update: Update<Model, Msg>;
  subscriptions: Sub<Model, Msg>;
};

export const useTea = <Model, Msg>({
  init,
  update,
  subscriptions,
}: UseTeaProps<Model, Msg>): [Model, Dispatch<Msg>] => {
  const reducer = useCallback(
    ([model]: [Model, Cmd<Msg>], msg: Msg): [Model, Cmd<Msg>] => {
      return update(model, msg);
    },
    [update]
  );

  const [[model, cmd], dispatch] = useReducer(reducer, undefined, init);

  useEffect(() => {
    if (cmd.length === 0) {
      return;
    }

    cmd.forEach((cmdUnit) => cmdUnit(dispatch));
  }, [cmd]);

  subscriptions.forEach((sub) => sub(model, dispatch));

  return [model, dispatch];
};
