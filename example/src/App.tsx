import './App.css';
import Counter from './Counter';
import CounterWithoutTea from './CounterWithoutTea';

function App() {
  return (
    <div style={{ margin: '5rem auto', maxWidth: '400px' }}>
      <Counter defaultValue={10} />
      ---
      <CounterWithoutTea defaultValue={10} />
    </div>
  );
}

export default App;
