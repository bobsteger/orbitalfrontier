// Station menu - HTML/CSS based UI for when docked
// This creates DOM elements overlaid on the game

import { TradingSystem, GOODS } from '../systems/TradingSystem.js';

export class StationMenu {
  constructor(gameState, onUndock) {
    this.gameState = gameState;
    this.onUndock = onUndock;
    this.tradingSystem = new TradingSystem(gameState);
    this.currentStation = null;
    this.container = null;
    this.activeTab = 'hangar';
  }

  show(station) {
    this.currentStation = station;
    this.createUI();
    this.showTab('hangar');
  }

  hide() {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    this.currentStation = null;
  }

  createUI() {
    // Create main container
    this.container = document.createElement('div');
    this.container.id = 'stationMenu';
    this.container.innerHTML = `
      <style>
        #stationMenu {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(10, 15, 30, 0.95) 0%, rgba(20, 30, 50, 0.95) 100%);
          display: flex;
          flex-direction: column;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #ffffff;
          z-index: 1000;
        }

        .station-header {
          background: rgba(0, 0, 0, 0.3);
          padding: 20px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(79, 195, 247, 0.3);
        }

        .station-name {
          font-size: 28px;
          font-weight: 300;
          letter-spacing: 2px;
          color: #4fc3f7;
        }

        .station-faction {
          font-size: 14px;
          color: #888;
          margin-top: 5px;
        }

        .player-info {
          text-align: right;
        }

        .credits {
          font-size: 24px;
          color: #ffd700;
        }

        .cargo-space {
          font-size: 14px;
          color: #888;
          margin-top: 5px;
        }

        .station-nav {
          display: flex;
          gap: 0;
          background: rgba(0, 0, 0, 0.2);
          padding: 0 40px;
        }

        .nav-tab {
          padding: 15px 30px;
          background: transparent;
          border: none;
          color: #888;
          font-size: 14px;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .nav-tab:hover {
          color: #4fc3f7;
        }

        .nav-tab.active {
          color: #4fc3f7;
          border-bottom-color: #4fc3f7;
        }

        .station-content {
          flex: 1;
          padding: 30px 40px;
          overflow-y: auto;
        }

        .tab-content {
          display: none;
        }

        .tab-content.active {
          display: block;
        }

        .section-title {
          font-size: 18px;
          color: #4fc3f7;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(79, 195, 247, 0.2);
        }

        .ship-status {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }

        .status-card {
          background: rgba(0, 0, 0, 0.3);
          padding: 20px;
          border-radius: 10px;
          border: 1px solid rgba(79, 195, 247, 0.2);
        }

        .status-label {
          font-size: 12px;
          color: #888;
          text-transform: uppercase;
          margin-bottom: 5px;
        }

        .status-value {
          font-size: 24px;
        }

        .status-bar {
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          margin-top: 10px;
          overflow: hidden;
        }

        .status-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s;
        }

        .status-fill.hull { background: #4caf50; }
        .status-fill.shield { background: #2196f3; }
        .status-fill.fuel { background: #ff9800; }

        .repair-btn {
          margin-top: 15px;
          padding: 10px 20px;
          background: rgba(76, 175, 80, 0.2);
          border: 1px solid #4caf50;
          color: #4caf50;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .repair-btn:hover {
          background: rgba(76, 175, 80, 0.4);
        }

        .repair-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .trade-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 30px;
        }

        .trade-section {
          background: rgba(0, 0, 0, 0.3);
          padding: 20px;
          border-radius: 10px;
          border: 1px solid rgba(79, 195, 247, 0.2);
        }

        .trade-section h3 {
          font-size: 16px;
          color: #4fc3f7;
          margin-bottom: 15px;
        }

        .trade-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .trade-item:last-child {
          border-bottom: none;
        }

        .item-name {
          font-weight: 500;
        }

        .item-price {
          color: #ffd700;
        }

        .trade-btn {
          padding: 5px 15px;
          background: rgba(79, 195, 247, 0.2);
          border: 1px solid #4fc3f7;
          color: #4fc3f7;
          border-radius: 3px;
          cursor: pointer;
          margin-left: 10px;
          transition: all 0.2s;
        }

        .trade-btn:hover {
          background: rgba(79, 195, 247, 0.4);
        }

        .trade-btn.sell {
          background: rgba(255, 152, 0, 0.2);
          border-color: #ff9800;
          color: #ff9800;
        }

        .trade-btn.sell:hover {
          background: rgba(255, 152, 0, 0.4);
        }

        .undock-section {
          position: fixed;
          bottom: 30px;
          right: 40px;
        }

        .undock-btn {
          padding: 15px 40px;
          background: rgba(244, 67, 54, 0.2);
          border: 2px solid #f44336;
          color: #f44336;
          font-size: 16px;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .undock-btn:hover {
          background: rgba(244, 67, 54, 0.4);
        }

        .message {
          padding: 10px 20px;
          border-radius: 5px;
          margin-bottom: 20px;
          animation: fadeIn 0.3s;
        }

        .message.success {
          background: rgba(76, 175, 80, 0.2);
          border: 1px solid #4caf50;
          color: #4caf50;
        }

        .message.error {
          background: rgba(244, 67, 54, 0.2);
          border: 1px solid #f44336;
          color: #f44336;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      </style>

      <div class="station-header">
        <div>
          <div class="station-name">${this.currentStation.name}</div>
          <div class="station-faction">${this.getFactionName(this.currentStation.faction)}</div>
        </div>
        <div class="player-info">
          <div class="credits">${this.gameState.player.credits.toLocaleString()} CR</div>
          <div class="cargo-space">Cargo: ${this.gameState.getCargoWeight()}/${this.gameState.ship.cargoCapacity}</div>
        </div>
      </div>

      <div class="station-nav">
        <button class="nav-tab active" data-tab="hangar">Hangar</button>
        <button class="nav-tab" data-tab="market">Market</button>
      </div>

      <div class="station-content">
        <div id="messageArea"></div>

        <div class="tab-content active" data-content="hangar">
          ${this.renderHangarTab()}
        </div>

        <div class="tab-content" data-content="market">
          ${this.renderMarketTab()}
        </div>
      </div>

      <div class="undock-section">
        <button class="undock-btn" id="undockBtn">Undock</button>
      </div>
    `;

    document.body.appendChild(this.container);

    // Add event listeners
    this.container.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => this.showTab(tab.dataset.tab));
    });

    this.container.querySelector('#undockBtn').addEventListener('click', () => {
      this.hide();
      if (this.onUndock) this.onUndock();
    });

    // Repair button
    const repairBtn = this.container.querySelector('#repairBtn');
    if (repairBtn) {
      repairBtn.addEventListener('click', () => this.repair());
    }

    // Trade buttons
    this.container.querySelectorAll('.buy-btn').forEach(btn => {
      btn.addEventListener('click', () => this.buyGood(btn.dataset.good));
    });

    this.container.querySelectorAll('.sell-btn').forEach(btn => {
      btn.addEventListener('click', () => this.sellGood(btn.dataset.good));
    });
  }

  getFactionName(factionId) {
    const names = {
      earthAuthority: 'Earth Authority',
      lunarCollective: 'Lunar Collective',
      freeTradersGuild: 'Free Traders Guild'
    };
    return names[factionId] || 'Independent';
  }

  renderHangarTab() {
    const ship = this.gameState.ship;
    const hullPercent = (ship.hull / ship.maxHull) * 100;
    const shieldPercent = (ship.shield / ship.maxShield) * 100;
    const fuelPercent = (ship.fuel / ship.maxFuel) * 100;

    const repairCost = Math.ceil((ship.maxHull - ship.hull) * 10);
    const canRepair = ship.hull < ship.maxHull && this.gameState.player.credits >= repairCost;

    return `
      <h2 class="section-title">Ship Status</h2>
      <div class="ship-status">
        <div class="status-card">
          <div class="status-label">Hull Integrity</div>
          <div class="status-value">${ship.hull}/${ship.maxHull}</div>
          <div class="status-bar">
            <div class="status-fill hull" style="width: ${hullPercent}%"></div>
          </div>
        </div>
        <div class="status-card">
          <div class="status-label">Shield Charge</div>
          <div class="status-value">${ship.shield}/${ship.maxShield}</div>
          <div class="status-bar">
            <div class="status-fill shield" style="width: ${shieldPercent}%"></div>
          </div>
        </div>
        <div class="status-card">
          <div class="status-label">Fuel Level</div>
          <div class="status-value">${ship.fuel}/${ship.maxFuel}</div>
          <div class="status-bar">
            <div class="status-fill fuel" style="width: ${fuelPercent}%"></div>
          </div>
        </div>
      </div>

      <h2 class="section-title">Services</h2>
      <div class="status-card" style="max-width: 400px">
        <div class="status-label">Repair Hull</div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
          <span>Cost: ${repairCost} CR</span>
          <button class="repair-btn" id="repairBtn" ${!canRepair ? 'disabled' : ''}>
            ${ship.hull >= ship.maxHull ? 'Fully Repaired' : 'Repair'}
          </button>
        </div>
      </div>
    `;
  }

  renderMarketTab() {
    const prices = this.tradingSystem.getStationPrices(this.currentStation.id);
    const cargo = this.gameState.ship.cargo;

    let buyItems = '';
    let sellItems = '';

    for (const [id, good] of Object.entries(prices)) {
      buyItems += `
        <div class="trade-item">
          <div>
            <div class="item-name">${good.name}</div>
            <div style="font-size: 12px; color: #666">${good.description}</div>
          </div>
          <div style="display: flex; align-items: center;">
            <span class="item-price">${good.buyPrice} CR</span>
            <button class="trade-btn buy-btn" data-good="${id}">Buy</button>
          </div>
        </div>
      `;
    }

    if (cargo.length === 0) {
      sellItems = '<div style="color: #666; padding: 20px;">No cargo to sell</div>';
    } else {
      for (const item of cargo) {
        const good = GOODS[item.item];
        const sellPrice = this.tradingSystem.getSellPrice(this.currentStation.id, item.item);
        sellItems += `
          <div class="trade-item">
            <div>
              <div class="item-name">${good.name} (x${item.quantity})</div>
            </div>
            <div style="display: flex; align-items: center;">
              <span class="item-price">${sellPrice} CR each</span>
              <button class="trade-btn sell sell-btn" data-good="${item.item}">Sell</button>
            </div>
          </div>
        `;
      }
    }

    return `
      <div class="trade-grid">
        <div class="trade-section">
          <h3>Buy Goods</h3>
          ${buyItems}
        </div>
        <div class="trade-section">
          <h3>Sell Cargo</h3>
          ${sellItems}
        </div>
      </div>
    `;
  }

  showTab(tabName) {
    this.activeTab = tabName;

    this.container.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    this.container.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.dataset.content === tabName);
    });
  }

  showMessage(text, type = 'success') {
    const messageArea = this.container.querySelector('#messageArea');
    messageArea.innerHTML = `<div class="message ${type}">${text}</div>`;

    setTimeout(() => {
      messageArea.innerHTML = '';
    }, 3000);
  }

  repair() {
    const ship = this.gameState.ship;
    const repairCost = Math.ceil((ship.maxHull - ship.hull) * 10);

    if (this.gameState.removeCredits(repairCost)) {
      this.gameState.repairShip(ship.maxHull, ship.maxShield);
      this.showMessage(`Ship repaired for ${repairCost} CR`);
      this.refreshUI();
    } else {
      this.showMessage('Insufficient credits!', 'error');
    }
  }

  buyGood(goodId) {
    const result = this.tradingSystem.buy(this.currentStation.id, goodId, 1);
    this.showMessage(result.message, result.success ? 'success' : 'error');
    if (result.success) this.refreshUI();
  }

  sellGood(goodId) {
    const result = this.tradingSystem.sell(this.currentStation.id, goodId, 1);
    this.showMessage(result.message, result.success ? 'success' : 'error');
    if (result.success) this.refreshUI();
  }

  refreshUI() {
    // Re-render the UI with updated state
    this.hide();
    this.show(this.currentStation);
    this.showTab(this.activeTab);
  }
}
