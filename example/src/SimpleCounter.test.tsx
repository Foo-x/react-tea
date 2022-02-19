import { Cmd, Sub } from '@foo-x/react-tea';
import { act, render, screen } from '@testing-library/react';
import { init, subscriptions, update, view } from './SimpleCounter';

describe('SimpleCounter', () => {
  describe('init', () => {
    it('returns default value and none cmd', () => {
      const defaultValue = Math.random();

      const [initModel, initCmd] = init({ props: { defaultValue } });

      expect(initModel).toBe(defaultValue);
      expect(initCmd).toBe(Cmd.none());
    });
  });

  describe('update', () => {
    it('returns incremented model and none cmd on increment msg', () => {
      const model = Math.random();

      const [newModel, newCmd] = update({
        model,
        msg: 'increment',
        props: { defaultValue: 0 },
      });

      expect(newModel).toBe(model + 1);
      expect(newCmd).toBe(Cmd.none());
    });

    it('returns decremented model and none cmd on decrement msg', () => {
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

  describe('subscriptions', () => {
    it('is none', () => {
      expect(subscriptions).toBe(Sub.none());
    });
  });

  describe('view', () => {
    const View = view;

    let props: {
      model: number;
      dispatch: () => void;
      props: {
        defaultValue: number;
      };
    };

    beforeEach(() => {
      props = {
        model: Math.random(),
        dispatch: jest.fn(),
        props: {
          defaultValue: Math.random(),
        },
      };
    });

    it('has heading of default value', () => {
      render(<View {...props} />);

      expect(
        screen.getByText(`default: ${props.props.defaultValue}`)
      ).toBeInTheDocument();
    });

    it('has text of model', () => {
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
