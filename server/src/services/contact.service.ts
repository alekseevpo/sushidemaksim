import { sendContactFormEmail } from '../utils/email.js';
import { ContactInput } from '../schemas/contact.schema.js';

/**
 * Service to process contact form logic.
 */
export async function processContactMessage(input: ContactInput) {
    const { name, email, message } = input;
    
    // In the future, we could save this to the DB here as well
    // await supabase.from('contact_messages').insert({ name, email, message });
    
    await sendContactFormEmail(name, email, message);
    
    return { success: true };
}
