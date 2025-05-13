import { moon, sidereal, globe, julian } from 'astronomia';

// Vimshottari Dasha planets order and lengths
const dashaOrder = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
const dashaLength = [7, 20, 6, 10, 7, 18, 16, 19, 17]; // in years

const nakshatraNames = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 
  'Pushya', 'Ashlesha', 'Magha', 'Purvaphalguni', 'Uttara Phalguni', 'Hasta', 
  'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purvashada', 
  'Uttara Ashada', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purvabhadrapada', 
  'Uttara Bhadrapada', 'Revati'
];

const zodiacSigns = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export interface AstrologicalData {
  moonSign: string;
  nakshatra: string;
  dasha: string;
  birthChart: {
    ascendant: string;
    moonPosition: number;
    sunPosition: number;
  };
}

export const calculateAstrologicalData = (birthDate: Date, latitude: number, longitude: number): AstrologicalData => {
  // Convert to Julian Day
  const jd = julian.DateToJD(birthDate);
  
  // Calculate Moon's position
  const moonLong = moon.position(jd).lon;
  const moonSignIndex = Math.floor(moonLong / 30);
  const moonSign = zodiacSigns[moonSignIndex];
  
  // Calculate Nakshatra
  const nakshatraIndex = Math.floor(moonLong * 27 / 360);
  const nakshatra = nakshatraNames[nakshatraIndex];
  
  // Calculate current Dasha
  const startingPlanetIndex = nakshatraIndex % 9;
  const startingPlanet = dashaOrder[startingPlanetIndex];
  const currentDashaLength = dashaLength[startingPlanetIndex];
  
  // Calculate time elapsed since birth
  const now = new Date();
  const yearsElapsed = (now.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  const remainingYears = currentDashaLength - (yearsElapsed % currentDashaLength);
  
  // Calculate birth chart
  const siderealTime = sidereal.apparent(jd);
  const ascendant = (siderealTime + longitude) % 360;
  const ascendantSign = zodiacSigns[Math.floor(ascendant / 30)];
  
  return {
    moonSign,
    nakshatra,
    dasha: `${startingPlanet} (${remainingYears.toFixed(2)} years remaining)`,
    birthChart: {
      ascendant: ascendantSign,
      moonPosition: moonLong,
      sunPosition: sidereal.apparent(jd)
    }
  };
};

export const calculateSunriseTime = (date: Date, latitude: number, longitude: number): Date => {
  const jd = julian.DateToJD(date);
  const siderealTime = sidereal.apparent(jd);
  
  // Calculate local hour angle of sunrise
  const latRad = latitude * Math.PI / 180;
  const decRad = moon.position(jd).dec;
  const H = Math.acos(-Math.tan(latRad) * Math.tan(decRad));
  
  // Convert to hours
  const hourAngle = H * 12 / Math.PI;
  
  // Calculate local mean time of sunrise
  const localMeanTime = 12 - hourAngle;
  
  // Adjust for longitude
  const timeZoneOffset = -longitude / 15;
  const universalTime = localMeanTime - timeZoneOffset;
  
  // Convert to Date object
  const sunriseDate = new Date(date);
  sunriseDate.setUTCHours(Math.floor(universalTime));
  sunriseDate.setUTCMinutes(Math.round((universalTime % 1) * 60));
  
  return sunriseDate;
};