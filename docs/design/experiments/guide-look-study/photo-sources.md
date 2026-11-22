# Guide look study: photo and map sources

Nonpublic study record. Nothing here is published. It follows the format of
`docs/design/waterfront-restaurant-photo-sources.md` (PR #971): a photo is used
only with a recorded source, a reuse licence and a visible credit.

Every photo below was read from its Wikimedia Commons file page on 2026-11-22.
Each one is a crop of the original, resized and saved as JPEG; the credit under
the photo links the file page and the licence and says "Cropped and resized".
The Creative Commons ShareAlike licences ask that an adapted photo keep the same
licence, so these crops stay under the licence named in their row.

## Photos used in version B

| File in `photos/` | Shows | Photographer, date | Source | Licence | Identity proof |
| --- | --- | --- | --- | --- | --- |
| `opening-dune-1800.jpg`, `opening-dune-900.jpg` | Dune at the north end of Anna Maria Island | Gzzz, 2016-07-19 | [File:Anna Maria island.jpg](https://commons.wikimedia.org/wiki/File:Anna_Maria_island.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | Commons description "Dune by the north of Anna Maria Island (Florida, USA)"; photo GPS 27.537113, -82.745109 |
| `bean-point-1200.jpg` | Bean Point Beach | Gzzz, 2016-07-19 | [File:Anna Maria Bean Point Beach.jpg](https://commons.wikimedia.org/wiki/File:Anna_Maria_Bean_Point_Beach.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | Commons description "The white sand of Bean Point Beach, on Anna Maria Island (Florida)"; photo GPS 27.538729, -82.744630 |
| `coquina-1200.jpg` | Coquina Beach lifeguard station | Fred Hsu, 2017-04-01 | [File:2017 Sarasota Coquina Beach Lifeguard Station FRD 9077.jpg](https://commons.wikimedia.org/wiki/File:2017_Sarasota_Coquina_Beach_Lifeguard_Station_FRD_9077.jpg) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | Commons description "Late afternoon at Coquina Beach on Anna Maria Island"; categories Coquina Beach (Florida) and Beaches of Anna Maria Island |
| `holmes-beach-1200.jpg` | The beach at Holmes Beach | Ann Caron, 2011-10-02 | [File:Tranquil Anna Maria Island.jpg](https://commons.wikimedia.org/wiki/File:Tranquil_Anna_Maria_Island.jpg) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | Commons description "The tranquil beaches of Holmes Beach Florida" |
| `bridge-street-pier-960.jpg` | Bridge Street Pier, Bradenton Beach | Wolfgang Moroder, 2017-04-04 | [File:Florida pier Bradenton Beach.jpg](https://commons.wikimedia.org/wiki/File:Florida_pier_Bradenton_Beach.jpg) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) | Commons description "Pier in Bradenton Beach on Anna Maria Island in Florida."; photo GPS 27.466190, -82.695000; the guide names the Historic Bridge Street Pier in this section |

Notes:

- The opening photo and the Bean Point photo were taken by the same person on
  the same afternoon about 180 m apart. They are two different pictures of the
  north end of the island.
- The Coquina Beach file is also offered under the GNU Free Documentation
  License, and the pier file under GFDL and CC BY 2.5. The study uses the
  Creative Commons licence named in each row.
- The pier photo's author asks reusers to credit him by name and to send him a
  message. The credit is given. The message is a courtesy request, not a
  licence term, and it was not sent: contacting a third party needs Sawyer's
  approval. If version B ships, that message is Sawyer's call.
- The Bean Point photo shows two distant people from behind. Neither is
  identifiable.

## Beach with no photo

Manatee Beach has no usable photo on Commons (the only candidate is an old
postcard, dated 1930 to 1945 there). Its card in version B is text only. No
placeholder image is used.

## Candidates not used

- A photo filed under Cortez Beach: the guide has no Cortez Beach section, and
  no source checked places that name inside Bradenton Beach.
- One candidate with identifiable people in the foreground.

## Gate result

The plan's gate for version B was an opening photo plus a photo for at least
three of the five beaches. Result: an opening photo plus four of five. Version B
goes ahead as planned.

## Island map in version A

`island-data.json` holds the island's silhouette and the five marker positions.

- Outline: OpenStreetMap `natural=coastline` ways for the island, read through
  the Overpass API on 2026-11-22, then simplified: canals and inlets narrower
  than about 250 m are filled. Data © OpenStreetMap contributors, Open Database
  License. The map carries the credit "© OpenStreetMap contributors".
- Markers sit on the Gulf shore at the latitude of each place. The source of
  each latitude is in the `from` field of `island-data.json`.
- The Holmes Beach marker is the middle of the city's shoreline, because the
  guide describes Holmes Beach as access points along Gulf Drive, not one spot.
