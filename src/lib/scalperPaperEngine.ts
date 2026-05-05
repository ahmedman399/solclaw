import { ScalperPaperConfig } from './scalperPaperConfig';

interface TradeDecision {
  shouldEnter: boolean;
  confidence: number;
  reasoning: string;
  aiAnalysis: any;
}

// تحديث محرك السكالبر الأساسي ليصبح ذكياً
export class ScalperPaperEngine {
  private config: ScalperPaperConfig;
  private isActive = false;
  private currentPosition: any = null;
  private tradeHistory: any[] = [];
  
  // 🧠 إضافة الذكاء الاصطناعي للمحرك الموجود
  private aiPatterns: string[] = [];
  private aiConfidence = 0;
  private whaleActivity = { accumulation: 0, distribution: 0 };

  constructor(config: ScalperPaperConfig) {
    this.config = config;
  }

  // التحليل الذكي المدمج في النظام الأساسي
  tick(currentPrice: number, tape: any, bounceZones: any[] = [], candles: any[] = []) {
    if (!this.isActive) return;

    // 🚀 تحليل AI قبل أي قرار تداول
    const aiDecision = this.performAIAnalysis(currentPrice, tape, bounceZones, candles);
    
    // عرض التحليل الذكي
    this.displaySmartAnalysis(currentPrice, aiDecision);

    // القرار بناءً على AI + القواعد الأساسية
    if (!this.currentPosition && aiDecision.shouldEnter) {
      this.enterPosition(currentPrice, aiDecision);
    } else if (this.currentPosition) {
      this.checkExitConditions(currentPrice, tape, aiDecision);
    }
  }

  // 🧠 التحليل الذكي الجديد
  private performAIAnalysis(price: number, tape: any, bounceZones: any[], candles: any[]): TradeDecision {
    // تحليل خطوط الارتداد
    const supportAnalysis = this.analyzeBounceZones(price, bounceZones);
    
    // كشف الحيتان
    const whaleSignal = this.detectWhaleActivity(tape);
    
    // كشف الأنماط
    const patternStrength = this.detectCandlestickPatterns(candles);
    
    // الشبكة العصبية المبسطة
    const neuralScore = this.calculateNeuralScore(price, patternStrength, whaleSignal);
    
    // حساب الثقة الإجمالية
    this.aiConfidence = this.calculateAIConfidence(supportAnalysis, whaleSignal, patternStrength, neuralScore);
    
    // شروط الدخول الذكية
    const shouldEnterAI = this.aiConfidence > 0.75;
    const shouldEnterBasic = this.checkBasicEntryConditions(price, tape);
    
    return {
      shouldEnter: shouldEnterAI && shouldEnterBasic,
      confidence: this.aiConfidence,
      reasoning: this.generateReasoning(),
      aiAnalysis: {
        patterns: [...this.aiPatterns],
        whaleActivity: {...this.whaleActivity},
        supportStrength: supportAnalysis.strength,
        neuralScore
      }
    };
  }

  // تحليل خطوط الارتداد
  private analyzeBounceZones(price: number, zones: any[]) {
    const nearestSupport = zones
      .filter(z => z.price < price * 0.98) // تحت السعر الحالي
      .sort((a, b) => Math.abs(price - a.price) - Math.abs(price - b.price))[0];
    
    let strength = 0.4; // قوة افتراضية
    if (nearestSupport) {
      const touchCount = nearestSupport.touchCount || 0;
      const distance = Math.abs(price - nearestSupport.price) / price;
      
      if (touchCount > 15) strength = 0.9;
      else if (touchCount > 10) strength = 0.7;
      else if (touchCount > 5) strength = 0.6;
      
      // إذا كان قريب من الدعم، قوة أعلى
      if (distance < 0.02) strength *= 1.2;
    }
    
    return { nearestSupport, strength: Math.min(strength, 1) };
  }

