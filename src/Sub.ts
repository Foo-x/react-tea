import type { EffectCallback } from 'react';
import { useEffect } from 'react';
import type { Dispatcher } from './commonTypes';

export const subNoneSymbol = Symbol('Sub.none');

export type EffectorProps<Model, Msg, Props> = Dispatcher<Model, Msg> & {
  props: Props;
};
export type Effector<Model, Msg, Props> = (
  effectorProps: EffectorProps<Model, Msg, Props>
) => [EffectCallback, unknown[]] | [EffectCallback];
export type Effect<Model, Msg, Props> = (
  effectProps: EffectorProps<Model, Msg, Props>
) => void;

export type Sub<Model, Msg, Props> =
  | Effect<Model, Msg, Props>
  | Effect<Model, Msg, Props>[]
  | typeof subNoneSymbol;

const none = (): typeof subNoneSymbol => {
  return subNoneSymbol;
};

const of = <Model, Msg, Props>(
  effector: Effector<Model, Msg, Props>
): Effect<Model, Msg, Props> => {
  const useSub = ({
    model,
    dispatch,
    props,
  }: EffectorProps<Model, Msg, Props>) => {
    const [effect, deps] = effector({
      model,
      dispatch,
      props,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(effect, deps);
  };
  return useSub;
};

const onMount = <Model, Msg, Props>(
  callback: (props: EffectorProps<Model, Msg, Props>) => void
): Effect<Model, Msg, Props> => {
  return of((props) => [() => callback(props), []]);
};

const onUnmount = <Model, Msg, Props>(
  callback: (props: EffectorProps<Model, Msg, Props>) => void
): Effect<Model, Msg, Props> => {
  return of((props) => [() => () => callback(props), []]);
};

const batch = <Model, Msg, Props>(
  ...subs: Effect<Model, Msg, Props>[]
): Effect<Model, Msg, Props>[] => {
  return subs;
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Sub = { none, of, batch, onMount, onUnmount };
