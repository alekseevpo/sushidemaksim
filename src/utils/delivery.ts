import * as turf from '@turf/turf';

export const RESTAURANT_LOCATION: [number, number] = [40.397042, -3.672449];

export function detectZone(lat: number, lon: number, deliveryZones: any[]) {
    if (!lat || !lon || !deliveryZones || deliveryZones.length === 0) return null;

    const userPoint = turf.point([lon, lat]); // [lng, lat] for turf
    const restaurantPoint = turf.point([RESTAURANT_LOCATION[1], RESTAURANT_LOCATION[0]]);
    const distanceKm = turf.distance(restaurantPoint, userPoint);

    const matchingZones: any[] = [];

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

    if (matchingZones.length > 0) {
        // Sort by area/diff ascending so the most specific zone wins
        matchingZones.sort((a, b) => a.area - b.area);
        return matchingZones[0];
    }

    return null;
}
