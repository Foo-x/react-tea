import { Sub } from '@/Sub';
import { renderHook } from '@testing-library/react-hooks';

describe('Sub', () => {
  test('none returns empty array', () => {
    expect(Sub.none()).toEqual([]);
  });

  describe('of', () => {
    it('returns array with custom hook that register effect', () => {
      const spy = jest.fn();

      const sub = Sub.of<null, null>(() => [
        () => {
          spy();
        },
      ]);
      expect(sub).toHaveLength(1);

      const { rerender } = renderHook(() => sub[0]({})(null, () => null));
      expect(spy).toHaveBeenCalledTimes(1);

      rerender();
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('re-register effect on deps update', () => {
      const spy = jest.fn();

      const sub = Sub.of<number, null>(({ model }) => [
        () => {
          spy();
        },
        [model],
      ]);
      expect(sub).toHaveLength(1);

      let model = 0;
      const { rerender } = renderHook(() => sub[0]({})(model, () => null));
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
      expect(sub).toHaveLength(1);

      let model = 0;
      const { rerender } = renderHook(() => sub[0]({})(model, () => null));
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

    renderHook(() => sub.forEach((subUnit) => subUnit({})(null, () => null)));
    expect(spy1).toHaveBeenCalledTimes(1);
    expect(spy2).toHaveBeenCalledTimes(1);
  });
});
