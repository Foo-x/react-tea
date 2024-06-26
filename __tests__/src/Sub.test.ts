import { Sub, subNoneSymbol } from '@/Sub';
import { renderHook } from '@testing-library/react';

describe('Sub', () => {
  test('none returns unique symbol', () => {
    expect(Sub.none()).toBe(subNoneSymbol);
  });

  describe('of', () => {
    it('returns custom hook that register effect', () => {
      const spy = jest.fn();

      const sub = Sub.of<null, null, number>(({ props }) => [
        () => {
          spy(props);
        },
      ]);

      const expected = Math.random();

      renderHook(() =>
        sub({ model: null, dispatch: () => null, props: expected })
      );
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toBeCalledWith(expected);
    });

    it('re-register effect on deps update', () => {
      const spy = jest.fn();

      const sub = Sub.of<number, null, null>(({ model }) => [
        () => {
          spy();
        },
        [model],
      ]);

      let model = 0;
      const { rerender } = renderHook(() =>
        sub({ model, dispatch: () => null, props: null })
      );
      expect(spy).toHaveBeenCalledTimes(1);

      rerender();
      expect(spy).toHaveBeenCalledTimes(1);

      model = 1;
      rerender();
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('not re-register effect if deps is empty', () => {
      const spy = jest.fn();

      const sub = Sub.of<number, null, null>(() => [
        () => {
          spy();
        },
        [],
      ]);

      let model = 0;
      const { rerender } = renderHook(() =>
        sub({ model, dispatch: () => null, props: null })
      );
      expect(spy).toHaveBeenCalledTimes(1);

      rerender();
      expect(spy).toHaveBeenCalledTimes(1);

      model = 1;
      rerender();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  test('onMount returns custom hook that register effect which runs only on mount', () => {
    const spy = jest.fn();

    const sub = Sub.onMount<number, null, null>(({ model }) => {
      spy(model);
    });

    const expected = Math.random();

    const { rerender } = renderHook(() =>
      sub({ model: expected, dispatch: () => null, props: null })
    );
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toBeCalledWith(expected);

    rerender();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('onUnmount returns custom hook that register effect which runs only on unmount', () => {
    const spy = jest.fn();

    const sub = Sub.onUnmount<number, null, null>(({ model }) => {
      spy(model);
    });

    const expected = Math.random();

    const { unmount } = renderHook(() =>
      sub({ model: expected, dispatch: () => null, props: null })
    );
    expect(spy).toHaveBeenCalledTimes(0);

    unmount();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toBeCalledWith(expected);
  });

  test('batch returns array of custom hooks that register effects', () => {
    const spy1 = jest.fn();
    const spy2 = jest.fn();

    const sub = Sub.batch<null, null, null>(
      Sub.of(() => [
        () => {
          spy1();
        },
      ]),
      Sub.of(() => [
        () => {
          spy2();
        },
      ])
    );
    expect(sub).toHaveLength(2);

    renderHook(() =>
      sub.forEach((subUnit) =>
        subUnit({ model: null, dispatch: () => null, props: null })
      )
    );
    expect(spy1).toHaveBeenCalledTimes(1);
    expect(spy2).toHaveBeenCalledTimes(1);
  });
});
