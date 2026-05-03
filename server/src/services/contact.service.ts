import { sendContactFormEmail } from '../utils/email.js';
import { ContactInput } from '../schemas/contact.schema.js';

/**
 * Service to process contact form logic.
 */
export async function processContactMessage(input: ContactInput) {
    const { name, email, message, website } = input;

    // 1. Honeypot check: If the hidden "website" field is filled, it's likely a bot.
    // We return success but don't send the email.
    if (website) {
        console.warn(`🛡️ Honeypot triggered! Bot from ${email} blocked.`);
        return { success: true, filtered: true };
    }

    // 2. Basic content filtering: Block messages with excessive non-Latin characters (like Cyrillic spam)
    // Spanish/English uses Latin characters. If > 30% are Cyrillic, it's likely spam for this site.
    const cyrillicPattern = /[\u0400-\u04FF]/g;
    const cyrillicMatch = message.match(cyrillicPattern);
    if (cyrillicMatch && cyrillicMatch.length > message.length * 0.3) {
        console.warn(`🛡️ Content filter triggered! Cyrillic spam from ${email} blocked.`);
        return { success: true, filtered: true };
    }

    // In the future, we could save this to the DB here as well
    // await supabase.from('contact_messages').insert({ name, email, message });

    await sendContactFormEmail(name, email, message);

    return { success: true };
}