  // كشف نشاط الحيتان
  private detectWhaleActivity(tape: any) {
    const totalSol = tape?.totalSol || 0;
    const buys = tape?.buys || 0;
    const sells = tape?.sells || 0;
    
    this.aiPatterns = this.aiPatterns.filter(p => !p.includes('WHALE'));
    
    let whaleSignal = 0;
    if (totalSol > 0.5) { // حجم كبير
      if (buys > sells * 1.3) {
        this.aiPatterns.push('WHALE_ACCUMULATION');
        this.whaleActivity.accumulation++;
        whaleSignal = 0.8;
      } else if (sells > buys * 1.3) {
        this.aiPatterns.push('WHALE_DISTRIBUTION');
        this.whaleActivity.distribution++;
        whaleSignal = -0.6;
      }
    }
    
    return whaleSignal;
  }

  // كشف أنماط الشموع
  private detectCandlestickPatterns(candles: any[]) {
    if (candles.length < 2) return 0.5;
    
    const last = candles[candles.length - 1];
    const prev = candles[candles.length - 2];
    
    this.aiPatterns = this.aiPatterns.filter(p => !p.includes('CANDLE'));
    
    let patternStrength = 0.5;
    
    // مطرقة صاعدة
    if (this.isHammerPattern(last)) {
      this.aiPatterns.push('HAMMER_BULLISH');
      patternStrength = 0.8;
    }
    
    // ابتلاع صاعد
    if (this.isBullishEngulfing(last, prev)) {
      this.aiPatterns.push('ENGULFING_BULLISH');
      patternStrength = 0.85;
    }
    
    // دوجي
    if (this.isDojiPattern(last)) {
      this.aiPatterns.push('DOJI_INDECISION');
      patternStrength = 0.3;
    }
    
    return patternStrength;
  }

  // الشبكة العصبية المبسطة
  private calculateNeuralScore(price: number, pattern: number, whale: number) {
    // محاكاة شبكة عصبية بسيطة
    const inputs = [
      price / 15000, // تطبيع السعر
      pattern,
      Math.max(0, whale), // الحيتان الإيجابية فقط
      this.aiPatterns.length / 3, // كثافة الأنماط
      Math.random() * 0.1 // عنصر عشوائي للتنويع
    ];
    
    const weights = [0.2, 0.3, 0.3, 0.15, 0.05];
    return inputs.reduce((sum, input, i) => sum + input * weights[i], 0);
  }

  // حساب الثقة الكلية
  private calculateAIConfidence(support: any, whale: number, pattern: number, neural: number) {
    let confidence = 0;
    
    confidence += support.strength * 0.3; // وزن الدعم 30%
    confidence += Math.max(0, whale) * 0.25; // وزن الحيتان 25%
    confidence += pattern * 0.25; // وزن الأنماط 25%
    confidence += neural * 0.2; // وزن النيورال 20%
    
    return Math.max(0, Math.min(1, confidence));
  }

  // الشروط الأساسية للدخول (من النظام القديم)
  private checkBasicEntryConditions(price: number, tape: any): boolean {
    // منطق الدخول الأساسي الموجود
    const dipCondition = true; // تبسيط للمثال
    const volumeCondition = (tape?.totalSol || 0) >= this.config.catalystMinSol;
    
    return dipCondition && volumeCondition;
  }

  // عرض التحليل الذكي
  private displaySmartAnalysis(price: number, decision: TradeDecision) {
    const priceK = (price / 1000).toFixed(2);
    const confidence = (decision.confidence * 100).toFixed(1);
    
    console.log('\n🤖 ═══════ SMART SCALPER ANALYSIS ═══════');
    console.log(`📊 Price: $${priceK}K | AI Confidence: ${confidence}%`);
    console.log(`🔍 Patterns: ${this.aiPatterns.join(', ') || 'None'}`);
    console.log(`🐋 Whales: Acc:${this.whaleActivity.accumulation} | Dist:${this.whaleActivity.distribution}`);
    console.log(`⚡ Decision: ${decision.shouldEnter ? '🟢 ENTER' : '🔴 WAIT'}`);
    console.log(`💭 Reasoning: ${decision.reasoning}`);
    console.log('════════════════════════════════════════\n');
  }

