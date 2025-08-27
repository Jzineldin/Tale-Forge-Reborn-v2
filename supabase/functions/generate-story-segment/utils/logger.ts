export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export class Logger {
  private readonly context: string;
  private readonly level: LogLevel;
  
  constructor(context: string, level: LogLevel = LogLevel.INFO) {
    this.context = context;
    this.level = this.getLogLevelFromEnv() || level;
  }
  
  private getLogLevelFromEnv(): LogLevel | undefined {
    const envLevel = Deno.env.get('LOG_LEVEL');
    if (envLevel) {
      return LogLevel[envLevel as keyof typeof LogLevel];
    }
    return undefined;
  }
  
  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const baseMessage = `[${timestamp}] [${level}] [${this.context}] ${message}`;
    
    if (data) {
      return `${baseMessage} ${JSON.stringify(data)}`;
    }
    
    return baseMessage;
  }
  
  debug(message: string, data?: any): void {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(this.formatMessage('DEBUG', message, data));
    }
  }
  
  info(message: string, data?: any): void {
    if (this.level <= LogLevel.INFO) {
      console.log(this.formatMessage('INFO', message, data));
    }
  }
  
  warn(message: string, data?: any): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(this.formatMessage('WARN', message, data));
    }
  }
  
  error(message: string, data?: any): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(this.formatMessage('ERROR', message, data));
    }
  }
  
  // Performance logging
  time(label: string): void {
    console.time(`[${this.context}] ${label}`);
  }
  
  timeEnd(label: string): void {
    console.timeEnd(`[${this.context}] ${label}`);
  }
  
  // Structured logging for metrics
  metric(name: string, value: number, unit: string = 'ms', tags?: Record<string, string>): void {
    this.info('METRIC', {
      name,
      value,
      unit,
      tags: {
        context: this.context,
        ...tags
      }
    });
  }
}