export function downloadCloudinaryFile(fileUrl, fileName = 'downloaded-file') {
    fetch(fileUrl, { mode: 'cors' })
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch file');
            return response.blob();
        })
        .then(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName; // Preserve original filename
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        })
        .catch(console.error);
}
