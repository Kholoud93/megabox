// Partners Data - يمكن استبدالها ببيانات حقيقية من API
// لاستبدال الـplaceholders: غيّري حقل 'logo' بالمسار الصحيح للصورة
// يمكن استخدام:
// 1. مسار نسبي من مجلد public: '/images/partners/aws-logo.png'
// 2. URL خارجي: 'https://example.com/logo.png'
// 3. استيراد مباشر: import awsLogo from '../assets/partners/aws.png' ثم logo: awsLogo

export const partnersData = [
    // شركاء تقنيين (Top Partners)
    {
        id: 1,
        name: 'Amazon Web Services',
        // مصادر موثوقة للحصول على الشعار:
        // 1. Simple Icons CDN: 'https://cdn.simpleicons.org/amazonaws/FF9900'
        // 2. World Vector Logo: حمّلي SVG من https://worldvectorlogo.com/
        // 3. AWS Official: https://aws.amazon.com/legal/logos/
        logo: 'https://cdn.simpleicons.org/amazonaws/FF9900', // ✅ Simple Icons (جاهز للاستخدام)
        // بديل: logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
        type: 'technical',
        priority: 1
    },
    {
        id: 2,
        name: 'Google Cloud',
        // Simple Icons: 'https://cdn.simpleicons.org/googlecloud/4285F4'
        // أو من: https://cloud.google.com/logos
        logo: 'https://cdn.simpleicons.org/googlecloud/4285F4', // ✅ Simple Icons
        type: 'technical',
        priority: 2
    },
    {
        id: 3,
        name: 'Microsoft Azure',
        // Simple Icons: 'https://cdn.simpleicons.org/microsoftazure/0078D4'
        // أو من: https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks
        logo: 'https://cdn.simpleicons.org/microsoftazure/0078D4', // ✅ Simple Icons
        type: 'technical',
        priority: 3
    },
    // شركاء المحتوى
    {
        id: 4,
        name: 'Content Delivery Network',
        // يمكنك البحث في Simple Icons أو World Vector Logo
        // مثال: logo: 'https://cdn.simpleicons.org/cloudflare/F38020'
        logo: 'https://via.placeholder.com/200x100/6366F1/FFFFFF?text=CDN',
        type: 'content',
        priority: 4
    },
    {
        id: 5,
        name: 'Video Streaming Platform',
        // مثال: logo: 'https://cdn.simpleicons.org/youtube/FF0000'
        logo: 'https://via.placeholder.com/200x100/8B5CF6/FFFFFF?text=Streaming',
        type: 'content',
        priority: 5
    },
    // شركات مدعومة
    {
        id: 6,
        name: 'Security Partner',
        // مثال: logo: 'https://cdn.simpleicons.org/cloudflare/F38020'
        logo: 'https://via.placeholder.com/200x100/10B981/FFFFFF?text=Security',
        type: 'supported',
        priority: 6
    },
    {
        id: 7,
        name: 'Payment Gateway',
        // مثال: logo: 'https://cdn.simpleicons.org/stripe/635BFF'
        // أو: logo: 'https://cdn.simpleicons.org/paypal/00457C'
        logo: 'https://via.placeholder.com/200x100/EF4444/FFFFFF?text=Payment',
        type: 'affiliate',
        priority: 7
    },
    {
        id: 8,
        name: 'Analytics Platform',
        // مثال: logo: 'https://cdn.simpleicons.org/googleanalytics/E37400'
        logo: 'https://via.placeholder.com/200x100/F59E0B/FFFFFF?text=Analytics',
        type: 'affiliate',
        priority: 8
    }
];

// Default placeholder image
export const defaultPartnerLogo = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI0U1RTdFQiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Mb2dvPC90ZXh0Pjwvc3ZnPg==';

