import { supabase } from '../src/db/supabase.js';
import { processImage } from '../src/utils/imageProcessor.js';
import axios from 'axios';
import path from 'path';

async function migrate() {
    console.log('🚀 Starting WebP Migration...');

    // 1. Migrate Menu Items
    const { data: menuItems } = await supabase.from('menu_items').select('id, name, image');
    if (menuItems) {
        console.log(`🍔 Processing ${menuItems.length} menu items...`);
        for (const item of menuItems) {
            if (item.image && !item.image.endsWith('.webp')) {
                try {
                    console.log(`   Converting ${item.name}...`);
                    const response = await axios.get(item.image, { responseType: 'arraybuffer' });
                    const optimized = await processImage(Buffer.from(response.data), {
                        type: 'menu',
                    });

                    const newFileName = `${Date.now()}-${item.id}.webp`;
                    const filePath = `menu/${newFileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from('images')
                        .upload(filePath, optimized, {
                            contentType: 'image/webp',
                            upsert: true,
                        });

                    if (!uploadError) {
                        const {
                            data: { publicUrl },
                        } = supabase.storage.from('images').getPublicUrl(filePath);
                        await supabase
                            .from('menu_items')
                            .update({ image: publicUrl })
                            .eq('id', item.id);
                        console.log(`   ✅ Done: ${item.name}`);
                    }
                } catch (e: any) {
                    console.error(`   ❌ Failed ${item.name}: ${e.message}`);
                }
            }
        }
    }

    // 2. Migrate User Avatars
    const { data: users } = await supabase.from('users').select('id, name, avatar');
    if (users) {
        console.log(`👤 Processing ${users.length} user avatars...`);
        for (const user of users) {
            if (user.avatar && !user.avatar.endsWith('.webp') && user.avatar.includes('supabase')) {
                try {
                    console.log(`   Converting avatar for ${user.name}...`);
                    const response = await axios.get(user.avatar, { responseType: 'arraybuffer' });
                    const optimized = await processImage(Buffer.from(response.data), {
                        type: 'avatar',
                    });

                    const newFileName = `${Date.now()}-${user.id}.webp`;
                    const filePath = `avatars/${newFileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from('images')
                        .upload(filePath, optimized, {
                            contentType: 'image/webp',
                            upsert: true,
                        });

                    if (!uploadError) {
                        const {
                            data: { publicUrl },
                        } = supabase.storage.from('images').getPublicUrl(filePath);
                        await supabase
                            .from('users')
                            .update({ avatar: publicUrl })
                            .eq('id', user.id);
                        console.log(`   ✅ Done: ${user.name}`);
                    }
                } catch (e: any) {
                    console.error(`   ❌ Failed ${user.name}: ${e.message}`);
                }
            }
        }
    }

    // 3. Migrate Blog Posts
    const { data: blogPosts } = await supabase.from('blog_posts').select('id, title, image_url');
    if (blogPosts) {
        console.log(`📝 Processing ${blogPosts.length} blog posts...`);
        const fs = await import('fs/promises');
        for (const post of blogPosts) {
            if (post.image_url && !post.image_url.endsWith('.webp')) {
                try {
                    console.log(`   Converting blog image for ${post.title}...`);
                    let buffer: Buffer;

                    if (post.image_url.startsWith('http')) {
                        const response = await axios.get(post.image_url, {
                            responseType: 'arraybuffer',
                        });
                        buffer = Buffer.from(response.data);
                    } else {
                        // Check root public and server public
                        const rootPublicPath = path.join(
                            process.cwd(),
                            '..',
                            'public',
                            post.image_url
                        );
                        const serverPublicPath = path.join(process.cwd(), 'public', post.image_url);

                        let finalPath = '';
                        try {
                            await fs.access(rootPublicPath);
                            finalPath = rootPublicPath;
                        } catch {
                            try {
                                await fs.access(serverPublicPath);
                                finalPath = serverPublicPath;
                            } catch {
                                throw new Error(
                                    `File not found in root public or server public: ${post.image_url}`
                                );
                            }
                        }
                        buffer = await fs.readFile(finalPath);
                    }

                    const optimized = await processImage(buffer, { type: 'blog' });

                    const newFileName = `${Date.now()}-${post.id}.webp`;
                    const filePath = `blog/${newFileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from('images')
                        .upload(filePath, optimized, {
                            contentType: 'image/webp',
                            upsert: true,
                        });

                    if (!uploadError) {
                        const {
                            data: { publicUrl },
                        } = supabase.storage.from('images').getPublicUrl(filePath);
                        await supabase
                            .from('blog_posts')
                            .update({ image_url: publicUrl })
                            .eq('id', post.id);
                        console.log(`   ✅ Done: ${post.title}`);
                    }
                } catch (e: any) {
                    console.error(`   ❌ Failed ${post.title}: ${e.message}`);
                }
            }
        }
    }

    console.log('🏁 WebP Migration Complete!');
}

migrate();
