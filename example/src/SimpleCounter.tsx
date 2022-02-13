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

export const init: Init<Model, Msg> = () => [0, Cmd.none()];

export const update: Update<Model, Msg> = ({ model, msg }) => {
  switch (msg) {
    case 'increment':
      return [model + 1, Cmd.none()];

    case 'decrement':
      return [model - 1, Cmd.none()];

    default:
      return exhaustiveCheck(msg);
  }
};

export const subscriptions: Sub<Model, Msg> = Sub.none();

export const view: View<Model, Msg> = ({ model, dispatch }) => {
  return (
    <div>
      <h2>Simple Counter</h2>
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
