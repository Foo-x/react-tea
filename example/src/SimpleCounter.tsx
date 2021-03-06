import {
  Cmd,
  exhaustiveCheck,
  Init,
  Sub,
  Tea,
  Update,
  View,
} from '@foo-x/react-tea';

type Model = number;

type Msg = 'increment' | 'decrement';

type Props = {
  defaultValue: number;
};

export const init: Init<Model, Msg, Props> = ({ props }) => [
  props.defaultValue,
  Cmd.none(),
];

export const update: Update<Model, Msg, Props> = ({ model, msg }) => {
  switch (msg) {
    case 'increment':
      return [model + 1, Cmd.none()];

    case 'decrement':
      return [model - 1, Cmd.none()];

    default:
      return exhaustiveCheck(msg);
  }
};

export const subscriptions: Sub<Model, Msg, Props> = Sub.none();

export const view: View<Model, Msg, Props> = ({ model, dispatch, props }) => {
  return (
    <div>
      <h2>Simple Counter</h2>
      <h3>default: {props.defaultValue}</h3>
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
      </div>
    </div>
  );
};

const SimpleCounter = Tea({ init, update, subscriptions, view });

export default SimpleCounter;
