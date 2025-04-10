import { z } from 'zod';
import GlobalErrorHandler from '../utils/global-error-handler';

// Environment types
export type Environment = 'development' | 'staging' | 'production';

// Base configuration schema
const BaseConfigSchema = z.object({
  environment: z.enum(['development', 'staging', 'production']),
  
  // Supabase configuration
  supabase: z.object({
    url: z.string().url(),
    anonKey: z.string(),
    serviceKey: z.string().optional()
  }),

  // Performance monitoring configuration
  performance: z.object({
    enableLogging: z.boolean().default(true),
    thresholds: z.object({
      databaseQuery: z.number().default(500),
      componentRender: z.number().default(100),
      apiCall: z.number().default(1000)
    }).default({
      databaseQuery: 500,
      componentRender: 100,
      apiCall: 1000
    })
  }),

  // Error handling configuration
  errorHandling: z.object({
    reportToMonitoring: z.boolean().default(true),
    logLevel: z.enum(['low', 'medium', 'high']).default('medium')
  }),

  // Feature flags
  features: z.record(z.string(), z.boolean()).optional()
});

// Type for base configuration
export type BaseConfig = z.infer<typeof BaseConfigSchema>;

class ConfigManager {
  private static instance: ConfigManager;
  private config: BaseConfig;

  private constructor() {
    // Load configuration from environment variables or default values
    this.config = this.loadConfiguration();
  }

  /**
   * Singleton instance getter
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Load configuration from environment variables
   */
  private loadConfiguration(): BaseConfig {
    try {
      const config: BaseConfig = {
        environment: this.getEnvironment(),
        supabase: {
          url: this.getRequiredEnv('VITE_SUPABASE_URL'),
          anonKey: this.getRequiredEnv('VITE_SUPABASE_ANON_KEY'),
          serviceKey: process.env.SUPABASE_SERVICE_KEY
        },
        performance: {
          enableLogging: this.getOptionalEnv('PERFORMANCE_LOGGING', 'true') === 'true',
          thresholds: {
            databaseQuery: Number(this.getOptionalEnv('PERF_THRESHOLD_DB_QUERY', '500')),
            componentRender: Number(this.getOptionalEnv('PERF_THRESHOLD_RENDER', '100')),
            apiCall: Number(this.getOptionalEnv('PERF_THRESHOLD_API', '1000'))
          }
        },
        errorHandling: {
          reportToMonitoring: this.getOptionalEnv('ERROR_REPORT_MONITORING', 'true') === 'true',
          logLevel: this.getOptionalEnv('ERROR_LOG_LEVEL', 'medium') as BaseConfig['errorHandling']['logLevel']
        },
        features: this.loadFeatureFlags()
      };

      // Validate configuration
      return BaseConfigSchema.parse(config);
    } catch (error) {
      GlobalErrorHandler.handleError(
        error as Error,
        { 
          type: 'unknown', 
          severity: 'critical', 
          source: 'ConfigManager.loadConfiguration',
          additionalDetails: 'Invalid configuration detected'
        }
      );
      
      // Fallback to minimal configuration
      return {
        environment: 'development',
        supabase: {
          url: 'https://fallback.supabase.co',
          anonKey: 'fallback-key'
        },
        performance: { 
          enableLogging: true, 
          thresholds: {
            databaseQuery: 500,
            componentRender: 100,
            apiCall: 1000
          }
        },
        errorHandling: { reportToMonitoring: true, logLevel: 'medium' }
      };
    }
  }

  /**
   * Determine current environment
   */
  private getEnvironment(): Environment {
    const env = process.env.NODE_ENV || 'development';
    return ['development', 'staging', 'production'].includes(env) 
      ? env as Environment 
      : 'development';
  }

  /**
   * Get required environment variable
   */
  private getRequiredEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }

  /**
   * Get optional environment variable with default
   */
  private getOptionalEnv(key: string, defaultValue: string): string {
    return process.env[key] || defaultValue;
  }

  /**
   * Load feature flags from environment variables
   */
  private loadFeatureFlags(): Record<string, boolean> {
    const featureFlags: Record<string, boolean> = {};
    
    // Prefix for feature flags
    const FEATURE_FLAG_PREFIX = 'FEATURE_';

    Object.keys(process.env)
      .filter(key => key.startsWith(FEATURE_FLAG_PREFIX))
      .forEach(key => {
        const flagName = key.replace(FEATURE_FLAG_PREFIX, '').toLowerCase();
        featureFlags[flagName] = process.env[key] === 'true';
      });

    return featureFlags;
  }

  /**
   * Get current configuration
   */
  public getConfig(): BaseConfig {
    return { ...this.config };
  }

  /**
   * Get specific configuration section
   */
  public get<K extends keyof BaseConfig>(section: K): BaseConfig[K] {
    return JSON.parse(JSON.stringify(this.config[section]));
  }

  /**
   * Check if a feature flag is enabled
   */
  public isFeatureEnabled(feature: string): boolean {
    return !!this.config.features?.[feature.toLowerCase()];
  }

  /**
   * Reload configuration
   */
  public reload(): void {
    this.config = this.loadConfiguration();
  }
}

// Export singleton instance
export default ConfigManager.getInstance();