import { useEffect } from 'react';

/**
 * Custom hook for managing page SEO meta tags
 * @param {Object} options - SEO options
 * @param {string} options.title - Page title
 * @param {string} options.description - Meta description
 * @param {string} options.image - OpenGraph image URL (optional)
 * @param {string} options.type - OpenGraph type (default: 'website')
 */
export function usePageSEO({ title, description, image, type = 'website' }) {
    useEffect(() => {
        // Update title
        if (title) {
            document.title = title;
        }

        // Update or create meta description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            document.head.appendChild(metaDescription);
        }
        if (description) {
            metaDescription.setAttribute('content', description);
        }

        // Update or create Open Graph tags
        const ogTags = [
            { property: 'og:title', content: title },
            { property: 'og:description', content: description },
            { property: 'og:type', content: type }
        ];

        if (image) {
            ogTags.push({ property: 'og:image', content: image });
        }

        ogTags.forEach(({ property, content }) => {
            if (!content) return;
            
            let tag = document.querySelector(`meta[property="${property}"]`);
            if (!tag) {
                tag = document.createElement('meta');
                tag.setAttribute('property', property);
                document.head.appendChild(tag);
            }
            tag.setAttribute('content', content);
        });

        // Cleanup function (optional - reset to default if needed)
        return () => {
            // Optionally reset to default title/description
        };
    }, [title, description, image, type]);
}

