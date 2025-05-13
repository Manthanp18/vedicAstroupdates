import SunCalc from 'suncalc';

export interface Choghadiya {
  name: string;
  nature: 'Favorable' | 'Unfavorable' | 'Mixed';
  startTime: Date;
  endTime: Date;
}

const CHOGHADIYA_PERIODS = [
  { name: 'Udveg', nature: 'Unfavorable' },
  { name: 'Chal', nature: 'Mixed' },
  { name: 'Labh', nature: 'Favorable' },
  { name: 'Amrit', nature: 'Favorable' },
  { name: 'Kaal', nature: 'Unfavorable' },
  { name: 'Shubh', nature: 'Favorable' },
  { name: 'Rog', nature: 'Unfavorable' },
  { name: 'Udveg', nature: 'Unfavorable' },
] as const;

export const calculateChoghadiya = (latitude: number, longitude: number, date = new Date()): Choghadiya[] => {
  // Get sunrise and sunset times
  const times = SunCalc.getTimes(date, latitude, longitude);
  const sunrise = times.sunrise;
  const sunset = times.sunset;
  
  // Calculate duration of day and night
  const dayDuration = (sunset.getTime() - sunrise.getTime()) / 8; // 8 parts for day
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  const nextSunrise = SunCalc.getTimes(nextDay, latitude, longitude).sunrise;
  const nightDuration = (nextSunrise.getTime() - sunset.getTime()) / 8; // 8 parts for night
  
  const choghadiyas: Choghadiya[] = [];
  
  // Day Choghadiyas
  for (let i = 0; i < 8; i++) {
    const startTime = new Date(sunrise.getTime() + (dayDuration * i));
    const endTime = new Date(sunrise.getTime() + (dayDuration * (i + 1)));
    const periodIndex = i % CHOGHADIYA_PERIODS.length;
    
    choghadiyas.push({
      name: CHOGHADIYA_PERIODS[periodIndex].name,
      nature: CHOGHADIYA_PERIODS[periodIndex].nature,
      startTime,
      endTime,
    });
  }
  
  // Night Choghadiyas
  for (let i = 0; i < 8; i++) {
    const startTime = new Date(sunset.getTime() + (nightDuration * i));
    const endTime = new Date(sunset.getTime() + (nightDuration * (i + 1)));
    const periodIndex = (i + 4) % CHOGHADIYA_PERIODS.length; // Night starts with different period
    
    choghadiyas.push({
      name: CHOGHADIYA_PERIODS[periodIndex].name,
      nature: CHOGHADIYA_PERIODS[periodIndex].nature,
      startTime,
      endTime,
    });
  }
  
  return choghadiyas;
};

export const getCurrentChoghadiya = (choghadiyas: Choghadiya[]): Choghadiya | null => {
  const now = new Date();
  return choghadiyas.find(period => 
    now >= period.startTime && now < period.endTime
  ) || null;
};