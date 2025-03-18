const table = `city,population,area,density,country
  Shanghai,24256800,6340,3826,China
  Delhi,16787941,1484,11313,India
  Lagos,16060303,1171,13712,Nigeria
  Istanbul,14160467,5461,2593,Turkey
  Tokyo,13513734,2191,6168,Japan
  Sao Paulo,12038175,1521,7914,Brazil
  Mexico City,8874724,1486,5974,Mexico
  London,8673713,1572,5431,United Kingdom
  New York City,8537673,784,10892,United States
  Bangkok,8280925,1569,5279,Thailand`
    .split('\n')
    .slice(1)
    .map(line => line.split(','))
    .sort((r1, r2) => r2[3] - r1[3]);

const maxDensity = Math.max(...table.map(row => row[3]));

for (const row of table) {
    row.push(Math.round((row[3] * 100) / maxDensity)); //densityPercent
}
console.table(table)