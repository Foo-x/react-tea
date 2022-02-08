import { EffectCallback, useEffect } from 'react';
import { Dispatch } from './Cmd';

export type Effect<Model, Msg> = (
  model: Model,
  dispatch: Dispatch<Msg>
) => void;
export type Effector<Model, Msg> = (
  model: Model,
  dispatch: Dispatch<Msg>
) => [EffectCallback, unknown[]] | [EffectCallback];
export type Sub<Model, Msg> = Array<Effect<Model, Msg>>;

export const none = <Model, Msg>(): Sub<Model, Msg> => {
  return [];
};

export const of = <Model, Msg>(
  effector: Effector<Model, Msg>
): Sub<Model, Msg> => {
  const useSub = (model: Model, dispatch: Dispatch<Msg>) => {
    const [effect, deps] = effector(model, dispatch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(effect, deps);
  };
  return [useSub];
};

export const batch = <Model, Msg>(
  ...subs: Sub<Model, Msg>[]
): Sub<Model, Msg> => {
  return subs.flat();
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Sub = { none, of, batch };