  // دخول مركز ذكي
  private enterPosition(price: number, decision: TradeDecision) {
    const size = this.calculateSmartPositionSize(decision.confidence);
    
    this.currentPosition = {
      entryPrice: price,
      size: size,
      timestamp: Date.now(),
      aiConfidence: decision.confidence,
      entryReason: decision.reasoning
    };
    
    console.log(`🚀 ENTERED POSITION: ${size} SOL @ $${(price/1000).toFixed(2)}K (AI: ${(decision.confidence*100).toFixed(1)}%)`);
  }

  // حساب حجم المركز الذكي
  private calculateSmartPositionSize(confidence: number): number {
    const baseSize = this.config.catalystMinSol;
    const confidenceMultiplier = 0.5 + (confidence * 0.5); // من 0.5 إلى 1.0
    return Math.min(baseSize * confidenceMultiplier, 0.08); // حد أقصى 0.08
  }

  // توليد التبرير
  private generateReasoning(): string {
    const reasons = [];
    
    if (this.aiPatterns.includes('WHALE_ACCUMULATION')) reasons.push('whale buying');
    if (this.aiPatterns.includes('HAMMER_BULLISH')) reasons.push('hammer pattern');
    if (this.aiPatterns.includes('ENGULFING_BULLISH')) reasons.push('bullish engulfing');
    if (this.aiConfidence > 0.8) reasons.push('high AI confidence');
    
    return reasons.length > 0 ? reasons.join(' + ') : 'mixed signals';
  }

  // مساعدات للأنماط
  private isHammerPattern(candle: any): boolean {
    const body = Math.abs(candle.close - candle.open);
    const lowerShadow = candle.open - candle.low;
    const upperShadow = candle.high - candle.close;
    
    return lowerShadow > body * 2 && upperShadow < body * 0.5 && candle.close > candle.open;
  }

  private isBullishEngulfing(current: any, previous: any): boolean {
    return current.close > current.open && // شمعة خضراء
           previous.close < previous.open && // شمعة حمراء سابقة
           current.open < previous.close && // فتح تحت إغلاق السابقة
           current.close > previous.open; // إغلاق فوق فتح السابقة
  }

  private isDojiPattern(candle: any): boolean {
    const body = Math.abs(candle.close - candle.open);
    const range = candle.high - candle.low;
    return range > 0 && (body / range) < 0.1; // الجسم أقل من 10% من النطاق
  }

  // باقي الدوال الأساسية...
  private checkExitConditions(price: number, tape: any, aiDecision: TradeDecision) {
    if (!this.currentPosition) return;
    
    const pnlPct = ((price - this.currentPosition.entryPrice) / this.currentPosition.entryPrice) * 100;
    
    // أهداف ذكية حسب الثقة
    const smartTakeProfit = this.config.takeProfitPct * (0.8 + aiDecision.confidence * 0.4);
    
    if (pnlPct >= smartTakeProfit) {
      this.closePosition(price, 'SMART_TAKE_PROFIT', pnlPct);
    } else if (pnlPct <= -5) { // stop loss ثابت
      this.closePosition(price, 'STOP_LOSS', pnlPct);
    }
  }

  private closePosition(price: number, reason: string, pnlPct: number) {
    console.log(`✅ CLOSED POSITION: ${reason} | PnL: ${pnlPct.toFixed(2)}% @ $${(price/1000).toFixed(2)}K`);
    this.currentPosition = null;
  }

  start() { this.isActive = true; console.log('🧠 SMART SCALPER STARTED'); }
  stop() { this.isActive = false; console.log('⏹️ SMART SCALPER STOPPED'); }
  isRunning() { return this.isActive; }
}
