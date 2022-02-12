import type { Cmd } from './Cmd';
import type {
  Dispatcher,
  NullableProps,
  WithHooksResult,
  WithProps,
} from './commonTypes';
import type { Effect, EffectorProps, Sub } from './Sub';
import type { UseTeaUpdateProps } from './useTea';
import { useTea } from './useTea';

export type InitProps<Props extends NullableProps = never> = WithProps<
  unknown,
  Props
>;
export type Init<Model, Msg, Props extends NullableProps = never> = (
  initProps: InitProps<Props>
) => [Model, Cmd<Msg>];

export type UpdateProps<
  Model,
  Msg,
  HooksResult = never,
  Props extends NullableProps = never
> = WithProps<UseTeaUpdateProps<Model, Msg, HooksResult>, Props>;
export type Update<
  Model,
  Msg,
  HooksResult = never,
  Props extends NullableProps = never
> = (
  updateProps: UpdateProps<Model, Msg, HooksResult, Props>
) => [Model, Cmd<Msg>];

export type UseHooksProps<Props extends NullableProps = never> = WithProps<
  unknown,
  Props
>;
export type UseHooks<HooksResult, Props extends NullableProps = never> = (
  useHooksProps: UseHooksProps<Props>
) => HooksResult;

export type ViewProps<Model, Msg, HooksResult = never> = WithHooksResult<
  Dispatcher<Model, Msg>,
  HooksResult
>;

export type WithViewProps<
  Model,
  Msg,
  HooksResult = never,
  Props extends NullableProps = never
> = ViewProps<Model, Msg, HooksResult> & Props;
export type WithoutViewProps<Props> = Omit<
  Props,
  'model' | 'dispatch' | 'hooksResult'
>;

const applyPropsToSub = <
  Model,
  Msg,
  HooksResult = never,
  Props extends NullableProps = never
>(
  props: Props
): ((
  subscription: Effect<Model, Msg, HooksResult, Props>
) => Effect<Model, Msg, HooksResult>) => {
  return (subscription) =>
    ({
      model,
      dispatch,
      hooksResult,
    }: EffectorProps<Model, Msg> & {
      hooksResult?: HooksResult;
    }) =>
      subscription({
        model,
        dispatch,
        hooksResult,
        props,
      } as EffectorProps<Model, Msg, HooksResult, Props>);
};

export type TeaProps<
  Model,
  Msg,
  HooksResult = never,
  Props extends ViewProps<Model, Msg, HooksResult> = ViewProps<
    Model,
    Msg,
    HooksResult
  >
> = {
  init: Init<Model, Msg, WithoutViewProps<Props>>;
  update: Update<Model, Msg, HooksResult, WithoutViewProps<Props>>;
  subscriptions: Sub<Model, Msg, HooksResult, WithoutViewProps<Props>>;
  useHooks?: UseHooks<HooksResult, WithoutViewProps<Props>>;
  view: React.VFC<Props>;
};

export const Tea = <
  Model,
  Msg,
  HooksResult = never,
  Props extends ViewProps<Model, Msg, HooksResult> = ViewProps<
    Model,
    Msg,
    HooksResult
  >
>({
  init: initWithoutProps,
  update: updateWithoutProps,
  subscriptions: subscriptionsWithoutProps,
  useHooks: useHooksWithoutProps,
  view,
}: TeaProps<Model, Msg, HooksResult, Props>) => {
  const TeaComponent = (propsWithoutViewProps: WithoutViewProps<Props>) => {
    const init = () => initWithoutProps({ props: propsWithoutViewProps });
    const update = ({
      model,
      msg,
      hooksResult,
    }: UseTeaUpdateProps<Model, Msg> & {
      hooksResult?: HooksResult;
    }) =>
      updateWithoutProps({
        model,
        msg,
        hooksResult,
        props: propsWithoutViewProps,
      } as UpdateProps<Model, Msg, HooksResult, WithoutViewProps<Props>>);
    const subscriptions = (() => {
      if (typeof subscriptionsWithoutProps === 'symbol') {
        return [];
      }
      return [subscriptionsWithoutProps]
        .flat()
        .map(applyPropsToSub(propsWithoutViewProps));
    })();
    const useHooks = (() => {
      if (useHooksWithoutProps == null) {
        return undefined;
      }
      const useHooksActual = () =>
        useHooksWithoutProps({ props: propsWithoutViewProps });
      return useHooksActual;
    })();
    const [model, dispatch, hooksResult] = useTea({
      init,
      update,
      subscriptions,
      useHooks,
    });

    const props = {
      ...propsWithoutViewProps,
      model,
      dispatch,
      hooksResult,
    } as Props;
    return view({ ...props });
  };
  return TeaComponent;
};
