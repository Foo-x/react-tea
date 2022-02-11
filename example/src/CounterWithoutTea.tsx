import { useCallback, useEffect, useReducer } from 'react';

type Model = number;

type Msg =
  | 'increment'
  | 'increment-with-default-value'
  | 'decrement'
  | 'multiply';

type Props = {
  defaultValue: number;
};

export const init = (defaultValue: number) => defaultValue;

export const reducer = (props: Props) => (model: Model, msg: Msg) => {
  switch (msg) {
    case 'increment':
      return model + 1;

    case 'increment-with-default-value':
      return model + props.defaultValue;

    case 'decrement':
      return model - 1;

    case 'multiply':
      return model * 2;

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
      dispatch('increment');
    }, 1000);
  }, []);
  const delayMultiply = useCallback(() => {
    setTimeout(() => {
      dispatch('multiply');
    }, 1000);
  }, []);

  useEffect(() => {
    const listener = () => {
      dispatch('increment');
    };
    document.addEventListener('click', listener);
    return () => {
      document.removeEventListener('click', listener);
    };
  }, []);

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
      <p>Increment on global click.</p>
    </div>
  );
};

export default CounterWithoutTea;
