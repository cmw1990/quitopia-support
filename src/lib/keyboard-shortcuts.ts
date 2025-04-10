import { focusEventBus } from './focus-event-bus';
import { userPreferences } from './user-preferences';

interface ShortcutBinding {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  description: string;
  action: () => void;
  category: 'focus' | 'navigation' | 'task' | 'environment' | 'accessibility';
}

class KeyboardShortcuts {
  private static instance: KeyboardShortcuts;
  private shortcuts: Map<string, ShortcutBinding>;
  private enabled: boolean;

  private constructor() {
    this.shortcuts = new Map();
    this.enabled = userPreferences.getPreferences().assistance.useKeyboardShortcuts;
    this.setupDefaultShortcuts();
    this.setupEventListeners();
  }

  public static getInstance(): KeyboardShortcuts {
    if (!KeyboardShortcuts.instance) {
      KeyboardShortcuts.instance = new KeyboardShortcuts();
    }
    return KeyboardShortcuts.instance;
  }

  private setupEventListeners(): void {
    document.addEventListener('keydown', this.handleKeyPress.bind(this));
    
    userPreferences.subscribe(prefs => {
      this.enabled = prefs.assistance.useKeyboardShortcuts;
    });
  }

  private handleKeyPress(event: KeyboardEvent): void {
    if (!this.enabled) return;

    const key = event.key.toLowerCase();
    const shortcutKey = this.generateShortcutKey(event);
    const shortcut = this.shortcuts.get(shortcutKey);

    if (shortcut) {
      event.preventDefault();
      shortcut.action();
      focusEventBus.emit('shortcutTriggered', {
        shortcut: shortcutKey,
        category: shortcut.category,
        timestamp: Date.now()
      });
    }
  }

  private generateShortcutKey(event: KeyboardEvent): string {
    const modifiers = [];
    if (event.ctrlKey || event.metaKey) modifiers.push('ctrl');
    if (event.altKey) modifiers.push('alt');
    if (event.shiftKey) modifiers.push('shift');
    modifiers.push(event.key.toLowerCase());
    return modifiers.join('+');
  }

  private setupDefaultShortcuts(): void {
    // Focus Timer Controls
    this.register({
      key: 'space',
      description: 'Start/Pause Focus Timer',
      action: () => focusEventBus.emit('timerStateUpdate', { type: 'toggle' }),
      category: 'focus'
    });

    this.register({
      key: 'b',
      description: 'Take a Break',
      action: () => focusEventBus.emit('timerStateUpdate', { type: 'break' }),
      category: 'focus'
    });

    // Task Management
    this.register({
      key: 't',
      ctrl: true,
      description: 'New Task',
      action: () => focusEventBus.emit('taskStatusChange', { action: 'new' }),
      category: 'task'
    });

    this.register({
      key: 'Enter',
      ctrl: true,
      description: 'Complete Current Task',
      action: () => focusEventBus.emit('taskStatusChange', { action: 'complete' }),
      category: 'task'
    });

    // Environment Controls
    this.register({
      key: 'd',
      ctrl: true,
      description: 'Toggle Distraction Blocker',
      action: () => focusEventBus.emit('focusModeChange', { mode: 'toggle' }),
      category: 'environment'
    });

    this.register({
      key: 'e',
      ctrl: true,
      description: 'Optimize Environment',
      action: () => focusEventBus.emit('environmentUpdate', { action: 'optimize' }),
      category: 'environment'
    });

    // Accessibility Features
    this.register({
      key: 'z',
      ctrl: true,
      description: 'Toggle High Contrast',
      action: () => {
        const prefs = userPreferences.getPreferences();
        userPreferences.updatePreferences({
          accessibility: {
            ...prefs.accessibility,
            highContrast: !prefs.accessibility.highContrast
          }
        });
      },
      category: 'accessibility'
    });

    this.register({
      key: '+',
      ctrl: true,
      description: 'Increase Text Size',
      action: () => {
        const prefs = userPreferences.getPreferences();
        userPreferences.updatePreferences({
          accessibility: {
            ...prefs.accessibility,
            largeText: true
          }
        });
      },
      category: 'accessibility'
    });
  }

  public register(binding: ShortcutBinding): void {
    const shortcutKey = this.generateBindingKey(binding);
    this.shortcuts.set(shortcutKey, binding);
  }

  public unregister(binding: Partial<ShortcutBinding>): void {
    const shortcutKey = this.generateBindingKey(binding as ShortcutBinding);
    this.shortcuts.delete(shortcutKey);
  }

  private generateBindingKey(binding: ShortcutBinding): string {
    const modifiers = [];
    if (binding.ctrl) modifiers.push('ctrl');
    if (binding.alt) modifiers.push('alt');
    if (binding.shift) modifiers.push('shift');
    modifiers.push(binding.key.toLowerCase());
    return modifiers.join('+');
  }

  public getShortcuts(): ShortcutBinding[] {
    return Array.from(this.shortcuts.values());
  }

  public getShortcutsByCategory(category: ShortcutBinding['category']): ShortcutBinding[] {
    return this.getShortcuts().filter(s => s.category === category);
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    userPreferences.updatePreferences({
      assistance: {
        ...userPreferences.getPreferences().assistance,
        useKeyboardShortcuts: enabled
      }
    });
  }

  public getShortcutHelp(): Record<string, { description: string; binding: string }[]> {
    const help: Record<string, { description: string; binding: string }[]> = {
      focus: [],
      task: [],
      environment: [],
      accessibility: [],
      navigation: []
    };

    this.getShortcuts().forEach(shortcut => {
      help[shortcut.category].push({
        description: shortcut.description,
        binding: this.generateBindingKey(shortcut)
      });
    });

    return help;
  }
}

export const keyboardShortcuts = KeyboardShortcuts.getInstance();
