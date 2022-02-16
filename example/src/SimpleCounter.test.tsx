import { Cmd, Sub } from '@foo-x/react-tea';
import { act, render, screen } from '@testing-library/react';
import { init, subscriptions, update, view } from './SimpleCounter';

describe('SimpleCounter', () => {
  test('init returns default value and none cmd', () => {
    const defaultValue = Math.random();

    const [initModel, initCmd] = init({ props: { defaultValue } });

    expect(initModel).toBe(defaultValue);
    expect(initCmd).toBe(Cmd.none());
  });

  describe('update', () => {
    test('increment msg returns incremented model and none cmd', () => {
      const model = Math.random();

      const [newModel, newCmd] = update({
        model,
        msg: 'increment',
        props: { defaultValue: 0 },
      });

      expect(newModel).toBe(model + 1);
      expect(newCmd).toBe(Cmd.none());
    });

    test('decrement msg returns decremented model and none cmd', () => {
      const model = Math.random();

      const [newModel, newCmd] = update({
        model,
        msg: 'decrement',
        props: { defaultValue: 0 },
      });

      expect(newModel).toBe(model - 1);
      expect(newCmd).toBe(Cmd.none());
    });
  });

  test('subscriptions is none', () => {
    expect(subscriptions).toBe(Sub.none());
  });

  describe('view', () => {
    const View = view;

    let props: {
      model: number;
      dispatch: () => void;
      defaultValue: number;
    };

    beforeEach(() => {
      props = {
        model: Math.random(),
        dispatch: jest.fn(),
        defaultValue: Math.random(),
      };
    });

    it('has heading with default value', () => {
      render(<View {...props} />);

      expect(
        screen.getByText(`default: ${props.defaultValue}`)
      ).toBeInTheDocument();
    });

    it('has model text', () => {
      render(<View {...props} />);

      expect(screen.getByText(props.model)).toBeInTheDocument();
    });

    test('dispatch decrement msg on click decrement button', () => {
      render(<View {...props} />);
      act(() => {
        screen.getByRole('button', { name: '-' }).click();
      });

      expect(props.dispatch).toBeCalledWith('decrement');
    });

    test('dispatch increment msg on click increment button', () => {
      render(<View {...props} />);
      act(() => {
        screen.getByRole('button', { name: '+' }).click();
      });

      expect(props.dispatch).toBeCalledWith('increment');
    });
  });
});
