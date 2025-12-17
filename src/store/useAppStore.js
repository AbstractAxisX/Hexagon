import { create } from 'zustand';
import { getNeighbors } from '../utils/hexMath';
import { getSquareNeighbors } from '../utils/squareMath';

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

  // ✅ الگوریتم هوشمند: بسته به شکل، از Grid مناسب استفاده کن
  addTile: (coord1, coord2) => {
    const state = get();
    const shape = state.globalSettings.shape;
    
    let targetCoord = {};

    // تشخیص Grid System
    if (shape === 'hex') {
      // Hexagonal Grid
      let targetQ = coord1;
      let targetR = coord2;

      if (targetQ === undefined || targetR === undefined) {
        const emptySpot = findClosestEmptySpotHex(state.tiles);
        targetQ = emptySpot.q;
        targetR = emptySpot.r;
      }

      let attempts = 0;
      const maxAttempts = 50;
      const occupied = new Set(state.tiles.filter(t => t.shape === 'hex').map(t => `${t.q},${t.r}`));

      while (occupied.has(`${targetQ},${targetR}`) && attempts < maxAttempts) {
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

        if (!found) {
          const fallback = findClosestEmptySpotHex(state.tiles.filter(t => t.shape === 'hex'));
          targetQ = fallback.q;
          targetR = fallback.r;
        }

        attempts++;
      }

      if (occupied.has(`${targetQ},${targetR}`)) {
        console.error(`❌ بعد از ${maxAttempts} تلاش، جای خالی پیدا نشد!`);
        return;
      }

      if (state.tiles.filter(t => t.shape === 'hex').length > 0) {
        const hasValidNeighbor = state.tiles.some(tile => {
          if (tile.shape !== 'hex') return false;
          const neighbors = getNeighbors(tile.q, tile.r);
          return neighbors.some(n => n.q === targetQ && n.r === targetR);
        });

        if (!hasValidNeighbor) {
          const validSpot = findClosestEmptySpotHex(state.tiles.filter(t => t.shape === 'hex'));
          targetQ = validSpot.q;
          targetR = validSpot.r;
        }
      }

      targetCoord = { q: targetQ, r: targetR, x: null, y: null, shape: 'hex' };

    } else {
      // Square Grid (برای مربع و دایره)
      let targetX = coord1;
      let targetY = coord2;

      if (targetX === undefined || targetY === undefined) {
        const emptySpot = findClosestEmptySpotSquare(state.tiles);
        targetX = emptySpot.x;
        targetY = emptySpot.y;
      }

      let attempts = 0;
      const maxAttempts = 50;
      const occupied = new Set(state.tiles.filter(t => t.shape !== 'hex').map(t => `${t.x},${t.y}`));

      while (occupied.has(`${targetX},${targetY}`) && attempts < maxAttempts) {
        const neighbors = getSquareNeighbors(targetX, targetY);
        let found = false;

        for (const n of neighbors) {
          const key = `${n.x},${n.y}`;
          if (!occupied.has(key)) {
            targetX = n.x;
            targetY = n.y;
            found = true;
            break;
          }
        }

        if (!found) {
          const fallback = findClosestEmptySpotSquare(state.tiles.filter(t => t.shape !== 'hex'));
          targetX = fallback.x;
          targetY = fallback.y;
        }

        attempts++;
      }

      if (occupied.has(`${targetX},${targetY}`)) {
        console.error(`❌ بعد از ${maxAttempts} تلاش، جای خالی پیدا نشد!`);
        return;
      }

      if (state.tiles.filter(t => t.shape !== 'hex').length > 0) {
        const hasValidNeighbor = state.tiles.some(tile => {
          if (tile.shape === 'hex') return false;
          const neighbors = getSquareNeighbors(tile.x, tile.y);
          return neighbors.some(n => n.x === targetX && n.y === targetY);
        });

        if (!hasValidNeighbor) {
          const validSpot = findClosestEmptySpotSquare(state.tiles.filter(t => t.shape !== 'hex'));
          targetX = validSpot.x;
          targetY = validSpot.y;
        }
      }

      targetCoord = { q: null, r: null, x: targetX, y: targetY, shape };
    }

    const newTile = {
      id: crypto.randomUUID(),
      ...targetCoord,
      content: { type: 'empty', data: null }
    };

    console.log(`✅ کاشی جدید اضافه شد:`, targetCoord);
    set(state => ({ 
      tiles: [...state.tiles, newTile],
      focusedTileId: newTile.id, // اضافه شده برای هماهنگی با درخواست قبلی شما جهت فوکوس خودکار
      viewMode: 'focused'
    }));
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
        x: t.x,
        y: t.y,
        shape: t.shape,
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

  moveOrSwapTile: (draggedId, targetCoord) => {
    set(state => {
      const draggedTile = state.tiles.find(t => t.id === draggedId);
      if (!draggedTile) return state;

      // پیدا کردن کاشی مقصد با توجه به Grid System
      let targetTile;
      if (draggedTile.shape === 'hex') {
        targetTile = state.tiles.find(t => 
          t.shape === 'hex' && t.q === targetCoord.q && t.r === targetCoord.r && t.id !== draggedId
        );
      } else {
        targetTile = state.tiles.find(t => 
          t.shape !== 'hex' && t.x === targetCoord.x && t.y === targetCoord.y && t.id !== draggedId
        );
      }

      if (targetTile) {
        // SWAP
        return {
          tiles: state.tiles.map(t => {
            if (t.id === draggedId) {
              return draggedTile.shape === 'hex' 
                ? { ...t, q: targetCoord.q, r: targetCoord.r }
                : { ...t, x: targetCoord.x, y: targetCoord.y };
            }
            if (t.id === targetTile.id) {
              return draggedTile.shape === 'hex'
                ? { ...t, q: draggedTile.q, r: draggedTile.r }
                : { ...t, x: draggedTile.x, y: draggedTile.y };
            }
            return t;
          })
        };
      } else {
        // MOVE
        return {
          tiles: state.tiles.map(t =>
            t.id === draggedId 
              ? (draggedTile.shape === 'hex'
                  ? { ...t, q: targetCoord.q, r: targetCoord.r }
                  : { ...t, x: targetCoord.x, y: targetCoord.y })
              : t
          )
        };
      }
    });
  },

  addRingAround: () => {
    const state = get();
    const currentTiles = state.tiles;
    // فرض بر این است که وقتی رینگ اضافه می‌شود همه کاشی‌ها یک شکل هستند
    // یا بر اساس تنظیمات گلوبال تصمیم می‌گیریم
    const shape = state.globalSettings.shape;
    
    if (shape === 'hex') {
      const existingCoords = new Set(currentTiles.filter(t => t.shape === 'hex').map(t => `${t.q},${t.r}`));
      const candidates = new Set();

      currentTiles.filter(t => t.shape === 'hex').forEach(tile => {
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
          q, r, x: null, y: null,
          shape: 'hex',
          content: { type: 'empty' }
        };
      });

      set(state => ({ tiles: [...state.tiles, ...newTiles] }));

    } else {
      const existingCoords = new Set(currentTiles.filter(t => t.shape !== 'hex').map(t => `${t.x},${t.y}`));
      const candidates = new Set();

      currentTiles.filter(t => t.shape !== 'hex').forEach(tile => {
        const neighbors = getSquareNeighbors(tile.x, tile.y);
        neighbors.forEach(n => {
          const key = `${n.x},${n.y}`;
          if (!existingCoords.has(key)) {
            candidates.add(key);
          }
        });
      });

      const newTiles = Array.from(candidates).map(key => {
        const [x, y] = key.split(',').map(Number);
        return {
          id: crypto.randomUUID(),
          q: null, r: null, x, y,
          shape,
          content: { type: 'empty' }
        };
      });

      set(state => ({ tiles: [...state.tiles, ...newTiles] }));
    }
  },

  setFocus: (tileId) => set({ viewMode: 'focused', focusedTileId: tileId }),
  setOverview: () => set({ viewMode: 'overview', focusedTileId: null }),
}));

