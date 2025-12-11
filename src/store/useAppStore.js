import { create } from 'zustand';
import { getNeighbors } from '../utils/hexMath';

const useAppStore = create((set, get) => ({
  globalSettings: {
    shape: 'hex',
    size: 'm',
    material: 'forex',
    corner: 'sharp',
  },

  tiles: [],

  wallColor: '#1a1a1a',
  selectedTileId: null,
  viewMode: 'overview',
  focusedTileId: null,

  totalPrice: 0,
  isCalculating: false,

  setGlobalSetting: (key, value) => {
    set((state) => ({
      globalSettings: { ...state.globalSettings, [key]: value }
    }));
  },

  // ✅ FIX: کلیک من حروم نمیشه! تا جای سالم پیدا نکنه ول نمی‌کنه
  addTile: (q, r) => {
    const state = get();
    let targetQ = q;
    let targetR = r;

    // اگر مختصات نداریم، الگوریتم خودش پیدا می‌کنه
    if (targetQ === undefined || targetR === undefined) {
      const emptySpot = findClosestEmptySpot(state.tiles);
      targetQ = emptySpot.q;
      targetR = emptySpot.r;
    }

    // ✅ اگر این جا اشغاله، جای دیگه‌ای پیدا کن (تا 50 تلاش)
    let attempts = 0;
    const maxAttempts = 50;
    const occupied = new Set(state.tiles.map(t => `${t.q},${t.r}`));

    while (occupied.has(`${targetQ},${targetR}`) && attempts < maxAttempts) {
      console.warn(`⚠️ (${targetQ}, ${targetR}) اشغاله! دارم جای دیگه می‌گردم...`);
      
      // بگرد دور همسایه‌ها تا جای خالی پیدا کنی
      const neighbors = getNeighbors(targetQ, targetR);
      let found = false;

      for (const n of neighbors) {
        const key = `${n.q},${n.r}`;
        if (!occupied.has(key)) {
          targetQ = n.q;
          targetR = n.r;
          found = true;
          break;
        }
      }

      // اگر همسایه‌ها پرن، از الگوریتم اصلی کمک بگیر
      if (!found) {
        const fallback = findClosestEmptySpot(state.tiles);
        targetQ = fallback.q;
        targetR = fallback.r;
      }

      attempts++;
    }

    // ✅ چک نهایی: آیا بازم اشغاله؟
    if (occupied.has(`${targetQ},${targetR}`)) {
      console.error(`❌ بعد از ${maxAttempts} تلاش، جای خالی پیدا نشد!`);
      return;
    }

    // ✅ چک قانون: آیا چسبیده به کاشی موجود هست؟
    if (state.tiles.length > 0) {
      const hasValidNeighbor = state.tiles.some(tile => {
        const neighbors = getNeighbors(tile.q, tile.r);
        return neighbors.some(n => n.q === targetQ && n.r === targetR);
      });

      if (!hasValidNeighbor) {
        console.error(`❌ (${targetQ}, ${targetR}) چسبیده به هیچ کاشی نیست! رد شد.`);
        // تلاش برای پیدا کردن جای معتبر
        const validSpot = findClosestEmptySpot(state.tiles);
        targetQ = validSpot.q;
        targetR = validSpot.r;
      }
    }

    
    // ✅ همه چیز OK - اضافه کن!
    const newTile = {
      id: crypto.randomUUID(),
      q: targetQ,
      r: targetR,
      content: { type: 'empty', data: null }
    };

    console.log(`✅ کاشی جدید در (${targetQ}, ${targetR}) اضافه شد`);
    set(state => ({ tiles: [...state.tiles, newTile] }));
  },

  removeTile: (id) => {
    set((state) => ({
      tiles: state.tiles.filter(t => t.id !== id),
      selectedTileId: null
    }));
  },

  updateTileContent: (id, type, data) => {
    set((state) => ({
      tiles: state.tiles.map(t =>
        t.id === id ? { ...t, content: { type, data } } : t
      )
    }));
  },

  selectTile: (id) => set({ selectedTileId: id }),
  setWallColor: (color) => set({ wallColor: color }),

  generateOrderPayload: () => {
    const state = get();
    return {
      config: state.globalSettings,
      tiles: state.tiles.map(t => ({
        q: t.q,
        r: t.r,
        type: t.content.type,
        content: t.content.data
      }))
    };
  },

  fetchPriceFromBackend: async () => {
    set({ isCalculating: true });
    const payload = get().generateOrderPayload();

    try {
      console.log("📡 Sending data to server for pricing:", payload);
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockPriceFromServer = 1_500_000;
      set({ totalPrice: mockPriceFromServer });
    } catch (error) {
      console.error("خطا در محاسبه قیمت:", error);
    } finally {
      set({ isCalculating: false });
    }
  },

  moveOrSwapTile: (draggedId, targetQ, targetR) => {
    set(state => {
      const draggedTile = state.tiles.find(t => t.id === draggedId);
      if (!draggedTile) return state;

      const targetTile = state.tiles.find(t => t.q === targetQ && t.r === targetR);

      if (targetTile) {
        // SWAP
        return {
          tiles: state.tiles.map(t => {
            if (t.id === draggedId) return { ...t, q: targetQ, r: targetR };
            if (t.id === targetTile.id) return { ...t, q: draggedTile.q, r: draggedTile.r };
            return t;
          })
        };
      } else {
        // MOVE (Canvas قبلاً چک کرده که جای معتبر هست)
        return {
          tiles: state.tiles.map(t =>
            t.id === draggedId ? { ...t, q: targetQ, r: targetR } : t
          )
        };
      }
    });
  },

  addRingAround: () => {
    const currentTiles = get().tiles;
    const existingCoords = new Set(currentTiles.map(t => `${t.q},${t.r}`));
    const candidates = new Set();

    currentTiles.forEach(tile => {
      const neighbors = getNeighbors(tile.q, tile.r);
      neighbors.forEach(n => {
        const key = `${n.q},${n.r}`;
        if (!existingCoords.has(key)) {
          candidates.add(key);
        }
      });
    });

    const newTiles = Array.from(candidates).map(key => {
      const [q, r] = key.split(',').map(Number);
      return {
        id: crypto.randomUUID(),
        q, r,
        content: { type: 'empty' }
      };
    });

    set(state => ({ tiles: [...state.tiles, ...newTiles] }));
  },

  setFocus: (tileId) => set({ viewMode: 'focused', focusedTileId: tileId }),
  setOverview: () => set({ viewMode: 'overview', focusedTileId: null }),
}));

