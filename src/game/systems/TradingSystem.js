// Trading system - handles goods, prices, and transactions

// Goods available for trade
export const GOODS = {
  // Raw Materials
  ore: {
    name: 'Ore',
    category: 'raw',
    basePrice: 50,
    description: 'Unprocessed mineral ore from asteroid mining'
  },
  ice: {
    name: 'Ice',
    category: 'raw',
    basePrice: 30,
    description: 'Water ice, essential for life support and fuel'
  },
  helium3: {
    name: 'Helium-3',
    category: 'raw',
    basePrice: 500,
    description: 'Rare fusion fuel harvested from lunar regolith'
  },

  // Manufactured Goods
  electronics: {
    name: 'Electronics',
    category: 'manufactured',
    basePrice: 200,
    description: 'Advanced electronic components'
  },
  parts: {
    name: 'Ship Parts',
    category: 'manufactured',
    basePrice: 150,
    description: 'Replacement parts for spacecraft systems'
  },
  medicine: {
    name: 'Medicine',
    category: 'manufactured',
    basePrice: 300,
    description: 'Medical supplies and pharmaceuticals'
  },

  // Contraband (future)
  weapons: {
    name: 'Weapons',
    category: 'contraband',
    basePrice: 800,
    description: 'Illegal arms shipment',
    illegal: true
  }
};

// Station-specific price modifiers
const STATION_PRICES = {
  earth_base: {
    // Earth has manufactured goods cheap, needs raw materials
    ore: { buy: 1.3, sell: 0.7 },
    ice: { buy: 1.2, sell: 0.8 },
    helium3: { buy: 1.5, sell: 0.5 },
    electronics: { buy: 0.8, sell: 1.2 },
    parts: { buy: 0.9, sell: 1.1 },
    medicine: { buy: 0.85, sell: 1.15 }
  },
  moon_base: {
    // Moon produces raw materials, needs manufactured goods
    ore: { buy: 0.6, sell: 1.4 },
    ice: { buy: 0.7, sell: 1.3 },
    helium3: { buy: 0.5, sell: 1.5 },
    electronics: { buy: 1.3, sell: 0.7 },
    parts: { buy: 1.2, sell: 0.8 },
    medicine: { buy: 1.4, sell: 0.6 }
  },
  orbital_station: {
    // Neutral trade hub, balanced prices
    ore: { buy: 1.0, sell: 1.0 },
    ice: { buy: 1.0, sell: 1.0 },
    helium3: { buy: 1.0, sell: 1.0 },
    electronics: { buy: 1.0, sell: 1.0 },
    parts: { buy: 1.0, sell: 1.0 },
    medicine: { buy: 1.0, sell: 1.0 }
  }
};

export class TradingSystem {
  constructor(gameState) {
    this.gameState = gameState;
  }

  // Get price to buy a good at a station
  getBuyPrice(stationId, goodId) {
    const good = GOODS[goodId];
    if (!good) return null;

    const stationPrices = STATION_PRICES[stationId];
    if (!stationPrices || !stationPrices[goodId]) {
      return good.basePrice;
    }

    return Math.round(good.basePrice * stationPrices[goodId].buy);
  }

  // Get price to sell a good at a station
  getSellPrice(stationId, goodId) {
    const good = GOODS[goodId];
    if (!good) return null;

    const stationPrices = STATION_PRICES[stationId];
    if (!stationPrices || !stationPrices[goodId]) {
      return Math.round(good.basePrice * 0.9); // 10% loss at neutral
    }

    return Math.round(good.basePrice * stationPrices[goodId].sell);
  }

  // Get all prices for a station
  getStationPrices(stationId) {
    const prices = {};

    for (const goodId of Object.keys(GOODS)) {
      const good = GOODS[goodId];
      if (good.illegal) continue; // Skip contraband for now

      prices[goodId] = {
        ...good,
        id: goodId,
        buyPrice: this.getBuyPrice(stationId, goodId),
        sellPrice: this.getSellPrice(stationId, goodId)
      };
    }

    return prices;
  }

  // Attempt to buy goods
  buy(stationId, goodId, quantity) {
    const price = this.getBuyPrice(stationId, goodId);
    if (!price) return { success: false, message: 'Invalid good' };

    const totalCost = price * quantity;

    // Check if player has enough credits
    if (this.gameState.player.credits < totalCost) {
      return { success: false, message: 'Insufficient credits' };
    }

    // Check if player has enough cargo space
    const currentCargo = this.gameState.getCargoWeight();
    if (currentCargo + quantity > this.gameState.ship.cargoCapacity) {
      return { success: false, message: 'Insufficient cargo space' };
    }

    // Process transaction
    this.gameState.removeCredits(totalCost);
    this.gameState.addCargo(goodId, quantity);

    return {
      success: true,
      message: `Bought ${quantity} ${GOODS[goodId].name} for ${totalCost} credits`
    };
  }

  // Attempt to sell goods
  sell(stationId, goodId, quantity) {
    const price = this.getSellPrice(stationId, goodId);
    if (!price) return { success: false, message: 'Invalid good' };

    // Check if player has the goods
    const cargo = this.gameState.ship.cargo.find(c => c.item === goodId);
    if (!cargo || cargo.quantity < quantity) {
      return { success: false, message: 'Insufficient goods in cargo' };
    }

    const totalValue = price * quantity;

    // Process transaction
    this.gameState.removeCargo(goodId, quantity);
    this.gameState.addCredits(totalValue);

    return {
      success: true,
      message: `Sold ${quantity} ${GOODS[goodId].name} for ${totalValue} credits`
    };
  }

  // Get player's cargo with current station prices
  getCargoWithPrices(stationId) {
    return this.gameState.ship.cargo.map(item => ({
      ...item,
      good: GOODS[item.item],
      sellPrice: this.getSellPrice(stationId, item.item),
      totalValue: this.getSellPrice(stationId, item.item) * item.quantity
    }));
  }

  // Calculate best trade route from current station
  calculateBestTrade(currentStationId) {
    const trades = [];

    for (const goodId of Object.keys(GOODS)) {
      const good = GOODS[goodId];
      if (good.illegal) continue;

      const buyPrice = this.getBuyPrice(currentStationId, goodId);

      // Check sell prices at other stations
      for (const stationId of Object.keys(STATION_PRICES)) {
        if (stationId === currentStationId) continue;

        const sellPrice = this.getSellPrice(stationId, goodId);
        const profit = sellPrice - buyPrice;
        const profitPercent = ((profit / buyPrice) * 100).toFixed(1);

        if (profit > 0) {
          trades.push({
            good: good.name,
            goodId,
            from: currentStationId,
            to: stationId,
            buyPrice,
            sellPrice,
            profit,
            profitPercent
          });
        }
      }
    }

    // Sort by profit
    trades.sort((a, b) => b.profit - a.profit);

    return trades;
  }
}
