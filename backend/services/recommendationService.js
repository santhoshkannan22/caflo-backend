const calculatePreferenceBoost = (cafe, preference) => {
  if (!preference) return 0;

  switch (preference.toLowerCase()) {
    case 'quiet':
      return (10 - cafe.noiseLevel) * 0.15;
    case 'fast wifi':
    case 'fast-wifi':
    case 'fast_wifi':
      return cafe.wifiSpeed * 0.15;
    case 'comfortable seating':
    case 'comfortable-seating':
    case 'comfortable_seating':
      return cafe.seatingComfort * 0.15;
    default:
      return 0;
  }
};

const sortRecommendations = ({ cafes, preference }) => {
  return [...cafes].sort((a, b) => {
    const aPreference = calculatePreferenceBoost(a, preference);
    const bPreference = calculatePreferenceBoost(b, preference);

    if (b.workScore + bPreference !== a.workScore + aPreference) {
      return b.workScore + bPreference - (a.workScore + aPreference);
    }

    return a.distanceMeters - b.distanceMeters;
  });
};

module.exports = {
  sortRecommendations
};
