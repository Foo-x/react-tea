import type { EffectCallback } from 'react';
import { useEffect } from 'react';
import type { Dispatcher, WithProps } from './commonTypes';

export const subNoneSymbol = Symbol('Sub.none');

export type EffectorProps<Model, Msg, Props = never> = WithProps<
  Dispatcher<Model, Msg>,
  Props
>;
export type Effector<Model, Msg, Props = never> = (
  effectorProps: EffectorProps<Model, Msg, Props>
) => [EffectCallback, unknown[]] | [EffectCallback];
export type Effect<Model, Msg, Props = never> = (
  effectProps: EffectorProps<Model, Msg, Props>
) => void;

export type Sub<Model, Msg, Props = never> =
  | Effect<Model, Msg, Props>
  | Effect<Model, Msg, Props>[]
  | typeof subNoneSymbol;

const none = (): typeof subNoneSymbol => {
  return subNoneSymbol;
};

const of = <Model, Msg, Props = never>(
  effector: Effector<Model, Msg, Props>
): Effect<Model, Msg, Props> => {
  const useSub = ({
    model,
    dispatch,
    props,
  }: EffectorProps<Model, Msg> & { props: Props }) => {
    const [effect, deps] = effector({
      model,
      dispatch,
      props,
    } as EffectorProps<Model, Msg, Props>);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(effect, deps);
  };
  return useSub as Effect<Model, Msg, Props>;
};

const batch = <Model, Msg, Props = never>(
  ...subs: Effect<Model, Msg, Props>[]
): Effect<Model, Msg, Props>[] => {
  return subs;
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Sub = { none, of, batch };
