export function getFileCategory(mimeType) {
    if (!mimeType || typeof mimeType !== 'string') return 'unknown';

    if (mimeType.startsWith('image/')) {
        return 'image';
    }

    if (mimeType.startsWith('video/')) {
        return 'video';
    }

    const documentTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.oasis.opendocument.text',
        'application/vnd.oasis.opendocument.spreadsheet',
        'application/vnd.oasis.opendocument.presentation',
        'application/vnd.oasis.opendocument.graphics',
        'application/odf',
        'text/plain'
    ];

    if (documentTypes.includes(mimeType)) {
        return 'document';
    }

    const zipType = [
        'application/zip',
        'application/x-zip-compressed',
        'multipart/x-zip',
        'application/x-compressed',
    ]

    if (zipType.includes(mimeType)) {
        return 'zip';
    }

    return 'unknown';
}

export function getFileCategoryByExtension(extension) {
    const ext = extension?.toLowerCase();

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'webm', 'flv', 'mkv'];
    const documentExtensions = [
        'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt',
        'zip', 'rar'
    ];

    if (imageExtensions.includes(ext)) {
        return 'image';
    } else if (videoExtensions.includes(ext)) {
        return 'video';
    } else if (documentExtensions.includes(ext)) {
        return 'document';
    } else {
        return 'unknown';
    }
}
