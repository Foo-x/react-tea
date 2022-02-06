import * as sut from '@/cmd';

type Msg = 'msg' | 'msg2';

beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

test('none returns empty array', () => {
  expect(sut.none()).toEqual([]);
});

test('delay returns array with cmd that runs setTimeout', async () => {
  const cmd = sut.delay<Msg>((dispatch) => dispatch('msg'), 100);

  expect(cmd).toHaveLength(1);

  const dispatch = jest.fn();
  await cmd[0](dispatch);

  expect(dispatch).not.toBeCalled();

  jest.runAllTimers();

  expect(dispatch).toBeCalledWith('msg');
});

test('promise returns array with cmd that runs promise', async () => {
  const cmd = sut.promise<Msg>(async (dispatch) => {
    await Promise.resolve();
    dispatch('msg');
  });

  expect(cmd).toHaveLength(1);

  const dispatch = jest.fn();
  await cmd[0](dispatch);

  expect(dispatch).toBeCalledWith('msg');
});

test('batch returns array with cmds', async () => {
  const cmd = sut.batch<Msg>(
    sut.delay<Msg>((dispatch) => dispatch('msg'), 100),
    sut.promise(async (dispatch) => {
      await Promise.resolve();
      dispatch('msg2');
    })
  );

  expect(cmd).toHaveLength(2);

  const dispatch = jest.fn();
  await cmd[0](dispatch);

  expect(dispatch).not.toBeCalled();

  jest.runAllTimers();

  expect(dispatch).toBeCalledWith('msg');

  dispatch.mockClear();

  await cmd[1](dispatch);

  expect(dispatch).toBeCalledWith('msg2');
});
