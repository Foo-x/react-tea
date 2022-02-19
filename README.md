# react-tea

The Elm Architecture for React.

[The Elm Architecture · An Introduction to Elm](https://guide.elm-lang.org/architecture/)

The differences from the original TEA are that:

- it is applied to each component, not to the entire app.
    - This allows you to partially introduce the library to your app.
- it can be combined with Hooks.


## Why is it?

React has Hooks to manage states and side effects.  
However, they are tightly coupled with view, which makes it difficult to test.  
There is also the problem that useReducer cannot handle asynchronous code.

The advantages of TEA are that:

- view and logic are separated, so they are easy to test.
- "update" can handle asynchronous code.

This library also supports using Hooks, so you can leverage assets of custom hooks.


## Installation

```sh
npm install @foo-x/react-tea
```


## Documents

- [Tutorial](./doc/Tutorial.md)
- [Reference](./doc/Reference.md)


## Examples

- [Simple Counter](./example/src/SimpleCounter.tsx)
- [Counter with Effects](./example/src/CounterWithEffects.tsx)
- [Counter with Context](./example/src/CounterWithContext.tsx)

There is also an example of a test, which will show you how easy it is to test!

- [Test for Simple Counter](./example/src/SimpleCounter.test.tsx)


## Snippets

- [For VSCode](./.vscode/tea.code-snippets)


## Advance

If the logic of the component is only with Hooks, consider using [react-container](https://github.com/Foo-x/react-container).


## License

MIT
