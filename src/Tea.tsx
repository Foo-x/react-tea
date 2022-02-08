import type { Dispatch } from './cmd';
import type { UseTeaProps } from './useTea';
import { useTea } from './useTea';

type ViewProps<Model, Msg> = {
  model: Model;
  dispatch: Dispatch<Msg>;
};

export type WithViewProps<Model, Msg, Props = unknown> = ViewProps<Model, Msg> &
  Props;
export type WithoutViewProps<Props> = Omit<Props, 'model' | 'dispatch'>;

type TeaProps<Model, Msg, Props extends ViewProps<Model, Msg>> = UseTeaProps<
  Model,
  Msg
> & {
  View: React.VFC<Props>;
};

export const Tea = <Model, Msg, Props extends ViewProps<Model, Msg>>({
  init,
  update,
  View,
  Subscription,
}: TeaProps<Model, Msg, Props>) => {
  const TeaComponent = (propsWithoutViewProps: WithoutViewProps<Props>) => {
    const [model, dispatch] = useTea({ init, update, Subscription });
    const props = { ...propsWithoutViewProps, model, dispatch } as Props;
    return <View {...props} />;
  };
  return TeaComponent;
};
