import { supabaseAdmin } from './db';

export interface PerformanceMetric {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  userId?: string;
  timestamp: Date;
}

export class PerformanceMonitor {
  private static metrics: PerformanceMetric[] = [];

  static startTimer(): number {
    return Date.now();
  }

  static async recordMetric(
    startTime: number,
    endpoint: string,
    method: string,
    status: number,
    userId?: string
  ): Promise<void> {
    const duration = Date.now() - startTime;
    
    const metric: PerformanceMetric = {
      endpoint,
      method,
      duration,
      status,
      userId,
      timestamp: new Date()
    };

    this.metrics.push(metric);

    // Log slow requests (>2 seconds)
    if (duration > 2000) {
      console.warn(`Slow request: ${method} ${endpoint} took ${duration}ms`);
    }

    // Store in database every 10 metrics
    if (this.metrics.length >= 10) {
      await this.flushMetrics();
    }
  }

  private static async flushMetrics(): Promise<void> {
    if (this.metrics.length === 0) return;

    try {
      const metricsToStore = [...this.metrics];
      this.metrics = [];

      await supabaseAdmin.from('performance_metrics').insert(
        metricsToStore.map(m => ({
          endpoint: m.endpoint,
          method: m.method,
          duration_ms: m.duration,
          status_code: m.status,
          user_id: m.userId,
          created_at: m.timestamp.toISOString()
        }))
      );
    } catch (error) {
      console.error('Failed to store metrics:', error);
    }
  }

  static async getMetrics(hours: number = 24): Promise<any> {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      const { data, error } = await supabaseAdmin
        .from('performance_metrics')
        .select('*')
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const metrics = data || [];
      
      return {
        totalRequests: metrics.length,
        averageResponseTime: metrics.reduce((sum, m) => sum + m.duration_ms, 0) / metrics.length || 0,
        slowRequests: metrics.filter(m => m.duration_ms > 2000).length,
        errorRate: metrics.filter(m => m.status_code >= 400).length / metrics.length || 0,
        endpointStats: this.groupByEndpoint(metrics)
      };
    } catch (error) {
      console.error('Failed to get metrics:', error);
      return null;
    }
  }

  private static groupByEndpoint(metrics: any[]): any {
    const grouped: any = {};
    
    metrics.forEach(m => {
      if (!grouped[m.endpoint]) {
        grouped[m.endpoint] = {
          count: 0,
          totalDuration: 0,
          errors: 0
        };
      }
      
      grouped[m.endpoint].count++;
      grouped[m.endpoint].totalDuration += m.duration_ms;
      if (m.status_code >= 400) grouped[m.endpoint].errors++;
    });

    Object.keys(grouped).forEach(endpoint => {
      grouped[endpoint].avgDuration = grouped[endpoint].totalDuration / grouped[endpoint].count;
    });

    return grouped;
  }
}
