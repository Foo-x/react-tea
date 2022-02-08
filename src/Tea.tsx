import type { Dispatch } from './Cmd';
import type { UseTeaProps } from './useTea';
import { useTea } from './useTea';

export type ViewProps<Model, Msg> = {
  model: Model;
  dispatch: Dispatch<Msg>;
};

export type WithViewProps<Model, Msg, Props = unknown> = ViewProps<Model, Msg> &
  Props;
export type WithoutViewProps<Props> = Omit<Props, 'model' | 'dispatch'>;

export type TeaProps<
  Model,
  Msg,
  Props extends ViewProps<Model, Msg>
> = UseTeaProps<Model, Msg> & {
  view: React.VFC<Props>;
};

export const Tea = <Model, Msg, Props extends ViewProps<Model, Msg>>({
  init,
  update,
  view,
  subscriptions,
}: TeaProps<Model, Msg, Props>) => {
  const TeaComponent = (propsWithoutViewProps: WithoutViewProps<Props>) => {
    const [model, dispatch] = useTea({ init, update, subscriptions });
    const props = { ...propsWithoutViewProps, model, dispatch } as Props;
    return view({ ...props });
  };
  return TeaComponent;
};
