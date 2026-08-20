# Weather And Market Source-Truth Receipt

- Site SHA: `95721d01e3d2170074944775602a274f078b11a1`
- Hub SHA: `652db4e35ea220609068f7769c7241376d3a88f4`
- Analytics origin/main SHA: `2d9d90cb40e651bbe0f20ad6cdade03fe9588449`
- Observed: `2026-08-19`

Weather authority:

- NOAA 1991-2020 monthly normals for Sarasota-Bradenton Airport, station `USW00012871`: `https://www.ncei.noaa.gov/access/services/data/v1?dataset=normals-monthly-1991-2020&stations=USW00012871&format=json&includeAttributes=false`
- NOAA Port Manatee water-temperature proxy: `https://www.ncei.noaa.gov/access/coastal-water-temperature-guide/all_table.html`
- NHC season and Milton archive: `https://www.nhc.noaa.gov/climo/`, `https://www.nhc.noaa.gov/archive/2024/al14/al142024.update.10100030.shtml`
- NWS beach and lightning safety: `https://www.weather.gov/safety/beachhazards`
- CDC mosquito protection: `https://www.cdc.gov/mosquitoes/prevention/index.html`
- Manatee County Route 5 trolley: `https://www.mymanatee.org/services-and-amenities/service-listing/service-details/ride-route-5-anna-maria-island-trolley`
- Site cancellation boundary: `/terms/#cancellations`

Weather decision: remove false-current, crowd, price, availability, storm-rarity, fixed-warning, and cancellation promises. Replace the monthly table with labeled NOAA proxies and a defined rain-day threshold. Date the material correction `2026-08-19`.

Market authority: the fixed historical source covers 545 confirmed bookings out of 1,492 reservation records across five Bradenton/Sarasota homes from June 2022 through March 2026. The current Analytics snapshot expired on 2026-08-19, and a pinned diagnostic materially differs from the old benchmark. Do not publish the diagnostic as current evidence.

Market decision: relabel the page as a historical portfolio benchmark, state the fixed scope, link the research method, demote historical figures, remove current-market and causal advice, and do not add current metrics until a fresh reviewed Analytics artifact exists.

