import { Cmd } from '@/Cmd';
import { Sub } from '@/Sub';
import { Init, Tea, Update, UseHooks, WithViewProps } from '@/Tea';
import { exhaustiveCheck } from '@/utils';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useMemo } from 'react';

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
          type: 'increment-hooks-value';
        }
      | {
          type: 'add';
          value: number;
        };

    type Props = {
      value: number;
    };

    type HooksResult = {
      value: number;
    };

    const init: Init<Model, Msg, Props> = ({ props }) => [
      props.value * 10,
      Cmd.none(),
    ];

    const update: Update<Model, Msg, HooksResult, Props> = ({
      model,
      msg,
      props,
      hooksResult,
    }) => {
      switch (msg.type) {
        case 'increment':
          return [model + 1, Cmd.none()];

        case 'increment-props':
          return [model + props.value * 100, Cmd.none()];

        case 'increment-hooks-value':
          return [model + hooksResult.value * 1000, Cmd.none()];

        case 'add':
          return [model + msg.value, Cmd.none()];

        default:
          return exhaustiveCheck(msg);
      }
    };

    const subscriptions: Sub<Model, Msg, HooksResult, Props> = Sub.batch(
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
      ]),
      Sub.of(({ dispatch, hooksResult }) => [
        () => {
          const listener = () => {
            dispatch({ type: 'add', value: hooksResult.value });
          };
          document.addEventListener('focus', listener);
          return () => {
            document.removeEventListener('focus', listener);
          };
        },
        [hooksResult.value],
      ])
    );

    const useHooks: UseHooks<HooksResult, Props> = ({ props }) => {
      return {
        value: useMemo(() => props.value * 2, [props.value]),
      };
    };

    const view = ({
      model,
      dispatch,
      value,
      hooksResult,
    }: WithViewProps<Model, Msg, HooksResult, Props>) => {
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
              dispatch({ type: 'increment-hooks-value' });
            }}
          >
            increment-hooks-value
          </button>
          <div data-testid='model'>{model}</div>
          <div data-testid='value'>{value}</div>
          <div data-testid='hooks-result'>{hooksResult.value}</div>
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
        expect(screen.getByTestId('model')).toHaveTextContent(/^20100$/);
      });

      test('on subscription event - click', () => {
        render(<Sut value={10} />);

        fireEvent.click(document);
        expect(screen.getByTestId('model')).toHaveTextContent(/^110$/);
      });

      test('on subscription event - focus', () => {
        render(<Sut value={10} />);

        fireEvent.focus(document);
        expect(screen.getByTestId('model')).toHaveTextContent(/^120$/);
      });

      it('is updated on props change', () => {
        const { rerender } = render(<Sut value={10} />);

        rerender(<Sut value={20} />);

        const incrementProps = screen.getByText('increment-props');
        act(() => {
          incrementProps.click();
        });
        expect(screen.getByTestId('model')).toHaveTextContent(/^2100$/);

        const incrementHooksValue = screen.getByText('increment-hooks-value');
        act(() => {
          incrementHooksValue.click();
        });
        expect(screen.getByTestId('model')).toHaveTextContent(/^42100$/);
      });
    });

    describe('subscriptions', () => {
      it('is updated on props change', () => {
        const { rerender } = render(<Sut value={10} />);

        rerender(<Sut value={20} />);

        fireEvent.click(document);
        expect(screen.getByTestId('model')).toHaveTextContent(/^120$/);

        fireEvent.focus(document);
        expect(screen.getByTestId('model')).toHaveTextContent(/^160$/);
      });
    });
  });

  describe('without hooks result', () => {
    type Model = number;

    type Msg = never;

    const init: Init<Model, Msg> = () => [10, Cmd.none()];

    const update: Update<Model, Msg> = ({ model }) => {
      return [model, Cmd.none()];
    };

    const subscriptions: Sub<Model, Msg> = Sub.none();

    const view = ({ model }: WithViewProps<Model, Msg>) => {
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
