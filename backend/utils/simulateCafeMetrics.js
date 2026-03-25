const crypto = require('crypto');
const calculateWorkScore = require('./calculateWorkScore');

/**
 * Generates a stable pseudo-random float between 0 and 1 based on a seed string.
 */
function getSeededRandom(seedString) {
  const hash = crypto.createHash('md5').update(seedString).digest('hex');
  return parseInt(hash.substring(0, 8), 16) / 0xffffffff;
}

/**
 * Enriches a cafe payload with deterministically simulated contextual metrics.
 */
function enrichCafeWithSimulatedMetrics(cafe) {
  // Use the unique cafe ID to seed the random number generation
  const seedStr = cafe._id ? cafe._id.toString() : cafe.id;
  
  const randWifi = getSeededRandom(seedStr + 'wifi');
  const randNoise = getSeededRandom(seedStr + 'noise');
  const randSeating = getSeededRandom(seedStr + 'seating');
  const randPower = getSeededRandom(seedStr + 'power');
  
  // 1. Simulate WiFi (20 - 150 Mbps)
  let wifiSpeed;
  if (randWifi < 0.20) {
    wifiSpeed = Math.floor(20 + (randWifi / 0.20) * 20); // 20-40 Mbps
  } else if (randWifi < 0.80) {
    wifiSpeed = Math.floor(40 + ((randWifi - 0.20) / 0.60) * 60); // 40-100 Mbps
  } else {
    wifiSpeed = Math.floor(100 + ((randWifi - 0.80) / 0.20) * 50); // 100-150 Mbps
  }

  // 2. Simulate Noise Level
  // Weights: 60% Moderate, 20% Quiet, 20% Busy
  let noiseLevelStr, noiseScore;
  if (randNoise < 0.20) {
    noiseLevelStr = 'Quiet';
    noiseScore = 1; // Lower is better for noise in score calculation
  } else if (randNoise < 0.80) {
    noiseLevelStr = 'Moderate';
    noiseScore = 3;
  } else {
    noiseLevelStr = 'Busy';
    noiseScore = 5;
  }

  // 3. Simulate Seating Comfort
  // Weights: 40% Average, 30% Comfortable, 30% Limited
  let seatingComfortStr, seatingScore;
  if (randSeating < 0.30) {
    seatingComfortStr = 'Comfortable';
    seatingScore = 5;
  } else if (randSeating < 0.70) {
    seatingComfortStr = 'Average';
    seatingScore = 3;
  } else {
    seatingComfortStr = 'Limited';
    seatingScore = 1;
  }

  // 4. Power outlets
  let powerOutlets = randPower < 0.3 ? 1 : (randPower < 0.7 ? 3 : 5);
  
  // Smart Context: If rating is high, nudge metrics higher mildly
  const baseRating = cafe.rating || 7.0;
  if (baseRating >= 8.5) {
    if (wifiSpeed < 50) wifiSpeed += 30; // Premium cafes shouldn't have terrible wifi
    if (seatingScore === 1 && randSeating < 0.85) { 
      seatingComfortStr = 'Average'; 
      seatingScore = 3; 
    }
  } else if (baseRating < 6.5) {
    if (noiseScore === 1) { 
      noiseLevelStr = 'Moderate'; 
      noiseScore = 3; 
    }
  }

  // 5. Compute Unified Work Score
  const workScore = calculateWorkScore({
    wifiSpeed,
    noiseLevel: noiseScore,
    seatingComfort: seatingScore,
    powerOutlets
  });

  // Extract raw cafe properties if it's a Mongoose document
  const rawCafe = cafe.toObject ? cafe.toObject() : { ...cafe };

  return {
    ...rawCafe,
    metrics: {
      wifiSpeed,
      noiseLevel: noiseLevelStr,
      seatingComfort: seatingComfortStr,
      powerOutlets
    },
    workScore // Overrides existing mock work score with authentic simulation
  };
}

module.exports = {
  enrichCafeWithSimulatedMetrics
};
