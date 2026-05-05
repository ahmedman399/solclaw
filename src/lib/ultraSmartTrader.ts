import { ScalperPaperConfig } from './scalperPaperConfig';

interface UltraSmartConfig extends ScalperPaperConfig {
  aiConfidenceThreshold: number;
  whaleDetectionEnabled: boolean;
  neuralLearningEnabled: boolean;
}

export class UltraSmartTrader {
  private confidence = 0;
  private patterns: string[] = [];
  private whaleActivity = { accumulation: 0, distribution: 0 };
  
  // 🧠 التحليل الذكي الفوري
  analyzeMarket(currentPrice: number, tape: any, bounceZones: any[], candles: any[]) {
    console.log('🚀 ULTRA SMART AI STARTING ANALYSIS...');
    
    // تحليل خطوط الدعم والمقاومة
    const supportAnalysis = this.analyzeBounceZones(currentPrice, bounceZones);
    
    // كشف الحيتان
    const whaleDetection = this.detectWhales(tape);
    
    // تحليل الأنماط
    const patternSignals = this.detectPatterns(candles);
    
    // الشبكة العصبية
    const neuralSignal = this.neuralPredict(currentPrice, patternSignals);
    
    // حساب الثقة الإجمالية
    this.confidence = this.calculateTotalConfidence(
      supportAnalysis, 
      whaleDetection, 
      patternSignals, 
      neuralSignal
    );
    
    const analysis = {
      timestamp: new Date().toISOString(),
      price: `$${(currentPrice/1000).toFixed(2)}K`,
      confidence: `${(this.confidence * 100).toFixed(1)}%`,
      patterns: this.patterns,
      whaleActivity: whaleDetection,
      supportLevel: supportAnalysis.nearestSupport,
      neuralSignal: neuralSignal,
      decision: this.makeDecision()
    };
    
    // عرض التحليل الذكي
    this.displayAnalysis(analysis);
    
    return analysis;
  }
  
  // تحليل خطوط الارتداد
  private analyzeBounceZones(price: number, zones: any[]) {
    const nearestSupport = zones
      .filter(z => z.price < price)
      .sort((a, b) => Math.abs(price - a.price) - Math.abs(price - b.price))[0];
    
    const distanceToSupport = nearestSupport ? 
      ((price - nearestSupport.price) / nearestSupport.price * 100) : 0;
    
    let supportStrength = 0;
    if (nearestSupport?.touchCount > 15) supportStrength = 0.9;
    else if (nearestSupport?.touchCount > 10) supportStrength = 0.7;
    else supportStrength = 0.4;
    
    return { nearestSupport, distanceToSupport, strength: supportStrength };
  }
  
  // كشف تلاعب الحيتان
  private detectWhales(tape: any) {
    const largeBuys = tape?.buys || 0;
    const largeSells = tape?.sells || 0;
    const totalSol = tape?.totalSol || 0;
    
    let whaleSignal = 0;
    this.patterns = this.patterns.filter(p => !p.includes('WHALE'));
    
    if (totalSol > 0.5) {
      if (largeBuys > largeSells * 1.5) {
        this.patterns.push('WHALE_ACCUMULATION');
        whaleSignal = 0.8;
        this.whaleActivity.accumulation++;
      } else if (largeSells > largeBuys * 1.5) {
        this.patterns.push('WHALE_DISTRIBUTION');  
        whaleSignal = -0.6;
        this.whaleActivity.distribution++;
      }
    }
    
    return { signal: whaleSignal, volume: totalSol };
  }
  
  // كشف الأنماط
  private detectPatterns(candles: any[]) {
    if (candles.length < 3) return 0.5;
    
    const last = candles[candles.length - 1];
    const prev = candles[candles.length - 2];
    
    let patternStrength = 0.5;
    this.patterns = this.patterns.filter(p => !p.includes('CANDLE'));
    
    // مطرقة صاعدة
    const bodySize = Math.abs(last.close - last.open);
    const lowerShadow = last.open - last.low;
    const upperShadow = last.high - last.close;
    
    if (lowerShadow > bodySize * 2 && upperShadow < bodySize * 0.5 && last.close > last.open) {
      this.patterns.push('HAMMER_BULLISH');
      patternStrength = 0.8;
    }
    
    // ابتلاع صاعد
    if (last.close > last.open && prev.close < prev.open &&
        last.open < prev.close && last.close > prev.open) {
      this.patterns.push('ENGULFING_BULLISH');
      patternStrength = 0.85;
    }
    
    // دوجي (تردد)
    if (bodySize / (last.high - last.low) < 0.1) {
      this.patterns.push('DOJI_INDECISION');
      patternStrength = 0.4;
    }
    
    return patternStrength;
  }
  
