import type { EffectCallback } from 'react';
import { useEffect } from 'react';
import type {
  Dispatcher,
  NullableProps,
  WithHooksResult,
  WithProps,
} from './commonTypes';

export const subNoneSymbol = Symbol('Sub.none');

export type EffectorProps<
  Model,
  Msg,
  HooksResult = never,
  Props extends NullableProps = never
> = WithHooksResult<WithProps<Dispatcher<Model, Msg>, Props>, HooksResult>;
export type Effector<
  Model,
  Msg,
  HooksResult = never,
  Props extends NullableProps = never
> = (
  effectorProps: EffectorProps<Model, Msg, HooksResult, Props>
) => [EffectCallback, unknown[]] | [EffectCallback];
export type Effect<
  Model,
  Msg,
  HooksResult = never,
  Props extends NullableProps = never
> = (effectProps: EffectorProps<Model, Msg, HooksResult, Props>) => void;

export type Sub<
  Model,
  Msg,
  HooksResult = never,
  Props extends NullableProps = never
> =
  | Effect<Model, Msg, HooksResult, Props>
  | Effect<Model, Msg, HooksResult, Props>[]
  | typeof subNoneSymbol;

const none = (): typeof subNoneSymbol => {
  return subNoneSymbol;
};

const of = <
  Model,
  Msg,
  HooksResult = never,
  Props extends NullableProps = never
>(
  effector: Effector<Model, Msg, HooksResult, Props>
): Effect<Model, Msg, HooksResult, Props> => {
  const useSub = ({
    model,
    dispatch,
    props,
    hooksResult,
  }: EffectorProps<Model, Msg, HooksResult, Props> & {
    props: Props;
    hooksResult: HooksResult;
  }) => {
    const [effect, deps] = effector({
      model,
      dispatch,
      props,
      hooksResult,
    } as EffectorProps<Model, Msg, HooksResult, Props>);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(effect, deps);
  };
  return useSub as Effect<Model, Msg, HooksResult, Props>;
};

const batch = <
  Model,
  Msg,
  HooksResult = never,
  Props extends NullableProps = never
>(
  ...subs: Effect<Model, Msg, HooksResult, Props>[]
): Effect<Model, Msg, HooksResult, Props>[] => {
  return subs;
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Sub = { none, of, batch };
