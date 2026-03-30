import { Router } from 'express';
import { supabase } from '../db/supabase.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { isTimeWithinBusinessHours } from '../utils/storeStatus.js';
import { sendReservationEmail } from '../utils/email.js';

const router = Router();

// Create a new reservation
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, date, time, guests, notes, user_id } = req.body;

        if (!name || !email || !phone || !date || !time || !guests) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        // Validate time within business hours
        // Parse "YYYY-MM-DD" to get the correct day of the week regardless of server TZ
        const [year, month, day] = date.split('-').map(Number);
        const resDate = new Date(year, month - 1, day);

        if (!isTimeWithinBusinessHours(resDate, time)) {
            return res
                .status(400)
                .json({ error: 'El restaurante está cerrado en el horario seleccionado' });
        }

        const { data: insertedData, error: insertError } = await supabase
            .from('reservations')
            .insert({
                name,
                email: email || 'guest@sushidemaksim.es',
                phone,
                reservation_date: date,
                reservation_time: time,
                guests: parseInt(guests.toString()),
                notes: notes || '',
                user_id: user_id || null,
                status: 'pending',
            })
            .select();

        if (insertError) {
            console.error('Supabase error inserting reservation:', insertError);
            throw insertError;
        }

        const data = insertedData && insertedData.length > 0 ? insertedData[0] : null;

        const dataForEmails = data || {
            name,
            email: email || 'guest@sushidemaksim.es',
            phone,
            reservation_date: date,
            reservation_time: time,
            guests: parseInt(guests.toString()),
            notes: notes || '',
        };

        // Send confirmation emails (don't wait for them)
        try {
            sendReservationEmail(dataForEmails).catch(err =>
                console.error('Error sending customer reservation email:', err)
            );
            sendReservationEmail(dataForEmails, true).catch(err =>
                console.error('Error sending admin reservation email:', err)
            );
        } catch (emailErr) {
            console.error('Email error (swallowed):', emailErr);
        }

        res.status(201).json(dataForEmails);
    } catch (error: any) {
        console.error('DETAILED RESERVATION ERROR:', {
            message: error.message,
            stack: error.stack,
            body: req.body,
        });
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

// Get user reservations (authenticated)
router.get('/my', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { data, error } = await supabase
            .from('reservations')
            .select('*')
            .eq('user_id', req.userId)
            .order('reservation_date', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