// ==================== توابع کمکی ====================

function findClosestEmptySpotHex(tiles) {
  if (tiles.length === 0) return { q: 0, r: 0 };

  const occupied = new Set(tiles.map(t => `${t.q},${t.r}`));
  const candidatesMap = new Map();

  tiles.forEach(tile => {
    const neighbors = getNeighbors(tile.q, tile.r);
    neighbors.forEach(n => {
      const key = `${n.q},${n.r}`;
      if (occupied.has(key)) return;

      const distToCenter = (Math.abs(n.q) + Math.abs(n.r) + Math.abs(n.q + n.r)) / 2;
      let occupiedNeighbors = 0;
      const subNeighbors = getNeighbors(n.q, n.r);
      subNeighbors.forEach(sn => {
        if (occupied.has(`${sn.q},${sn.r}`)) occupiedNeighbors++;
      });

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
  finalCandidates.sort((a, b) => {
    if (b.neighbors !== a.neighbors) {
      return b.neighbors - a.neighbors;
    }
    return a.dist - b.dist;
  });

  return finalCandidates[0] || { q: 0, r: 0 };
}

function findClosestEmptySpotSquare(tiles) {
  if (tiles.length === 0) return { x: 0, y: 0 };

  const occupied = new Set(tiles.map(t => `${t.x},${t.y}`));
  const candidatesMap = new Map();

  tiles.forEach(tile => {
    const neighbors = getSquareNeighbors(tile.x, tile.y);
    neighbors.forEach(n => {
      const key = `${n.x},${n.y}`;
      if (occupied.has(key)) return;

      const distToCenter = Math.abs(n.x) + Math.abs(n.y);
      let occupiedNeighbors = 0;
      const subNeighbors = getSquareNeighbors(n.x, n.y);
      subNeighbors.forEach(sn => {
        if (occupied.has(`${sn.x},${sn.y}`)) occupiedNeighbors++;
      });

      if (!candidatesMap.has(key)) {
        candidatesMap.set(key, {
          x: n.x,
          y: n.y,
          dist: distToCenter,
          neighbors: occupiedNeighbors
        });
      }
    });
  });

  const finalCandidates = Array.from(candidatesMap.values());
  finalCandidates.sort((a, b) => {
    if (b.neighbors !== a.neighbors) {
      return b.neighbors - a.neighbors;
    }
    return a.dist - b.dist;
  });

  return finalCandidates[0] || { x: 0, y: 0 };
}

export default useAppStore;