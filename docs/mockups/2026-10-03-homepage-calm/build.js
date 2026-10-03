// Builds a self-contained prototype page: node build.js <site-dir> <out.html>
// Inlines the 800px home photos from the built site (npm run build).
const fs=require('fs'),path=require('path');
const [site,out]=process.argv.slice(2);
const homes=[
 ['the-oasis','01','The Oasis','Bradenton',16,'Five bedrooms, a private pool and room for 16.'],
 ['dockside-dreams','02','Dockside Dreams','Bradenton',12,'A private waterfront dock, pool and spa.'],
 ['sarasota-luxe','01','Sarasota Luxe','Sarasota',12,'Three king bedrooms, a bunk room and a private pool.'],
 ['river-house','01','River House','Bradenton',12,'Two king suites, a bunk room and a private pool.'],
 ['bradenton-pool-home','01','Bradenton Pool Home','Bradenton',10,'A private pool, spa and screened outdoor dining.'],
 ['blue-house','01','Pickleball Pool Home Retreat','Bradenton',11,'A private pool, pickleball court and fenced turf yard.'],
];
const uri={};
for(const [s,n] of homes){uri[s]='data:image/webp;base64,'+fs.readFileSync(path.join(site,'images/homes',s,n+'-800.webp')).toString('base64')}
let t=fs.readFileSync(path.join(__dirname,'template.html'),'utf8');
const cards=homes.map(([s,,n,c,g,tag],i)=>`<a class="card rv" style="--d:${(i%3)*.08}s" href="#"><div class="ph"><img src="{{IMG:${s}}}" alt="${n}" loading="lazy"></div><h3>${n}</h3><small>${c} · Up to ${g} guests · ${tag}</small></a>`).join('');
const slides=homes.map(([s,,n,c,g,tag])=>`<div class="b-slide"><img src="{{IMG:${s}}}" alt="${n}"><div class="b-cap"><div><p class="label">${c}, Florida · Up to ${g} guests</p><h2 class="serif">${n}</h2></div><div><p>${tag}</p><a class="btn cit" href="#" style="margin-top:12px">Explore this home</a></div></div></div>`).join('');
const dots=homes.map(()=>'<i></i>').join('');
const rows=homes.map(([s,,n,c,g],i)=>`<a class="c-row rv" data-img="{{IMG:${s}}}" href="#"><span class="n">0${i+1}</span><h3>${n}</h3><small>${c} · Up to ${g} guests</small><img class="c-thumb" src="{{IMG:${s}}}" alt="" loading="lazy"></a>`).join('');
t=t.replace('{{CARDS}}',cards).replace('{{SLIDES}}',slides).replace('{{DOTS}}',dots).replace('{{ROWS}}',rows);
t=t.replace(/\{\{IMG:([a-z-]+)\}\}/g,(_,s)=>uri[s]);
fs.writeFileSync(out,t);console.log(out,(t.length/1e6).toFixed(2)+'MB');
