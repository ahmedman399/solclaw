import { ScalperPaperConfig } from './scalperPaperConfig';

interface SmartSignalConfig extends ScalperPaperConfig {
  // إضافات ذكية
  supportResistanceWeight: number; // وزن خطوط الدعم/المقاومة
  volumeSpikeTrigger: number; // حساسية للحجم
  volatilityAdaptive: boolean; // تكييف حسب التذبذب
  trendMomentumWeight: number; // وزن الاتجاه
}

export class SmartSignalScalper {
  private config: SmartSignalConfig;
  private priceHistory: number[] = [];
  private volumeHistory: number[] = [];
  private supportLevels: number[] = [];
  private resistanceLevels: number[] = [];

  constructor(config: SmartSignalConfig) {
    this.config = config;
  }

  // تحليل شخصية العملة
  analyzeCoinPersonality(recentCandles: any[], bounceZones: any[]) {
    const personality = {
      volatility: this.calculateVolatility(recentCandles),
      supportStrength: this.analyzeBounceStrength(bounceZones),
      trendDirection: this.detectTrend(recentCandles),
      volumePattern: this.analyzeVolumePattern(recentCandles)
    };

    return personality;
  }

  // قرار الدخول الذكي
  shouldEnter(currentPrice: number, tape: any, bounceZones: any[], candles: any[]) {
    const personality = this.analyzeCoinPersonality(candles, bounceZones);
    const signals = this.generateSignals(currentPrice, tape, bounceZones, personality);
    
    // تسجيل القرار
    console.log('🧠 Smart Signal Analysis:', {
      price: currentPrice,
      signals,
      personality,
      decision: signals.confidence > 0.7
    });

    return {
      shouldEnter: signals.confidence > 0.7,
      suggestedSize: this.calculatePositionSize(signals.confidence, personality.volatility),
      stopLoss: this.calculateDynamicStopLoss(currentPrice, bounceZones, personality),
      takeProfit: this.calculateDynamicTakeProfit(signals.confidence, personality.volatility)
    };
  }

  // توليد الإشارات المدمجة
  private generateSignals(price: number, tape: any, bounceZones: any[], personality: any) {
    const signals = {
      supportBreakout: 0,
      volumeSpike: 0,
      trendContinuation: 0,
      bounceConfirmation: 0,
      confidence: 0
    };

    // 1. تحليل كسر/ارتداد الدعم
    const nearestSupport = this.findNearestSupport(price, bounceZones);
    if (nearestSupport) {
      const distance = Math.abs(price - nearestSupport.price) / nearestSupport.price;
      if (distance < 0.02) { // قريب من الدعم
        signals.supportBreakout = price > nearestSupport.price ? 0.8 : -0.3;
        signals.bounceConfirmation = nearestSupport.touchCount > 10 ? 0.6 : 0.3;
      }
    }

    // 2. تحليل الحجم
    const recentVolume = tape?.totalSol || 0;
    const avgVolume = this.getAverageVolume();
    if (recentVolume > avgVolume * 1.5) {
      signals.volumeSpike = 0.7;
    }

    // 3. استمرار الاتجاه
    if (personality.trendDirection === 'up') {
      signals.trendContinuation = 0.5;
    }

    // حساب الثقة الإجمالية
    signals.confidence = (
      signals.supportBreakout * 0.3 +
      signals.volumeSpike * 0.25 +
      signals.trendContinuation * 0.25 +
      signals.bounceConfirmation * 0.2
    );

    return signals;
  }

  // حساب حجم المركز الديناميكي
  private calculatePositionSize(confidence: number, volatility: number): number {
    const baseSize = this.config.catalystMinSol;
    const confidenceMultiplier = Math.min(confidence * 1.5, 1.2);
    const volatilityAdjustment = volatility > 0.1 ? 0.8 : 1.0;
    
    return baseSize * confidenceMultiplier * volatilityAdjustment;
  }

  // Stop loss ديناميكي حسب خطوط الدعم
  private calculateDynamicStopLoss(price: number, bounceZones: any[], personality: any): number {
    const nearestSupport = this.findNearestSupport(price, bounceZones);
    if (nearestSupport && nearestSupport.touchCount > 5) {
      // استخدم الدعم القوي كـ stop loss
      return Math.max(nearestSupport.price * 0.98, price * 0.92);
    }
    
    // stop loss عادي حسب التذبذب
    const stopPercent = personality.volatility > 0.1 ? 0.08 : 0.05;
    return price * (1 - stopPercent);
  }

  // Take profit ديناميكي
  private calculateDynamicTakeProfit(confidence: number, volatility: number): number {
    const baseTakeProfit = this.config.takeProfitPct / 100;
    const confidenceBonus = confidence > 0.8 ? 0.05 : 0;
    const volatilityAdjustment = volatility > 0.1 ? 0.03 : -0.02;
    
    return Math.min((baseTakeProfit + confidenceBonus + volatilityAdjustment) * 100, 25);
  }

  // مساعدات التحليل
  private calculateVolatility(candles: any[]): number {
    if (candles.length < 10) return 0.05;
    
    const returns = candles.slice(-10).map((candle, i, arr) => {
      if (i === 0) return 0;
      return (candle.close - arr[i-1].close) / arr[i-1].close;
    });
    
    const variance = returns.reduce((sum, ret) => sum + ret * ret, 0) / returns.length;
    return Math.sqrt(variance);
  }

  private analyzeBounceStrength(bounceZones: any[]): number {
    const totalTouches = bounceZones.reduce((sum, zone) => sum + (zone.touchCount || 0), 0);
    return Math.min(totalTouches / 50, 1); // تطبيع من 0 إلى 1
  }

  private detectTrend(candles: any[]): 'up' | 'down' | 'sideways' {
    if (candles.length < 5) return 'sideways';
    
    const recent = candles.slice(-5);
    const first = recent[0].close;
    const last = recent[recent.length - 1].close;
    const change = (last - first) / first;
    
    if (change > 0.03) return 'up';
    if (change < -0.03) return 'down';
    return 'sideways';
  }

  private analyzeVolumePattern(candles: any[]): 'increasing' | 'decreasing' | 'stable' {
    // تحليل نمط الحجم - يحتاج بيانات الحجم من الشموع
    return 'stable';
  }

  private findNearestSupport(price: number, bounceZones: any[]) {
    return bounceZones
      .filter(zone => zone.price < price) // الدعوم تحت السعر الحالي
      .sort((a, b) => Math.abs(price - a.price) - Math.abs(price - b.price))[0];
  }

  private getAverageVolume(): number {
    if (this.volumeHistory.length === 0) return 1;
    return this.volumeHistory.reduce((sum, vol) => sum + vol, 0) / this.volumeHistory.length;
  }
}

// إعدادات افتراضية للبوت الذكي
export const SMART_SIGNAL_CONFIG: SmartSignalConfig = {
  ...ScalperPaperConfig, // الإعدادات الأساسية
  supportResistanceWeight: 0.3,
  volumeSpikeTrigger: 1.5,
  volatilityAdaptive: true,
  trendMomentumWeight: 0.25
};
