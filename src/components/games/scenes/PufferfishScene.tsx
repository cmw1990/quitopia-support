import { Scene } from 'phaser';

export class PufferfishScene extends Scene {
  private pufferfish: Phaser.GameObjects.Sprite | null = null;
  private breathPhase: 'inhale' | 'hold' | 'exhale' | 'rest' = 'rest';
  private isLoading: boolean = true;

  constructor() {
    super({ key: 'PufferfishScene' });
  }

  init(data: { breathPhase: 'inhale' | 'hold' | 'exhale' | 'rest' }) {
    this.breathPhase = data.breathPhase;
  }

  preload() {
    try {
      this.load.image('pufferfish', '/placeholder.svg');
      this.load.image('background', '/placeholder.svg');

      this.load.on('complete', () => {
        console.log('Assets loaded successfully');
        this.isLoading = false;
      });

      this.load.on('loaderror', (file: any) => {
        console.error('Error loading asset:', file.key);
      });
    } catch (error) {
      console.error('Error in preload:', error);
    }
  }

  create() {
    try {
      // Add background
      const background = this.add.image(0, 0, 'background')
        .setOrigin(0, 0)
        .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

      // Add loading text
      const loadingText = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        'Loading...',
        { fontSize: '32px', color: '#000' }
      ).setOrigin(0.5);

      // Add pufferfish in the center
      this.pufferfish = this.add.sprite(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        'pufferfish'
      );
      
      // Set initial scale
      this.pufferfish.setScale(1);

      // Remove loading text once pufferfish is ready
      loadingText.destroy();

      // Add smooth animations
      this.tweens.add({
        targets: this.pufferfish,
        scale: { from: 1, to: 1.5 },
        duration: 1000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
        paused: true
      });

      console.log('Scene created successfully');
    } catch (error) {
      console.error('Error in create:', error);
    }
  }

  update() {
    if (this.isLoading || !this.pufferfish) return;

    try {
      // Update pufferfish based on breath phase
      const targetScale = this.breathPhase === 'inhale' ? 1.5 : 1;
      this.pufferfish.setScale(
        Phaser.Math.Linear(this.pufferfish.scale, targetScale, 0.1)
      );
    } catch (error) {
      console.error('Error in update:', error);
    }
  }
}