  // الشبكة العصبية المبسطة
  private neuralPredict(price: number, patternSignal: number) {
    // محاكاة شبكة عصبية مبسطة
    const priceVelocity = this.calculatePriceVelocity();
    const volumeMomentum = this.calculateVolumeMomentum();
    
    const input = [
      price / 10000, // تطبيع السعر
      patternSignal,
      priceVelocity,
      volumeMomentum,
      this.patterns.length / 5 // كثافة الأنماط
    ];
    
    // طبقة واحدة مبسطة
    const weights = [0.3, 0.4, 0.2, 0.1, 0.15];
    const neuralOutput = input.reduce((sum, val, i) => sum + val * weights[i], 0);
    
    return Math.max(0, Math.min(1, neuralOutput));
  }
  
  // حساب الثقة الإجمالية
  private calculateTotalConfidence(support: any, whale: any, pattern: number, neural: number) {
    let confidence = 0;
    
    // وزن تحليل الدعم (30%)
    confidence += support.strength * 0.3;
    
    // وزن تحليل الحيتان (25%)
    confidence += Math.max(0, whale.signal) * 0.25;
    
    // وزن الأنماط (25%)  
    confidence += pattern * 0.25;
    
    // وزن الشبكة العصبية (20%)
    confidence += neural * 0.2;
    
    return Math.max(0, Math.min(1, confidence));
  }
  
  // قرار التداول
  private makeDecision() {
    if (this.confidence > 0.85) {
      return {
        action: 'STRONG_BUY',
        size: 0.075, // 75% من الرأسمال
        reasoning: 'High AI confidence with strong bullish signals'
      };
    } else if (this.confidence > 0.7) {
      return {
        action: 'BUY', 
        size: 0.06,
        reasoning: 'Moderate confidence, reduced position size'
      };
    } else if (this.confidence < 0.3) {
      return {
        action: 'AVOID',
        size: 0,
        reasoning: 'Low confidence, bearish signals detected'
      };
    } else {
      return {
        action: 'WATCH',
        size: 0,
        reasoning: 'Waiting for clearer signals'
      };
    }
  }
  
  // عرض التحليل
  private displayAnalysis(analysis: any) {
    console.log('\n🤖 ═══════ ULTRA SMART AI ANALYSIS ═══════');
    console.log(`📊 Price: ${analysis.price} | Confidence: ${analysis.confidence}`);
    console.log(`🔍 Patterns: ${analysis.patterns.join(', ') || 'None detected'}`);
    console.log(`🐋 Whale Activity: ${JSON.stringify(analysis.whaleActivity)}`);
    console.log(`📈 Neural Signal: ${(analysis.neuralSignal * 100).toFixed(1)}%`);
    console.log(`⚡ Decision: ${analysis.decision.action} - ${analysis.decision.reasoning}`);
    if (analysis.decision.size > 0) {
      console.log(`💰 Position Size: ${analysis.decision.size} SOL`);
    }
    console.log('═══════════════════════════════════════\n');
  }
  
  // مساعدات
  private calculatePriceVelocity(): number {
    // محاكاة حساب سرعة السعر
    return Math.random() * 0.1 - 0.05;
  }
  
  private calculateVolumeMomentum(): number {
    // محاكاة حساب زخم الحجم  
    return Math.random() * 0.2;
  }
}

// تصدير البوت
export const ultraSmartTrader = new UltraSmartTrader();

// دمج مع نظام السكالبر الموجود
export function createUltraSmartConfig(): UltraSmartConfig {
  return {
    ...ScalperPaperConfig,
    catalystMinSol: 0.08,
    dipMinPct: 1,
    takeProfitPct: 15,
    minOrderBookSellSolForStop: 0.1,
    realSlippagePct: 1,
    reentryCooldownMs: 15000,
    aiConfidenceThreshold: 0.75,
    whaleDetectionEnabled: true,
    neuralLearningEnabled: true
  };
}
