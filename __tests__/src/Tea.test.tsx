import { Cmd } from '@/Cmd';
import { Sub } from '@/Sub';
import { Init, Tea, Update, WithViewProps } from '@/Tea';
import { exhaustiveCheck } from '@/utils';
import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

type Model = number;

type Msg =
  | {
      type: 'increment';
    }
  | {
      type: 'increment-props';
    }
  | {
      type: 'add';
      value: number;
    };

type Props = {
  value: number;
};

const init: Init<Model, Msg, Props> = ({ props }) => [
  props.value * 10,
  Cmd.none(),
];

const update: Update<Model, Msg, Props> = ({ model, msg, props }) => {
  switch (msg.type) {
    case 'increment':
      return [model + 1, Cmd.none()];

    case 'increment-props':
      return [model + props.value * 100, Cmd.none()];

    case 'add':
      return [model + msg.value, Cmd.none()];

    default:
      return exhaustiveCheck(msg);
  }
};

const view = ({ model, dispatch, value }: WithViewProps<Model, Msg, Props>) => {
  return (
    <div>
      <button
        type='button'
        onClick={(e) => {
          e.stopPropagation();
          dispatch({ type: 'increment' });
        }}
      >
        increment
      </button>
      <button
        type='button'
        onClick={(e) => {
          e.stopPropagation();
          dispatch({ type: 'increment-props' });
        }}
      >
        increment-props
      </button>
      <div data-testid='model'>{model}</div>
      <div data-testid='value'>{value}</div>
    </div>
  );
};

const subscriptions: Sub<Model, Msg, Props> = Sub.of(({ dispatch, props }) => [
  () => {
    const listener = () => {
      dispatch({ type: 'add', value: props.value });
    };
    document.addEventListener('click', listener);
    return () => {
      document.removeEventListener('click', listener);
    };
  },
  [props.value],
]);

const Sut = Tea({ init, view, update, subscriptions });

describe('Tea', () => {
  describe('init', () => {
    test('initial', () => {
      render(<Sut value={10} />);

      expect(screen.getByTestId('model')).toHaveTextContent(/^100$/);
      expect(screen.getByTestId('value')).toHaveTextContent(/^10$/);
    });

    it('is not re-invoked on props change', () => {
      const { rerender } = render(<Sut value={10} />);

      rerender(<Sut value={20} />);

      expect(screen.getByTestId('model')).toHaveTextContent(/^100$/);
    });
  });

  describe('update', () => {
    test('on element event - increment', () => {
      render(<Sut value={10} />);

      const increment = screen.getByText('increment');
      act(() => {
        increment.click();
      });
      expect(screen.getByTestId('model')).toHaveTextContent(/^101$/);
    });

    test('on element event - increment-props', () => {
      render(<Sut value={10} />);

      const incrementProps = screen.getByText('increment-props');
      act(() => {
        incrementProps.click();
      });
      expect(screen.getByTestId('model')).toHaveTextContent(/^1100$/);
    });

    test('on subscription event', () => {
      render(<Sut value={10} />);

      act(() => {
        document.body.click();
      });
      expect(screen.getByTestId('model')).toHaveTextContent(/^110$/);
    });

    it('is updated on props change', () => {
      const { rerender } = render(<Sut value={10} />);

      rerender(<Sut value={20} />);

      const incrementProps = screen.getByText('increment-props');
      act(() => {
        incrementProps.click();
      });
      expect(screen.getByTestId('model')).toHaveTextContent(/^2100$/);
    });
  });

  describe('subscriptions', () => {
    it('is updated on props change', () => {
      const { rerender } = render(<Sut value={10} />);

      rerender(<Sut value={20} />);

      act(() => {
        document.body.click();
      });
      expect(screen.getByTestId('model')).toHaveTextContent(/^120$/);
    });
  });
});