// ✅ الگوریتم هوشمند: فقط جاهای چسبیده رو برمی‌گردونه
function findClosestEmptySpot(tiles) {
  // اگه هیچی نیست، اولی باش
  if (tiles.length === 0) return { q: 0, r: 0 };

  const occupied = new Set(tiles.map(t => `${t.q},${t.r}`));
  const candidatesMap = new Map();

  // ✅ فقط همسایه‌های خالی کاشی‌های موجود رو در نظر بگیر
  tiles.forEach(tile => {
    const neighbors = getNeighbors(tile.q, tile.r);
    
    neighbors.forEach(n => {
      const key = `${n.q},${n.r}`;
      
      // اگه پره، رد کن
      if (occupied.has(key)) return;

      // محاسبه فاصله تا مرکز
      const distToCenter = (Math.abs(n.q) + Math.abs(n.r) + Math.abs(n.q + n.r)) / 2;

      // شمارش همسایه‌های پر (برای تراکم بیشتر)
      let occupiedNeighbors = 0;
      const subNeighbors = getNeighbors(n.q, n.r);
      subNeighbors.forEach(sn => {
        if (occupied.has(`${sn.q},${sn.r}`)) occupiedNeighbors++;
      });

      // اگه تکراری نیست، اضافه کن
      if (!candidatesMap.has(key)) {
        candidatesMap.set(key, {
          q: n.q,
          r: n.r,
          dist: distToCenter,
          neighbors: occupiedNeighbors
        });
      }
    });
  });

  const finalCandidates = Array.from(candidatesMap.values());

  // ✅ مرتب‌سازی: اول بیشترین تراکم، بعد نزدیک‌ترین مرکز
  finalCandidates.sort((a, b) => {
    if (b.neighbors !== a.neighbors) {
      return b.neighbors - a.neighbors;
    }
    return a.dist - b.dist;
  });



  
  return finalCandidates[0] || { q: 0, r: 0 };
}

export default useAppStore;
