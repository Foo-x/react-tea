import { Cmd } from '@/Cmd';
import { Sub } from '@/Sub';
import { Init, Tea, Update, UseHooks, View } from '@/Tea';
import { exhaustiveCheck } from '@/utils';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Dispatch, SetStateAction, useState } from 'react';

describe('Tea', () => {
  describe('with hooks result', () => {
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

    type HooksResult = {
      hooksValue: number;
      setHooksValue: Dispatch<SetStateAction<number>>;
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

    const subscriptions: Sub<Model, Msg, Props> = Sub.batch(
      Sub.of(({ dispatch, props }) => [
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
      ])
    );

    const useHooks: UseHooks<Model, Msg, Props, HooksResult> = ({ props }) => {
      const [hooksValue, setHooksValue] = useState(props.value * 2);
      return {
        hooksValue,
        setHooksValue,
      };
    };

    const view: View<Model, Msg, Props, HooksResult> = ({
      model,
      dispatch,
      props,
      hooksResult,
    }) => {
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
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              hooksResult.setHooksValue((oldValue) => oldValue + 1);
            }}
          >
            increment-hooks-value
          </button>
          <div data-testid='model'>{model}</div>
          <div data-testid='value'>{props.value}</div>
          <div data-testid='hooks-result'>{hooksResult.hooksValue}</div>
        </div>
      );
    };

    const Sut = Tea({ init, view, update, subscriptions, useHooks });

    describe('init', () => {
      test('initial', () => {
        render(<Sut value={10} />);

        expect(screen.getByTestId('model')).toHaveTextContent(/^100$/);
        expect(screen.getByTestId('value')).toHaveTextContent(/^10$/);
        expect(screen.getByTestId('hooks-result')).toHaveTextContent(/^20$/);
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

      test('on element event - increment-hooks-value', () => {
        render(<Sut value={10} />);

        const incrementHooksValue = screen.getByText('increment-hooks-value');
        act(() => {
          incrementHooksValue.click();
        });
        expect(screen.getByTestId('hooks-result')).toHaveTextContent(/^21$/);
      });

      test('on subscription event - click', () => {
        render(<Sut value={10} />);

        fireEvent.click(document);
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

        fireEvent.click(document);
        expect(screen.getByTestId('model')).toHaveTextContent(/^120$/);
      });
    });
  });

  describe('without hooks result', () => {
    type Model = number;

    type Msg = never;

    const init: Init<Model, Msg, unknown> = () => [10, Cmd.none()];

    const update: Update<Model, Msg, unknown> = ({ model }) => {
      return [model, Cmd.none()];
    };

    const subscriptions: Sub<Model, Msg, unknown> = Sub.none();

    const view: View<Model, Msg, unknown> = ({ model }) => {
      return (
        <div>
          <div data-testid='model'>{model}</div>
        </div>
      );
    };

    const Sut = Tea({ init, view, update, subscriptions });

    test('initial', () => {
      render(<Sut />);

      expect(screen.getByTestId('model')).toHaveTextContent(/^10$/);
    });
  });
});
