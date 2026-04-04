import { useQuery } from '@tanstack/react-query';
import { api } from '../../utils/api';

export interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    imageUrl: string;
    author: string;
    readTime: number;
    category: string;
    createdAt: string;
}

export interface BlogResponse {
    posts: BlogPost[];
    pagination: {
        totalPages: number;
        currentPage: number;
        totalPosts: number;
    };
}

export const useBlog = (page: number, limit: number = 5) => {
    return useQuery<BlogResponse>({
        queryKey: ['blog', page, limit],
        queryFn: async () => {
            return await api.get(`/blog?page=${page}&limit=${limit}`);
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
