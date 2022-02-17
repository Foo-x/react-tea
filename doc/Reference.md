# Reference

## Cmd

Cmd is an asynchronous action that dispatch messages.  
Unlike the original TEA, it only handles asynchronous processing. This is because TypeScript allows to occur side effects anywhere, so if the process is synchronous, it can be executed in the update function.


### none

```ts
Cmd.none();
```

Returns Cmd that dispatches nothing.


### delay

```ts
Cmd.delay(action, timeout);
/**
 * where
 * 
 * action = (dispatch: React.Dispatch<Msg>) => void
 * timeout = number
 */
```

Returns Cmd that dispatches a message after a delay.


### promise

```ts
Cmd.promise(promiseAction);
/**
 * where
 * 
 * promiseAction = (dispatch: React.Dispatch<Msg>) => Promise<void>
 */
```

Returns Cmd that dispatches a message asynchronously.


### batch

```ts
Cmd.batch(...cmds);
/**
 * where
 * 
 * cmds = Cmd<Msg>[]
 */
```

Returns array of Cmd.


## Sub

Sub is a listener that subscribe external events or component's lifecycle.  
It is practically the same as `useEffect`.


### none

```ts
Sub.none();
```

Returns Sub that subscribe nothing.


### of

```ts
Sub.of(effector);
/**
 * where
 * 
 * effector = (effectorProps) => Parameters<typeof useEffect>
 * effectorProps = {
 *   model: Model;
 *   dispatch: React.Dispatch<Msg>;
 *   props: Props;
 * }
 */
```

Returns Sub that subscribe events.


### onMount

```ts
Sub.onMount(callback);
/**
 * where
 * 
 * callback = (props) => void
 * props = {
 *   model: Model;
 *   dispatch: React.Dispatch<Msg>;
 *   props: Props;
 * }
 */
```

Returns Sub that subscribe events on mount.


### onUnmount

```ts
Sub.onUnmount(callback);
/**
 * where
 * 
 * callback = (props) => void
 * props = {
 *   model: Model;
 *   dispatch: React.Dispatch<Msg>;
 *   props: Props;
 * }
 */
```

Returns Sub that subscribe events on unmount.


### batch

```ts
Sub.batch(...subs);
/**
 * where
 * 
 * subs = Sub<Model, Msg, Props>[]
 */
```

Returns array of Sub.


## Tea

```ts
Tea({ init, update, subscriptions, useHooks, view });
/**
 * where
 * 
 * init = (initProps) => [Model, Cmd<Msg>]
 * initProps = {
 *   props: Props;
 * }
 * update = (updateProps) => [Model, Cmd<Msg>]
 * updateProps = {
 *   model: Model;
 *   msg: Msg;
 *   props: Props;
 * }
 * subscriptions = Sub<Model, Msg, Props>
 * useHooks? = (useHooksProps) => HooksResult
 * useHooksProps = {
 *   model: Model;
 *   dispatch: Dispatch<Msg>;
 *   props: Props;
 * }
 * view = React.VFC<{
 *   model: Model;
 *   dispatch: Dispatch<Msg>;
 *   hooksResult?: HooksResult;
 * } & Props>
 */
```

Returns React component.
