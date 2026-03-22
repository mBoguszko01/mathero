export function addExp(currentExp, currentLevel, expToAdd) {
  let exp = Number(currentExp || 0);
  let level = Number(currentLevel || 1);
  let addedExp = Number(expToAdd || 0);

  exp += addedExp;

  let levelsGained = 0;

  while (exp >= level * 100) {
    exp -= level * 100;
    level += 1;
    levelsGained += 1;
  }

  return {
    exp,
    level,
    leveledUp: levelsGained > 0,
    levelsGained,
  };
}