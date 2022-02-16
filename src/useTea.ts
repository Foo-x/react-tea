import type { Dispatch } from 'react';
import { useEffect, useReducer } from 'react';
import type { Cmd } from './Cmd';
import type { Effect, EffectorProps } from './Sub';

export type UseTeaInit<Model, Msg> = () => [Model, Cmd<Msg>];

export type UseTeaUpdateProps<Model, Msg> = {
  model: Model;
  msg: Msg;
};
export type UseTeaUpdate<Model, Msg> = (
  useTeaUpdateProps: UseTeaUpdateProps<Model, Msg>
) => [Model, Cmd<Msg>];

export type UseTeaProps<Model, Msg> = {
  init: UseTeaInit<Model, Msg>;
  update: UseTeaUpdate<Model, Msg>;
  subscriptions: Effect<Model, Msg, never>[];
};

export type UseTeaResult<Model, Msg> = {
  model: Model;
  dispatch: Dispatch<Msg>;
};

export const useTea = <Model, Msg>(
  useTeaProps: UseTeaProps<Model, Msg>
): UseTeaResult<Model, Msg> => {
  const { init, update, subscriptions } = useTeaProps;

  const reducer = ([model]: [Model, Cmd<Msg>], msg: Msg): [Model, Cmd<Msg>] =>
    update({ model, msg });

  const [[model, cmd], dispatch] = useReducer(reducer, undefined, init);

  useEffect(() => {
    if (typeof cmd === 'symbol') {
      return;
    }
    [cmd].flat().forEach((cmdUnit) => cmdUnit(dispatch));
  }, [cmd]);

  subscriptions.forEach((sub) =>
    sub({ model, dispatch } as EffectorProps<Model, Msg, never>)
  );

  return { model, dispatch };
};
