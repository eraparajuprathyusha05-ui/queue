function average(numbers = []) {
  if (!numbers.length) {
    return 0;
  }

  const total = numbers.reduce((sum, value) => sum + value, 0);
  return total / numbers.length;
}

function getCrowdLevel(estimatedPeople) {
  if (estimatedPeople > 10) {
    return "High";
  }

  if (estimatedPeople >= 5) {
    return "Medium";
  }

  return "Low";
}

function calculateQueueStats(manualEntries = [], activeUsers = 0, gpsCrowdCount = 0) {
  const blendedActiveUsers = activeUsers + gpsCrowdCount;
  const averageManual = Number(average(manualEntries).toFixed(1));
  const estimatedPeople = Number(
    ((averageManual + blendedActiveUsers * 1.5) / 2).toFixed(1)
  );
  const waitingTime = Math.round(estimatedPeople * 2);
  const crowdLevel = getCrowdLevel(estimatedPeople);

  return {
    averageManual,
    blendedActiveUsers,
    estimatedPeople,
    waitingTime,
    crowdLevel,
  };
}

module.exports = {
  calculateQueueStats,
};
