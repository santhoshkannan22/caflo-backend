/**
 * Calculates a work-friendly score (0-10) for a cafe.
 * Lower noise is better, so noise score is inverted.
 */
const calculateWorkScore = ({ wifiSpeed, noiseLevel, seatingComfort, powerOutlets }) => {
  const noiseLevelScore = 10 - Number(noiseLevel || 0);
  const score =
    Number(wifiSpeed || 0) * 0.35 +
    noiseLevelScore * 0.25 +
    Number(seatingComfort || 0) * 0.2 +
    Number(powerOutlets || 0) * 0.2;

  return Math.max(0, Math.min(10, Number(score.toFixed(2))));
};

module.exports = calculateWorkScore;
