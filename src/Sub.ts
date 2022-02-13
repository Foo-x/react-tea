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
  Props extends NullableProps = never,
  HooksResult = never
> = WithHooksResult<WithProps<Dispatcher<Model, Msg>, Props>, HooksResult>;
export type Effector<
  Model,
  Msg,
  Props extends NullableProps = never,
  HooksResult = never
> = (
  effectorProps: EffectorProps<Model, Msg, Props, HooksResult>
) => [EffectCallback, unknown[]] | [EffectCallback];
export type Effect<
  Model,
  Msg,
  Props extends NullableProps = never,
  HooksResult = never
> = (effectProps: EffectorProps<Model, Msg, Props, HooksResult>) => void;

export type Sub<
  Model,
  Msg,
  Props extends NullableProps = never,
  HooksResult = never
> =
  | Effect<Model, Msg, Props, HooksResult>
  | Effect<Model, Msg, Props, HooksResult>[]
  | typeof subNoneSymbol;

const none = (): typeof subNoneSymbol => {
  return subNoneSymbol;
};

const of = <
  Model,
  Msg,
  Props extends NullableProps = never,
  HooksResult = never
>(
  effector: Effector<Model, Msg, Props, HooksResult>
): Effect<Model, Msg, Props, HooksResult> => {
  const useSub = ({
    model,
    dispatch,
    props,
    hooksResult,
  }: EffectorProps<Model, Msg, Props, HooksResult> & {
    props: Props;
    hooksResult: HooksResult;
  }) => {
    const [effect, deps] = effector({
      model,
      dispatch,
      props,
      hooksResult,
    } as EffectorProps<Model, Msg, Props, HooksResult>);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(effect, deps);
  };
  return useSub as Effect<Model, Msg, Props, HooksResult>;
};

const batch = <
  Model,
  Msg,
  Props extends NullableProps = never,
  HooksResult = never
>(
  ...subs: Effect<Model, Msg, Props, HooksResult>[]
): Effect<Model, Msg, Props, HooksResult>[] => {
  return subs;
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Sub = { none, of, batch };
