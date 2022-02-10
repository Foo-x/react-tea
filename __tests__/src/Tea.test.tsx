import { Cmd } from '@/Cmd';
import { Sub } from '@/Sub';
import { Tea, WithViewProps } from '@/Tea';
import { Init, Update } from '@/useTea';
import { render, screen } from '@testing-library/react';
import React from 'react';
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

const init: Init<Model, Msg> = () => [0, Cmd.none()];

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

type Props = {
  value: number;
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
  test('initial view', () => {
    render(<Sut value={10} />);

    expect(screen.getByRole('button')).toHaveTextContent('0');
    expect(screen.getByRole('note')).toHaveTextContent('10');
  });

  describe('update', () => {
    test('on element event', () => {
      render(<Sut value={10} />);

      const button = screen.getByRole('button');
      act(() => {
        button.click();
      });

      expect(screen.getByRole('button')).toHaveTextContent('1');
    });

    test('on subscription event', () => {
      const { rerender } = render(<Sut value={10} />);

      const note = screen.getByRole('note');
      act(() => {
        note.click();
      });

      expect(screen.getByRole('button')).toHaveTextContent('10');

      rerender(<Sut value={20} />);

      act(() => {
        note.click();
      });

      expect(screen.getByRole('button')).toHaveTextContent('30');
    });
  });
});
