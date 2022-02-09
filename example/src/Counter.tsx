import { Cmd, Init, Sub, Tea, Update, WithViewProps } from '@foo-x/react-tea';

type Model = number;

type Msg =
  | 'increment'
  | 'decrement'
  | 'multiply'
  | 'delay-increment'
  | 'delay-multiply';

export const init: Init<Model, Msg> = () => [0, Cmd.none()];

export const update: Update<Model, Msg> = (model, msg) => {
  switch (msg) {
    case 'increment':
      return [model + 1, Cmd.none()];

    case 'decrement':
      return [model - 1, Cmd.none()];

    case 'multiply':
      return [model * 2, Cmd.none()];

    case 'delay-increment':
      return [model, Cmd.delay((dispatch) => dispatch('increment'), 1000)];

    case 'delay-multiply':
      return [model, Cmd.delay((dispatch) => dispatch('multiply'), 1000)];

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
            dispatch('multiply');
          }}
        >
          *2
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
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            dispatch('delay-multiply');
          }}
        >
          delay *2
        </button>
      </div>
      <p>Increment on global click.</p>
    </div>
  );
};

const Counter = Tea({ init, view, update, subscriptions });

export default Counter;
