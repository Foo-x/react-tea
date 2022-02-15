import type { Dispatch } from 'react';
import type { Cmd } from './Cmd';
import type {
  Dispatcher,
  MergeIfExists,
  NullableProps,
  NullObject,
  WithProps,
} from './commonTypes';
import type { Effect, EffectorProps, Sub } from './Sub';
import type { UseTeaUpdateProps } from './useTea';
import { useTea } from './useTea';

export type InitProps<Props extends NullableProps = never> = WithProps<
  Record<string, unknown>,
  Props
>;
export type Init<Model, Msg, Props extends NullableProps = never> = (
  initProps: InitProps<Props>
) => [Model, Cmd<Msg>];

export type UpdateProps<
  Model,
  Msg,
  Props extends NullableProps = never
> = WithProps<UseTeaUpdateProps<Model, Msg>, Props>;
export type Update<Model, Msg, Props extends NullableProps = never> = (
  updateProps: UpdateProps<Model, Msg, Props>
) => [Model, Cmd<Msg>];

type WithHooksResult<
  T extends Record<string, unknown>,
  HooksResult
> = MergeIfExists<HooksResult, T, 'hooksResult', HooksResult>;

export type UseHooksProps<
  Model,
  Msg,
  Props extends NullableProps = never
> = WithProps<
  {
    model: Model;
    dispatch: Dispatch<Msg>;
  },
  Props
>;
export type UseHooks<
  Model,
  Msg,
  HooksResult,
  Props extends NullableProps = never
> = (useHooksProps: UseHooksProps<Model, Msg, Props>) => HooksResult;

export type ViewProps<Model, Msg, HooksResult = never> = WithHooksResult<
  Dispatcher<Model, Msg>,
  HooksResult
>;
export type WithViewProps<
  Model,
  Msg,
  Props extends NullableProps = never,
  HooksResult = never
> = [Props] extends [NullObject]
  ? ViewProps<Model, Msg, HooksResult>
  : ViewProps<Model, Msg, HooksResult> & Props;
export type WithoutViewProps<Props extends NullableProps> = Omit<
  Props,
  'model' | 'dispatch' | 'hooksResult'
>;
export type View<
  Model,
  Msg,
  Props extends NullableProps = never,
  HooksResult = never
> = React.VFC<WithViewProps<Model, Msg, Props, HooksResult>>;

const applyPropsToSub = <Model, Msg, Props extends NullableProps = never>(
  props: Props
): ((subscription: Effect<Model, Msg, Props>) => Effect<Model, Msg, never>) => {
  return (subscription) =>
    ({ model, dispatch }: EffectorProps<Model, Msg>) =>
      subscription({
        model,
        dispatch,
        props,
      } as EffectorProps<Model, Msg, Props>);
};

export type TeaProps<
  Model,
  Msg,
  Props extends ViewProps<Model, Msg> = ViewProps<Model, Msg>,
  HooksResult = never
> = MergeIfExists<
  HooksResult,
  {
    init: Init<Model, Msg, WithoutViewProps<Props>> | Init<Model, Msg>;
    update: Update<Model, Msg, WithoutViewProps<Props>> | Update<Model, Msg>;
    subscriptions: Sub<Model, Msg, WithoutViewProps<Props>>;
    view: React.VFC<Props>;
  },
  'useHooks',
  UseHooks<Model, Msg, HooksResult, WithoutViewProps<Props>>
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
    return () => ({} as HooksResult);
  })();
  const TeaComponent = (propsWithoutViewProps: WithoutViewProps<Props>) => {
    const init = () => initWithoutProps({ props: propsWithoutViewProps });

    const update = ({ model, msg }: UseTeaUpdateProps<Model, Msg>) =>
      updateWithoutProps({
        model,
        msg,
        props: propsWithoutViewProps,
      } as UpdateProps<Model, Msg, WithoutViewProps<Props>>);

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
    } as UseHooksProps<Model, Msg, WithoutViewProps<Props>>);

    const props = {
      ...propsWithoutViewProps,
      ...useTeaResult,
      hooksResult,
    } as WithHooksResult<Props, HooksResult>;

    return view({ ...props });
  };
  return TeaComponent;
};
