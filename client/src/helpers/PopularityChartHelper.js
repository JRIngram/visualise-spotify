/**
 * The popularityChart data structure used in the project looks like this:
 * popularityChart:{
        datasets:[
          {
            data: [],
            backgroundColor: ["#0074D9"],
          },
        ]
     }

 * @param popularityData - This function uses popularityChart.datasets[0].data as 'popularityData'
 */
export function calculateAveragePopularity(popularityData, numberOfSongs) {
  let sumOfPopularities = 0;
  for (let i = 0; i < popularityData.length; i += 1) {
    sumOfPopularities += popularityData[i];
  }
  const averagePopularity = sumOfPopularities / numberOfSongs;
  return averagePopularity;
}

export function generateTextForAveragePopularity(averagePopularity) {
  let averagePopularityText = '';
  if (averagePopularity < 25) {
    averagePopularityText = 'Hey, not all popular music is bad! Give it a try sometime.';
  } else if (averagePopularity >= 25 && averagePopularity < 50) {
    averagePopularityText = 'You mainly listen to less popular songs, you indiehead.';
  } else if (averagePopularity >= 50 && averagePopularity < 75) {
    averagePopularityText = 'This means you like to listen to well known tracks but you also like some underground tunes.';
  } else if (averagePopularity >= 75) {
    averagePopularityText = 'You have no individual taste.';
  }
  return averagePopularityText;
}

/**
 * Sets colours of bars on the bar chart
 * @param {any} selectedItemIndex - index of the currently selected list item, will be highlighted in a different colour
 */
export function chartColours(selectedItemIndex) {
  const colours = [];
  for (let i = 0; i < 50; i += 1) {
    if (i === selectedItemIndex) {
      colours.push('#ffaf24');
    } else {
      colours.push('rgba(253, 126, 20, 0.8)');
    }
  }
  return colours;
}
