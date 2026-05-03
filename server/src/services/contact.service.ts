import { sendContactFormEmail } from '../utils/email.js';
import { ContactInput } from '../schemas/contact.schema.js';

/**
 * Service to process contact form logic.
 */
export async function processContactMessage(input: ContactInput) {
    const { name, email, message } = input;

    // 1. Honeypot check: If hidden fields are filled, it's a bot.
    if (input.website || input.phone) {
        console.warn(`🛡️ Honeypot triggered! Bot from ${input.email} blocked.`);
        return { success: true, filtered: true };
    }

    // 2. Basic content filtering: Block messages with excessive non-Latin characters (like Cyrillic spam)
    const cyrillicPattern = /[\u0400-\u04FF]/g;
    const cyrillicMatch = message.match(cyrillicPattern);
    if (cyrillicMatch && cyrillicMatch.length > message.length * 0.3) {
        console.warn(`🛡️ Content filter triggered! Cyrillic spam from ${email} blocked.`);
        return { success: true, filtered: true };
    }

    // 3. Random string heuristics: Bots often send long alphanumeric strings without spaces.
    // Real names and messages usually have spaces if they are long.
    const nameWithoutSpaces = name.replace(/\s/g, '');
    if (nameWithoutSpaces.length > 15 && !name.includes(' ')) {
        console.warn(`🛡️ Suspicious name (no spaces): ${name}. Blocked.`);
        return { success: true, filtered: true };
    }

    const messageWithoutSpaces = message.replace(/\s/g, '');
    if (messageWithoutSpaces.length > 25 && !message.includes(' ')) {
        console.warn(`🛡️ Suspicious message (no spaces): ${message}. Blocked.`);
        return { success: true, filtered: true };
    }

    // 4. Gmail "dots" trick: la.co.b.pa.u.u.s39@gmail.com -> too many dots in local part
    if (email.toLowerCase().endsWith('@gmail.com')) {
        const localPart = email.split('@')[0];
        const dotCount = (localPart.match(/\./g) || []).length;
        if (dotCount > 4) {
            console.warn(`🛡️ Suspicious Gmail alias (too many dots): ${email}. Blocked.`);
            return { success: true, filtered: true };
        }
    }

    // In the future, we could save this to the DB here as well
    // await supabase.from('contact_messages').insert({ name, email, message });

    await sendContactFormEmail(name, email, message);

    return { success: true };
}
