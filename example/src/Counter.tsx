import { Cmd, Init, Sub, Tea, Update, WithViewProps } from '@foo-x/react-tea';

type Model = number;

type Msg = 'increment' | 'decrement' | 'delay-increment';

export const init: Init<Model, Msg> = () => [0, Cmd.none()];

export const update: Update<Model, Msg> = (model, msg) => {
  switch (msg) {
    case 'increment':
      return [model + 1, Cmd.none()];

    case 'decrement':
      return [model - 1, Cmd.none()];

    case 'delay-increment':
      return [model, Cmd.delay((dispatch) => dispatch('increment'), 1000)];

    default:
      return msg;
  }
};

export const subscriptions: Sub<Model, Msg> = Sub.of((model, dispatch) => [
  () => {
    const listener = () => {
      dispatch('increment');
    };
    document.addEventListener('click', listener);
    return () => {
      document.removeEventListener('click', listener);
    };
  },
  [],
]);

type Props = WithViewProps<
  Model,
  Msg,
  {
    label: string;
  }
>;

export const view = ({ model, dispatch, label }: Props) => {
  return (
    <div style={{ margin: '5rem auto', maxWidth: '300px' }}>
      <h2>{label}</h2>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            dispatch('decrement');
          }}
        >
          -
        </button>
        {model}
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            dispatch('increment');
          }}
        >
          +
        </button>
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            dispatch('delay-increment');
          }}
        >
          delay +
        </button>
      </div>
      <p>increment on global click</p>
    </div>
  );
};

const Counter = Tea({ init, view, update, subscriptions });

export default Counter;
