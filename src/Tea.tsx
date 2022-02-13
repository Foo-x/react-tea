import type { Cmd } from './Cmd';
import type {
  Dispatcher,
  MergeIfExists,
  NullableProps,
  NullObject,
  WithHooksResult,
  WithProps,
} from './commonTypes';
import type { Effect, EffectorProps, Sub } from './Sub';
import type { UseTeaProps, UseTeaUpdateProps } from './useTea';
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
  Props extends NullableProps = never,
  HooksResult = never
> = WithProps<UseTeaUpdateProps<Model, Msg, HooksResult>, Props>;
export type Update<
  Model,
  Msg,
  Props extends NullableProps = never,
  HooksResult = never
> = (
  updateProps: UpdateProps<Model, Msg, Props, HooksResult>
) => [Model, Cmd<Msg>];

export type UseHooksProps<Props extends NullableProps = never> = WithProps<
  Record<string, unknown>,
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

const applyPropsToSub = <
  Model,
  Msg,
  Props extends NullableProps = never,
  HooksResult = never
>(
  props: Props
): ((
  subscription: Effect<Model, Msg, Props, HooksResult>
) => Effect<Model, Msg, never, HooksResult>) => {
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
      } as EffectorProps<Model, Msg, Props, HooksResult>);
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
    update:
      | Update<Model, Msg, WithoutViewProps<Props>, HooksResult>
      | Update<Model, Msg>;
    subscriptions: Sub<Model, Msg, WithoutViewProps<Props>, HooksResult>;
    view: React.VFC<Props>;
  },
  'useHooks',
  UseHooks<HooksResult, WithoutViewProps<Props>>
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
      } as UpdateProps<Model, Msg, WithoutViewProps<Props>, HooksResult>);
    const subscriptions = (() => {
      if (typeof subscriptionsWithoutProps === 'symbol') {
        return [];
      }
      return [subscriptionsWithoutProps]
        .flat()
        .map(applyPropsToSub(propsWithoutViewProps));
    })();
    const useTeaActual = (() => {
      if ('useHooks' in teaProps) {
        const useTeaWithHooks = () =>
          useTea({
            init,
            update,
            subscriptions,
            useHooks: () => teaProps.useHooks({ props: propsWithoutViewProps }),
          } as UseTeaProps<Model, Msg, HooksResult>);
        return useTeaWithHooks;
      }
      const useTeaWithoutHooks = () =>
        useTea({
          init,
          update,
          subscriptions,
        } as UseTeaProps<Model, Msg, HooksResult>);
      return useTeaWithoutHooks;
    })();
    const [model, dispatch, hooksResult] = useTeaActual();

    const props = {
      ...propsWithoutViewProps,
      model,
      dispatch,
      hooksResult,
    } as WithHooksResult<Props, HooksResult>;
    return view({ ...props });
  };
  return TeaComponent;
};
