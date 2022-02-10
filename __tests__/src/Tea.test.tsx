import { Cmd } from '@/Cmd';
import { Sub } from '@/Sub';
import { Init, Tea, WithViewProps } from '@/Tea';
import { Update } from '@/useTea';
import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

type Model = number;

type Msg =
  | {
      type: 'increment';
    }
  | {
      type: 'add';
      value: number;
    };

type Props = {
  value: number;
};

const init: Init<Model, Msg, Props> = (props) => [props.value * 10, Cmd.none()];

const update: Update<Model, Msg> = (model, msg) => {
  switch (msg.type) {
    case 'increment':
      return [model + 1, Cmd.none()];

    case 'add':
      return [model + msg.value, Cmd.none()];

    default:
      return msg;
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
        {model}
      </button>
      <div role='note'>{value}</div>
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

      expect(screen.getByRole('button')).toHaveTextContent(/^100$/);
      expect(screen.getByRole('note')).toHaveTextContent(/^10$/);
    });

    it('is not re-invoked on props change', () => {
      const { rerender } = render(<Sut value={10} />);

      rerender(<Sut value={20} />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent(/^100$/);
    });
  });

  describe('update', () => {
    test('on element event', () => {
      render(<Sut value={10} />);

      const button = screen.getByRole('button');
      act(() => {
        button.click();
      });
      expect(button).toHaveTextContent(/^101$/);
    });

    test('on subscription event', () => {
      render(<Sut value={10} />);

      const note = screen.getByRole('note');
      act(() => {
        note.click();
      });

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent(/^110$/);
    });
  });

  describe('subscriptions', () => {
    it('is updated on props change', () => {
      const { rerender } = render(<Sut value={10} />);

      rerender(<Sut value={20} />);

      const note = screen.getByRole('note');
      act(() => {
        note.click();
      });

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent(/^120$/);
    });
  });
});
