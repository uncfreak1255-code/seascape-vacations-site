const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const {test}=require('node:test');
const root=path.resolve(__dirname,'../..');
test('weather B renders both full monthly plots and keeps its data equal to the original source table',()=>{
 const source=fs.readFileSync(path.join(root,'src/guides/anna-maria-island-weather.html'),'utf8');
 assert.match(source,/weather-guide/);assert.match(source,/climate-plots/);
 assert.match(source,/Normal high °F/);assert.match(source,/Rain days ≥0.01 in/);
 const data=JSON.parse(fs.readFileSync(path.join(root,'src/_data/weatherClimate.json'),'utf8'));
 const original=require('./fixtures/weather-original-values.json');
 assert.deepEqual(data.map(m=>[m.month,m.high,m.low,m.rain,m.rainDays,m.water]),original);
 assert.match(source,/for month in weatherClimate/);
});
