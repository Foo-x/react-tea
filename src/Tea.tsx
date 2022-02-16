import type { Dispatch } from 'react';
import type { Cmd } from './Cmd';
import type { Dispatcher, MergeIfExists } from './commonTypes';
import type { Effect, EffectorProps, Sub } from './Sub';
import type { UseTeaUpdateProps } from './useTea';
import { useTea } from './useTea';

export type InitProps<Props> = {
  props: Props;
};
export type Init<Model, Msg, Props> = (
  initProps: InitProps<Props>
) => [Model, Cmd<Msg>];

export type UpdateProps<Model, Msg, Props> = UseTeaUpdateProps<Model, Msg> & {
  props: Props;
};
export type Update<Model, Msg, Props> = (
  updateProps: UpdateProps<Model, Msg, Props>
) => [Model, Cmd<Msg>];

type WithHooksResult<
  T extends Record<string, unknown>,
  HooksResult
> = MergeIfExists<HooksResult, T, 'hooksResult', HooksResult>;

export type UseHooksProps<Model, Msg, Props> = {
  model: Model;
  dispatch: Dispatch<Msg>;
  props: Props;
};
export type UseHooks<Model, Msg, Props, HooksResult> = (
  useHooksProps: UseHooksProps<Model, Msg, Props>
) => HooksResult;

export type ViewProps<Model, Msg, HooksResult = never> = WithHooksResult<
  Dispatcher<Model, Msg>,
  HooksResult
>;
export type WithViewProps<Model, Msg, Props, HooksResult = never> = ViewProps<
  Model,
  Msg,
  HooksResult
> &
  Props;
export type WithoutViewProps<Props> = Omit<
  Props,
  'model' | 'dispatch' | 'hooksResult'
>;
export type View<Model, Msg, Props, HooksResult = never> = React.VFC<
  WithViewProps<Model, Msg, Props, HooksResult>
>;

const applyPropsToSub = <Model, Msg, Props>(
  props: Props
): ((subscription: Effect<Model, Msg, Props>) => Effect<Model, Msg, never>) => {
  return (subscription) =>
    ({ model, dispatch }: EffectorProps<Model, Msg, never>) =>
      subscription({
        model,
        dispatch,
        props,
      });
};

export type TeaProps<
  Model,
  Msg,
  Props extends ViewProps<Model, Msg> = ViewProps<Model, Msg>,
  HooksResult = never
> = MergeIfExists<
  HooksResult,
  {
    init: Init<Model, Msg, WithoutViewProps<Props>>;
    update: Update<Model, Msg, WithoutViewProps<Props>>;
    subscriptions: Sub<Model, Msg, WithoutViewProps<Props>>;
    view: React.VFC<Props>;
  },
  'useHooks',
  UseHooks<Model, Msg, WithoutViewProps<Props>, HooksResult>
>;

export const Tea = <
  Model,
  Msg,
  Props extends ViewProps<Model, Msg> = ViewProps<Model, Msg>,
  HooksResult = never
>(
  teaProps: TeaProps<Model, Msg, Props, HooksResult>
) => {
  const {
    init: initWithoutProps,
    update: updateWithoutProps,
    subscriptions: subscriptionsWithoutProps,
    view,
  } = teaProps;
  const useHooks = (() => {
    if ('useHooks' in teaProps) {
      return teaProps.useHooks;
    }
    return () => ({});
  })();
  const TeaComponent = (propsWithoutViewProps: WithoutViewProps<Props>) => {
    const init = () => initWithoutProps({ props: propsWithoutViewProps });

    const update = ({ model, msg }: UseTeaUpdateProps<Model, Msg>) =>
      updateWithoutProps({
        model,
        msg,
        props: propsWithoutViewProps,
      });

    const subscriptions = (() => {
      if (typeof subscriptionsWithoutProps === 'symbol') {
        return [];
      }
      return [subscriptionsWithoutProps]
        .flat()
        .map(applyPropsToSub(propsWithoutViewProps));
    })();

    const useTeaResult = useTea({
      init,
      update,
      subscriptions,
    });

    const hooksResult = useHooks({
      ...useTeaResult,
      props: propsWithoutViewProps,
    });

    const props = {
      ...propsWithoutViewProps,
      ...useTeaResult,
      hooksResult,
    } as WithHooksResult<Props, HooksResult>;

    return view({ ...props });
  };
  return TeaComponent;
};
