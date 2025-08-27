export interface Metric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

export interface PhaseMetrics {
  phase: string;
  duration: number;
  startTime: number;
  endTime: number;
}

export class MetricsCollector {
  private metrics: Metric[] = [];
  private phases: Map<string, PhaseMetrics> = new Map();
  private currentPhase?: string;
  private phaseStartTime?: number;
  
  constructor(private readonly requestId: string) {}
  
  recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
      tags: {
        requestId: this.requestId,
        ...tags
      }
    });
  }
  
  startPhase(phaseName: string): void {
    if (this.currentPhase) {
      this.endPhase();
    }
    this.currentPhase = phaseName;
    this.phaseStartTime = Date.now();
  }
  
  endPhase(): void {
    if (this.currentPhase && this.phaseStartTime) {
      const endTime = Date.now();
      this.phases.set(this.currentPhase, {
        phase: this.currentPhase,
        duration: endTime - this.phaseStartTime,
        startTime: this.phaseStartTime,
        endTime
      });
      this.currentPhase = undefined;
      this.phaseStartTime = undefined;
    }
  }
  
  recordPhase(phaseName: string, totalTime: number): void {
    const endTime = Date.now();
    const duration = this.phases.has(phaseName) 
      ? Date.now() - this.phases.get(phaseName)!.startTime 
      : totalTime;
      
    this.phases.set(phaseName, {
      phase: phaseName,
      duration,
      startTime: endTime - duration,
      endTime
    });
  }
  
  getCurrentPhase(): string | undefined {
    return this.currentPhase;
  }
  
  getMetrics(): {
    requestId: string;
    metrics: Metric[];
    phases: PhaseMetrics[];
    totalDuration: number;
  } {
    const phases = Array.from(this.phases.values());
    const totalDuration = phases.reduce((sum, phase) => sum + phase.duration, 0);
    
    return {
      requestId: this.requestId,
      metrics: this.metrics,
      phases,
      totalDuration
    };
  }
  
  // Helper methods for common metrics
  recordApiCall(provider: string, success: boolean, duration: number): void {
    this.recordMetric('api_call', duration, {
      provider,
      success: success.toString()
    });
  }
  
  recordCacheHit(cacheType: string, hit: boolean): void {
    this.recordMetric('cache_access', hit ? 1 : 0, {
      cacheType,
      hit: hit.toString()
    });
  }
  
  recordError(errorType: string, errorCode: string): void {
    this.recordMetric('error', 1, {
      errorType,
      errorCode
    });
  }
}