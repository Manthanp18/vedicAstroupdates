// Types for parsed prediction data
export interface PanchangDetails {
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  rahuKaal: string;
  abhijitMuhurat: string;
}

export interface ChoghadiyaPeriod {
  time: string;
  name: string;
  nature: 'Favorable' | 'Unfavorable' | 'Mixed';
}

export interface TradingWindow {
  asset: string;
  bestTime: string;
  worstTime: string;
}

export interface DailyTip {
  color: string;
  direction: string;
  mantra: string;
  remedy: string;
}

export interface ParsedPrediction {
  panchang: PanchangDetails;
  choghadiya: ChoghadiyaPeriod[];
  moonTransit: string;
  trading: TradingWindow[];
  tips: DailyTip;
  spiritual: string;
}

export const parsePrediction = (predictionText: string): ParsedPrediction => {
  try {
    // Split the text into sections
    const sections = predictionText.split('\n\n');
    
    // Parse Panchang details
    const panchangSection = sections.find(s => s.includes('Panchang'))?.split('\n');
    const panchang: PanchangDetails = {
      tithi: extractValue(panchangSection, 'Tithi'),
      nakshatra: extractValue(panchangSection, 'Nakshatra'),
      yoga: extractValue(panchangSection, 'Yoga'),
      karana: extractValue(panchangSection, 'Karana'),
      rahuKaal: extractValue(panchangSection, 'Rahu Kaal'),
      abhijitMuhurat: extractValue(panchangSection, 'Abhijit'),
    };

    // Parse Choghadiya periods
    const choghadiyaSection = sections.find(s => s.includes('Choghadiya'))?.split('\n');
    const choghadiya: ChoghadiyaPeriod[] = choghadiyaSection
      ?.filter(line => line.includes('-') && !line.includes('Choghadiya'))
      .map(line => {
        const [time, rest] = line.split('-').map(s => s.trim());
        const [name, natureStr] = rest.split('(').map(s => s.trim());
        const nature = natureStr?.replace(')', '') as 'Favorable' | 'Unfavorable' | 'Mixed';
        return { time, name, nature };
      }) || [];

    // Parse Trading Windows
    const tradingSection = sections.find(s => s.includes('Trading'))?.split('\n');
    const trading: TradingWindow[] = [
      {
        asset: 'Gold',
        bestTime: extractValue(tradingSection, 'Gold.*Best'),
        worstTime: extractValue(tradingSection, 'Gold.*Avoid|Gold.*Worst'),
      },
      {
        asset: 'Crypto',
        bestTime: extractValue(tradingSection, 'Crypto.*Best'),
        worstTime: extractValue(tradingSection, 'Crypto.*Avoid|Crypto.*Worst'),
      },
    ];

    // Parse Daily Tips
    const tipsSection = sections.find(s => s.includes('Daily Tips'))?.split('\n');
    const tips: DailyTip = {
      color: extractValue(tipsSection, 'Color'),
      direction: extractValue(tipsSection, 'Direction|Lucky Direction'),
      mantra: extractValue(tipsSection, 'Mantra'),
      remedy: extractValue(tipsSection, 'Remedy|Simple Remedy'),
    };

    // Extract Moon Transit and Spiritual sections
    const moonTransit = sections.find(s => s.includes('Moon Transit'))?.split('\n').slice(1).join('\n') || '';
    const spiritual = sections.find(s => s.includes('Spiritual'))?.split('\n').slice(1).join('\n') || '';

    return {
      panchang,
      choghadiya,
      moonTransit,
      trading,
      tips,
      spiritual,
    };
  } catch (error) {
    console.error('Error parsing prediction:', error);
    throw new Error('Failed to parse prediction data');
  }
};

// Helper function to extract values from text
const extractValue = (lines: string[] = [], key: string): string => {
  const line = lines?.find(l => new RegExp(key, 'i').test(l));
  if (!line) return '';
  
  const parts = line.split(/:|:/);
  return parts[1]?.trim() || '';
};