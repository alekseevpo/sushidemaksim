import { z } from 'zod';

/**
 * Site settings are stored as key-value pairs in the database.
 * The admin route sends a dynamic object.
 */
export const updateSettingsSchema = z.object({
    body: z.record(z.string(), z.any()).refine(data => Object.keys(data).length > 0, {
        message: 'Settings object cannot be empty',
    }),
});
