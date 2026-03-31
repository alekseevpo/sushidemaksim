import * as turf from '@turf/turf';

export const RESTAURANT_LOCATION: [number, number] = [40.397042, -3.672449];

export function detectZone(
    lat: number | undefined,
    lon: number | undefined,
    deliveryZones: any[],
    postalCode?: string
) {
    if ((!lat || !lon) && !postalCode) return null;
    if (!deliveryZones || deliveryZones.length === 0) return null;

    const matchingZones: any[] = [];

    if (lat && lon) {
        const userPoint = turf.point([lon, lat]); // [lng, lat] for turf
        const restaurantPoint = turf.point([RESTAURANT_LOCATION[1], RESTAURANT_LOCATION[0]]);
        const distanceKm = turf.distance(restaurantPoint, userPoint);

        for (const zone of deliveryZones) {
            if (
                zone.type === 'radius' ||
                (zone.maxRadius > 0 && (!zone.coordinates || zone.coordinates.length < 3))
            ) {
                // Radius-based detection
                if (distanceKm >= (zone.minRadius || 0) && distanceKm < zone.maxRadius) {
                    matchingZones.push({ ...zone, area: zone.maxRadius - (zone.minRadius || 0) });
                }
            } else if (
                (zone.type === 'polygon' || !zone.type) &&
                zone.coordinates &&
                Array.isArray(zone.coordinates) &&
                zone.coordinates.length >= 3
            ) {
                // Legacy Polygon-based detection
                let turfCoords = zone.coordinates.map((c: number[]) => [c[1], c[0]]);
                if (
                    turfCoords[0][0] !== turfCoords[turfCoords.length - 1][0] ||
                    turfCoords[0][1] !== turfCoords[turfCoords.length - 1][1]
                ) {
                    turfCoords = [...turfCoords, turfCoords[0]];
                }

                try {
                    const poly = turf.polygon([turfCoords]);
                    if (turf.booleanPointInPolygon(userPoint, poly)) {
                        const area = turf.area(poly);
                        matchingZones.push({ ...zone, area: area / 1000000 }); // Area in km2 for comparison
                    }
                } catch (err) {
                    console.warn('Invalid polygon for zone:', zone.name);
                }
            }
        }
    }

    // Fallback to Postal Code if no coordinates or no matching zones via coordinates
    if (matchingZones.length === 0 && postalCode) {
        const pcClean = postalCode.replace(/\D/g, '').trim();
        if (pcClean.length === 5) {
            for (const zone of deliveryZones) {
                if (zone.postalCodes && Array.isArray(zone.postalCodes)) {
                    if (zone.postalCodes.includes(pcClean)) {
                        matchingZones.push({ ...zone, area: 999999 }); // Lowest priority
                    }
                }
            }
        }
    }

    if (matchingZones.length > 0) {
        // Sort by area/diff ascending so the most specific zone wins
        matchingZones.sort((a, b) => a.area - b.area);
        return matchingZones[0];
    }

    return null;
}

export function detectZoneByPostalCode(postalCode: string, deliveryZones: any[]) {
    if (!postalCode || !deliveryZones) return null;
    const pcClean = postalCode.replace(/\D/g, '').trim();
    if (pcClean.length !== 5) return null;

    for (const zone of deliveryZones) {
        if (zone.postalCodes && Array.isArray(zone.postalCodes)) {
            if (zone.postalCodes.includes(pcClean)) {
                return zone;
            }
        }
    }
    return null;
}
