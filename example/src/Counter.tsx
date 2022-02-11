import { Cmd, Init, Sub, Tea, Update, WithViewProps } from '@foo-x/react-tea';

type Model = number;

type Msg =
  | 'increment'
  | 'increment-with-default-value'
  | 'decrement'
  | 'multiply'
  | 'delay-increment'
  | 'delay-multiply';

type Props = {
  defaultValue: number;
};

export const init: Init<Model, Msg, Props> = ({ props }) => [
  props.defaultValue,
  Cmd.none(),
];

export const update: Update<Model, Msg, Props> = ({ model, msg, props }) => {
  switch (msg) {
    case 'increment':
      return [model + 1, Cmd.none()];

    case 'increment-with-default-value':
      return [model + props.defaultValue, Cmd.none()];

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

export const subscriptions: Sub<Model, Msg, Props> = Sub.of(({ dispatch }) => [
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

export const view = ({
  model,
  dispatch,
  defaultValue,
}: WithViewProps<Model, Msg, Props>) => {
  return (
    <div style={{ margin: '5rem auto', maxWidth: '400px' }}>
      <h2>Counter</h2>
      <h3>default: {defaultValue}</h3>
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
            dispatch('increment-with-default-value');
          }}
        >
          + default
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

const Counter = Tea({ init, update, subscriptions, view });

export default Counter;
