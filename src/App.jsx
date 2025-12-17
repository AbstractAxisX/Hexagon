import FabricCanvas from './components/Canvas/FabricCanvas';
import useAppStore from './store/useAppStore';

function App() {
  const addTile = useAppStore(state => state.addTile);
  const globalSettings = useAppStore(state => state.globalSettings);
  const setGlobalSetting = useAppStore(state => state.setGlobalSetting);

  const handleShapeChange = (shape) => {
    setGlobalSetting('shape', shape);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="h-16 bg-white shadow-md flex items-center px-6 justify-between z-10">
        <h1 className="text-xl font-bold">Modulari Debugger</h1>
        
        <div className="flex gap-4 items-center">
          {/* انتخاب شکل */}
          <div className="flex gap-2">
            <button
              onClick={() => handleShapeChange('hex')}
              className={`px-4 py-2 rounded transition ${
                globalSettings.shape === 'hex'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ⬡ شش‌ضلعی
            </button>
            <button
              onClick={() => handleShapeChange('square')}
              className={`px-4 py-2 rounded transition ${
                globalSettings.shape === 'square'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ▢ مربع
            </button>
            <button
              onClick={() => handleShapeChange('circle')}
              className={`px-4 py-2 rounded transition ${
                globalSettings.shape === 'circle'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ● دایره
            </button>
          </div>

          <button
            onClick={() => addTile()}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            + افزودن کاشی
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <FabricCanvas />
      </div>
    </div>
  );
}

export default App;
