export default function ComputeScenarioRating(json: {
  items: { homeWinPercentage: number }[];
}) {
  let inv = 0;
  let max = 0;
  let min = 1;

  let inv_4th = 0;
  let max_4th = 0;
  let min_4th = 1;
  for (let i = 1; i < json?.items.length; i++) {
    const element = json.items[i].homeWinPercentage;
    if (element < min) {
      min = element;
    }
    if (element < min_4th && i > json?.items.length * 0.75) {
      min_4th = element;
    }

    if (element > max) {
      max = element;
    }
    if (element > max_4th && i > json?.items.length * 0.75) {
      max_4th = element;
    }

    if (
      (element > 0.5 && json?.items[i - 1].homeWinPercentage < 0.5) ||
      (element < 0.5 && json?.items[i - 1].homeWinPercentage > 0.5)
    ) {
      inv++;
      if (i > json?.items.length * 0.75) {
        inv_4th++;
      }
    }
  }

  const share = json.items.filter((i) => i.homeWinPercentage >= 0.5).length /
    json.items.length;

  const share_4th = json.items.filter(
    (i, index) =>
      index > json?.items.length * 0.75 && i.homeWinPercentage >= 0.5,
  ).length / json.items.length;

  let scenarioRating = 0;
  // try to rate the scenario
  scenarioRating += Math.abs(max_4th - min_4th) !== Math.abs(max - min)
    ? Math.abs(max - min) > 0.9 ? 2 : Math.abs(max - min) > 0.65 ? 1 : 0
    : 0;
  scenarioRating += inv !== inv_4th ? (inv > 15 ? 2 : inv > 7 ? 1 : 0) : 0;
  scenarioRating += share > 0.35 && share < 0.65 ? 1 : 0;

  scenarioRating += Math.abs(max_4th - min_4th) > 0.9
    ? 2
    : Math.abs(max_4th - min_4th) > 0.65
    ? 1
    : 0;
  scenarioRating += inv_4th > 3 ? 1 : 0;
  scenarioRating += share_4th > 0.4 && share_4th < 0.6 ? 1 : 0;

  console.log(Math.abs(max - min));
  console.log(inv);
  console.log(share);
  console.log("4th Q drama");
  console.log(Math.abs(max_4th - min_4th));
  console.log(inv_4th);
  console.log(share_4th);

  console.log("SCENARIO RATING " + scenarioRating);
  return scenarioRating;
}
