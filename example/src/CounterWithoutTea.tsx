import { useCallback, useEffect, useReducer } from 'react';

type Model = { value: number; inputValue: number };

type Msg =
  | { type: 'increment' }
  | { type: 'increment-with-default-value' }
  | { type: 'increment-with-input-value' }
  | { type: 'decrement' }
  | { type: 'multiply' }
  | { type: 'update-input-value'; value: number };

type Props = {
  defaultValue: number;
};

export const init = (defaultValue: number): Model => ({
  value: defaultValue,
  inputValue: 0,
});

export const reducer =
  (props: Props) =>
  (model: Model, msg: Msg): Model => {
    switch (msg.type) {
      case 'increment':
        return { ...model, value: model.value + 1 };

      case 'increment-with-default-value':
        return { ...model, value: model.value + props.defaultValue };

      case 'increment-with-input-value':
        return { ...model, value: model.value + model.inputValue };

      case 'decrement':
        return { ...model, value: model.value - 1 };

      case 'multiply':
        return { ...model, value: model.value * 2 };

      case 'update-input-value':
        return { ...model, inputValue: msg.value };

      default:
        return msg;
    }
  };

const CounterWithoutTea = ({ defaultValue }: Props) => {
  const reducerWithProps = useCallback(
    (model: Model, msg: Msg) => reducer({ defaultValue })(model, msg),
    [defaultValue]
  );
  const [model, dispatch] = useReducer(reducerWithProps, defaultValue, init);

  // you must create async dispatch since useReducer cannot handle async action
  const delayIncrement = useCallback(() => {
    setTimeout(() => {
      dispatch({ type: 'increment' });
    }, 1000);
  }, []);
  const delayMultiply = useCallback(() => {
    setTimeout(() => {
      dispatch({ type: 'multiply' });
    }, 1000);
  }, []);

  useEffect(() => {
    const listener = () => {
      dispatch({ type: 'increment' });
    };
    document.addEventListener('click', listener);
    return () => {
      document.removeEventListener('click', listener);
    };
  }, []);

  return (
    <div>
      <h2>Counter without TEA</h2>
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
            delayIncrement();
          }}
        >
          delay +
        </button>
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            delayMultiply();
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

export default CounterWithoutTea;
