const https = require('https');

// SECURITY: API keys MUST be set in Netlify environment variables
// Go to Netlify Dashboard > Site Settings > Environment Variables
const CLIENT_ID = process.env.HOSTAWAY_ID;
const CLIENT_SECRET = process.env.HOSTAWAY_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('CRITICAL: HOSTAWAY_ID and HOSTAWAY_SECRET environment variables must be set!');
}

exports.handler = async function (event, context) {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // 1. Get Access Token
        const token = await getAccessToken();

        // 2. Get Listings
        const listings = await getListings(token);

        // 3. Transform Data for Frontend
        const mappedData = listings.map(p => {
            const bedrooms = firstDefined(
                p.bedrooms,
                p.bedroomsNumber,
                p.bedroomNumber,
                p.numberBedrooms
            );
            const bathrooms = firstDefined(
                p.bathrooms,
                p.bathroomsNumber,
                p.bathroomNumber,
                p.guestBathroomsNumber,
                p.numberBathrooms
            );
            const guests = firstDefined(
                p.personCapacity,
                p.guests,
                p.maxGuests
            );
            // Extract image
            const image = p.listingImages && p.listingImages.length > 0 ? p.listingImages[0].url : '';

            // Extract amenities (simplified)
            const amenities = Array.isArray(p.amenities)
                ? p.amenities.map(a => typeof a === 'string' ? a : a.name).filter(Boolean).slice(0, 6)
                : [];

            // Extract tags (infer from amenities or type)
            const tags = [];
            if (p.name.toLowerCase().includes('water') || (p.amenityIds && p.amenityIds.includes(1))) tags.push('Waterfront'); // Heuristic
            if (p.amenities && p.amenities.some(a => a.name.includes('Pool'))) tags.push('Private Pool');

            return {
                id: String(p.id),
                title: p.name,
                location: p.city,
                guests: guests,
                bedrooms: bedrooms,
                bathrooms: bathrooms,
                price: p.listingPrice || 350, // Fallback if price is missing
                rating: 5.0, // Hostaway doesn't always send rating in simple listing view
                image: image,
                // Include ALL images from Hostaway (up to 20)
                images: p.listingImages ? p.listingImages.slice(0, 20).map(img => img.url) : [image],
                description: p.description,
                highlights: amenities.slice(0, 2),
                amenities: amenities,
                specs: `${bedrooms ?? 0} BR · ${bathrooms ?? 0} BA · Sleeps ${guests ?? 0}`,
                tags: tags.length > 0 ? tags : ['All Stays']
            };
        });

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" // Allow CORS
            },
            body: JSON.stringify(mappedData)
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

function firstDefined(...values) {
    return values.find(value => value !== undefined && value !== null && value !== '');
}

function getAccessToken() {
    return new Promise((resolve, reject) => {
        const body = new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            scope: 'general'
        }).toString();

        const options = {
            hostname: 'api.hostaway.com',
            path: '/v1/accessTokens',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': body.length
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.access_token) resolve(json.access_token);
                    else reject(new Error('Failed to get token: ' + data));
                } catch (e) { reject(e); }
            });
        });

        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

function getListings(token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.hostaway.com',
            path: '/v1/listings?limit=20',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-cache'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    // Hostaway returns { status: 'success', result: [...] }
                    if (json.status === 'success') resolve(json.result);
                    else reject(new Error('API Error: ' + JSON.stringify(json)));
                } catch (e) { reject(e); }
            });
        });

        req.on('error', reject);
        req.end();
    });
}
