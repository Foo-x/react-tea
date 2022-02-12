import { Sub, subNoneSymbol } from '@/Sub';
import { renderHook } from '@testing-library/react-hooks';

describe('Sub', () => {
  test('none returns unique symbol', () => {
    expect(Sub.none()).toBe(subNoneSymbol);
  });

  describe('of', () => {
    it('returns custom hook that register effect', () => {
      const spy = jest.fn();

      const sub = Sub.of<number, null>(({ model }) => [
        () => {
          spy(model);
        },
      ]);

      const expected = Math.random();

      renderHook(() => sub({ model: expected, dispatch: () => null }));
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toBeCalledWith(expected);
    });

    it('returns custom hook that register effect with hooksResult', () => {
      const spy = jest.fn();

      const sub = Sub.of<null, null, number>(({ hooksResult }) => [
        () => {
          spy(hooksResult);
        },
      ]);

      const expected = Math.random();

      renderHook(() =>
        sub({ model: null, dispatch: () => null, hooksResult: expected })
      );
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toBeCalledWith(expected);
    });

    it('returns custom hook that register effect with props', () => {
      const spy = jest.fn();

      const sub = Sub.of<null, null, null, { value: number }>(({ props }) => [
        () => {
          spy(props.value);
        },
      ]);

      const expected = Math.random();

      renderHook(() =>
        sub({ model: null, dispatch: () => null, props: { value: expected } })
      );
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toBeCalledWith(expected);
    });

    it('re-register effect on deps update', () => {
      const spy = jest.fn();

      const sub = Sub.of<number, null>(({ model }) => [
        () => {
          spy();
        },
        [model],
      ]);

      let model = 0;
      const { rerender } = renderHook(() =>
        sub({ model, dispatch: () => null })
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

      const sub = Sub.of<number, null>(() => [
        () => {
          spy();
        },
        [],
      ]);

      let model = 0;
      const { rerender } = renderHook(() =>
        sub({ model, dispatch: () => null })
      );
      expect(spy).toHaveBeenCalledTimes(1);

      rerender();
      expect(spy).toHaveBeenCalledTimes(1);

      model = 1;
      rerender();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  test('batch returns array of custom hooks that register effects', () => {
    const spy1 = jest.fn();
    const spy2 = jest.fn();

    const sub = Sub.batch<null, null>(
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
      sub.forEach((subUnit) => subUnit({ model: null, dispatch: () => null }))
    );
    expect(spy1).toHaveBeenCalledTimes(1);
    expect(spy2).toHaveBeenCalledTimes(1);
  });
});
