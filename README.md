# react-tea

The Elm Architecture for React.

[The Elm Architecture · An Introduction to Elm](https://guide.elm-lang.org/architecture/)

This library introduces The Elm Architecture (TEA) to React components.  
The difference from the original TEA is that it is applied to each component, not to the entire app.  
This allows you to partially introduce the library to your app.


## Why is it?

React has Hooks to manage states and side effects.  
However, they are tightly coupled with view, which makes it difficult to test.  
There is also the problem that useReducer cannot handle asynchronous code.

The advantages of TEA are that:

- view and logic are separated, so they are easy to test.
- update can handle asynchronous code.


## Installation

```sh
npm install @foo-x/react-tea
```


## API

See [API.md](./doc/API.md).


## Example

See [Counter.tsx](./example/src/Counter.tsx).


## License

MIT
