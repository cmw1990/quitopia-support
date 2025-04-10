// Browser extension interface for focus mode and distraction blocking

export const focusExtension = {
  // Extension Status
  async isExtensionInstalled(): Promise<boolean> {
    try {
      // Check if the extension is installed by attempting to communicate with it
      return await chrome.runtime.sendMessage({ type: 'ping' })
        .then(() => true)
        .catch(() => false);
    } catch {
      return false;
    }
  },

  async isExtensionEnabled(): Promise<boolean> {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'getStatus' });
      return response.enabled;
    } catch {
      return false;
    }
  },

  // Blocking Controls
  async enableBlocking(): Promise<void> {
    await chrome.runtime.sendMessage({ type: 'enableBlocking' });
  },

  async disableBlocking(): Promise<void> {
    await chrome.runtime.sendMessage({ type: 'disableBlocking' });
  },

  async updateBlockedSites(sites: string[]): Promise<void> {
    await chrome.runtime.sendMessage({
      type: 'updateBlockedSites',
      sites,
    });
  },

  async updateBlockingSettings(settings: {
    blockAds: boolean;
    blockSocialMedia: boolean;
    blockNotifications: boolean;
    scheduleEnabled: boolean;
    scheduleStart: string;
    scheduleEnd: string;
  }): Promise<void> {
    await chrome.runtime.sendMessage({
      type: 'updateSettings',
      settings,
    });
  },

  // Ad Blocking
  async enableAdBlocking(): Promise<void> {
    await chrome.runtime.sendMessage({ type: 'enableAdBlocking' });
  },

  async disableAdBlocking(): Promise<void> {
    await chrome.runtime.sendMessage({ type: 'disableAdBlocking' });
  },

  async updateAdBlockingRules(rules: string[]): Promise<void> {
    await chrome.runtime.sendMessage({
      type: 'updateAdBlockingRules',
      rules,
    });
  },

  // Notification Control
  async enableNotificationBlocking(): Promise<void> {
    await chrome.runtime.sendMessage({ type: 'enableNotificationBlocking' });
  },

  async disableNotificationBlocking(): Promise<void> {
    await chrome.runtime.sendMessage({ type: 'disableNotificationBlocking' });
  },

  // Statistics
  async getBlockingStats(): Promise<{
    sitesBlocked: number;
    adsBlocked: number;
    notificationsBlocked: number;
    timesSaved: number;
  }> {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'getStats' });
      return response.stats;
    } catch {
      return {
        sitesBlocked: 0,
        adsBlocked: 0,
        notificationsBlocked: 0,
        timesSaved: 0,
      };
    }
  },

  // Schedule Management
  async updateBlockingSchedule(schedule: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    days: string[];
  }): Promise<void> {
    await chrome.runtime.sendMessage({
      type: 'updateSchedule',
      schedule,
    });
  },

  // Allowlist Management
  async updateAllowlist(domains: string[]): Promise<void> {
    await chrome.runtime.sendMessage({
      type: 'updateAllowlist',
      domains,
    });
  },

  // Focus Mode
  async enableFocusMode(): Promise<void> {
    await chrome.runtime.sendMessage({ type: 'enableFocusMode' });
  },

  async disableFocusMode(): Promise<void> {
    await chrome.runtime.sendMessage({ type: 'disableFocusMode' });
  },

  // Event Listeners
  onBlockedSiteAttempt(callback: (site: string) => void): void {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'blockedSiteAttempt') {
        callback(message.site);
      }
    });
  },

  onFocusModeStateChange(callback: (enabled: boolean) => void): void {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'focusModeStateChange') {
        callback(message.enabled);
      }
    });
  },

  onStatsUpdate(callback: (stats: any) => void): void {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'statsUpdate') {
        callback(message.stats);
      }
    });
  },
};
