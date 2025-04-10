import Phaser from 'phaser';

export class BreathingBaseScene extends Phaser.Scene {
  private assets: Record<string, string>;
  private loadedAssets: Map<string, Phaser.GameObjects.Image>;
  
  constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config);
    this.assets = {};
    this.loadedAssets = new Map();
  }

  setAssets(assets: Record<string, string>) {
    this.assets = assets;
  }

  preload() {
    // Load all assets immediately
    Object.entries(this.assets).forEach(([key, url]) => {
      this.load.image(key, url);
    });
  }

  create() {
    // Create sprite pool
    Object.keys(this.assets).forEach(key => {
      const sprite = this.add.image(0, 0, key);
      sprite.setVisible(false);
      this.loadedAssets.set(key, sprite);
    });

    // Set background if it exists
    const background = this.loadedAssets.get('background');
    if (background) {
      background.setVisible(true)
        .setPosition(this.cameras.main.centerX, this.cameras.main.centerY)
        .setDisplaySize(800, 400)
        .setDepth(-1);
    }
  }

  getSprite(key: string): Phaser.GameObjects.Image | undefined {
    return this.loadedAssets.get(key);
  }

  shutdown() {
    // Clean up loaded assets
    this.loadedAssets.forEach(sprite => sprite.destroy());
    this.loadedAssets.clear();
  }

  destroy() {
    if (this.scene) {
      this.shutdown();
    }
  }
}