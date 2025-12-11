import FabricCanvas from './components/Canvas/FabricCanvas';
import useAppStore from './store/useAppStore';

function App() {
  const addTile = useAppStore(state => state.addTile);
  
  return (
    <div className="flex flex-col h-screen">
      {/* هدر موقت */}
      <div className="h-16 bg-white shadow-md flex items-center px-6 justify-between z-10">
        <h1 className="text-xl font-bold">Modulari Debugger</h1>
        <button 
          onClick={() => addTile(Math.floor(Math.random() * 5), Math.floor(Math.random() * 5))}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          + افزودن کاشی تستی
        </button>
      </div>

      {/* ناحیه اصلی */}
      <div className="flex-1 overflow-hidden">
        <FabricCanvas />
      </div>
    </div>
  );
}

export default App;