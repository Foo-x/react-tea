import {
  Cmd,
  exhaustiveCheck,
  Init,
  Sub,
  Tea,
  Update,
  WithViewProps,
} from '@foo-x/react-tea';

type Model = { value: number; inputValue: number };

type Msg =
  | { type: 'increment' }
  | { type: 'increment-with-default-value' }
  | { type: 'increment-with-input-value' }
  | { type: 'decrement' }
  | { type: 'multiply' }
  | { type: 'delay-increment' }
  | { type: 'delay-multiply' }
  | { type: 'update-input-value'; value: number };

type Props = {
  defaultValue: number;
};

export const init: Init<Model, Msg, Props> = ({ props }) => [
  { value: props.defaultValue, inputValue: 0 },
  Cmd.none(),
];

export const update: Update<Model, Msg, Props> = ({ model, msg, props }) => {
  switch (msg.type) {
    case 'increment':
      return [{ ...model, value: model.value + 1 }, Cmd.none()];

    case 'increment-with-default-value':
      return [
        { ...model, value: model.value + props.defaultValue },
        Cmd.none(),
      ];

    case 'increment-with-input-value':
      return [{ ...model, value: model.value + model.inputValue }, Cmd.none()];

    case 'decrement':
      return [{ ...model, value: model.value - 1 }, Cmd.none()];

    case 'multiply':
      return [{ ...model, value: model.value * 2 }, Cmd.none()];

    case 'delay-increment':
      return [
        model,
        Cmd.delay((dispatch) => dispatch({ type: 'increment' }), 1000),
      ];

    case 'delay-multiply':
      return [
        model,
        Cmd.delay((dispatch) => dispatch({ type: 'multiply' }), 1000),
      ];

    case 'update-input-value':
      return [{ ...model, inputValue: msg.value }, Cmd.none()];

    default:
      return exhaustiveCheck(msg);
  }
};

export const subscriptions: Sub<Model, Msg, Props> = Sub.of(({ dispatch }) => [
  () => {
    const listener = () => {
      dispatch({ type: 'increment' });
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
    <div>
      <h2>Counter with effects</h2>
      <h3>default: {defaultValue}</h3>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            dispatch({ type: 'decrement' });
          }}
        >
          -
        </button>
        {model.value}
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            dispatch({ type: 'increment' });
          }}
        >
          +
        </button>
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            dispatch({ type: 'increment-with-default-value' });
          }}
        >
          + default
        </button>
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            dispatch({ type: 'multiply' });
          }}
        >
          *2
        </button>
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            dispatch({ type: 'delay-increment' });
          }}
        >
          delay +
        </button>
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            dispatch({ type: 'delay-multiply' });
          }}
        >
          delay *2
        </button>
      </div>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <input
          type={'number'}
          defaultValue={model.inputValue}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onChange={(e) => {
            dispatch({
              type: 'update-input-value',
              value: Number(e.currentTarget.value),
            });
          }}
        />
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            dispatch({ type: 'increment-with-input-value' });
          }}
        >
          +
        </button>
      </div>
      <p>Increment on global click.</p>
    </div>
  );
};

const CounterWithEffects = Tea({ init, update, subscriptions, view });

export default CounterWithEffects;
