# Reference

## Cmd

Cmd is an asynchronous action that dispatch messages.  
Unlike the original TEA, it only handles asynchronous processing. This is because TypeScript allows to occur side effects anywhere, so if the process is synchronous, you can execute it in the update function.


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
 * <Msg>
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
 * <Msg>
 * promiseAction = (dispatch: React.Dispatch<Msg>) => Promise<void>
 */
```

Returns Cmd that dispatches a message asynchronously.


### perform

```ts
Cmd.perform(msgSupplier, task);
/**
 * where
 * 
 * <Msg, Value>
 * msgSupplier = (value: Value) => Msg
 * task = () => Promise<Value>
 */
```

Returns Cmd that dispatches a message supplied from `msgSupplier` which receives value from `task`.  
If `task` fails, the error will be ignored and nothing will be dispatched.  
This is useful to separate side effects as `task`.


### attempt

```ts
Cmd.attempt(msgSupplier, task);
/**
 * where
 * 
 * <Msg, Value, Err>
 * msgSupplier = (valueOrErr: Value | Err) => Msg
 * task = () => Promise<Value>
 */
```

Works like `perform`, but this one can handle errors.


### batch

```ts
Cmd.batch(...cmds);
/**
 * where
 * 
 * <Msg>
 * cmds = Cmd<Msg>[]
 */
```

Returns array of Cmd.


## Sub

Sub is a listener that subscribes external events or component's lifecycle.  
It is practically the same as `useEffect`.


### none

```ts
Sub.none();
```

Returns Sub that subscribes nothing.


### of

```ts
Sub.of(effector);
/**
 * where
 * 
 * <Model, Msg, Props>
 * effector = (effectorProps) => Parameters<typeof useEffect>
 * effectorProps = {
 *   model: Model;
 *   dispatch: React.Dispatch<Msg>;
 *   props: Props;
 * }
 */
```

Returns Sub that subscribes events.


### onMount

```ts
Sub.onMount(callback);
/**
 * where
 * 
 * <Model, Msg, Props>
 * callback = (props) => void
 * props = {
 *   model: Model;
 *   dispatch: React.Dispatch<Msg>;
 *   props: Props;
 * }
 */
```

Returns Sub that subscribes events on mount.


### onUnmount

```ts
Sub.onUnmount(callback);
/**
 * where
 * 
 * <Model, Msg, Props>
 * callback = (props) => void
 * props = {
 *   model: Model;
 *   dispatch: React.Dispatch<Msg>;
 *   props: Props;
 * }
 */
```

Returns Sub that subscribes events on unmount.


### batch

```ts
Sub.batch(...subs);
/**
 * where
 * 
 * <Model, Msg, Props>
 * subs = Sub<Model, Msg, Props>[]
 */
```

Returns array of Sub.


## Tea

```ts
Tea({ init, update, subscriptions, useHooks, view, displayName });
/**
 * where
 * 
 * <Model, Msg, Props, HooksResult>
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
 *   props: Props;
 *   hooksResult?: HooksResult;
 * }>
 * displayName? = string
 */
```

Returns React component.  
`displayName` is used in debugging messages. Default name is `TeaComponent`.
