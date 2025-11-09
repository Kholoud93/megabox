export function downloadCloudinaryFile(fileUrl, fileName = 'downloaded-file.zip') {
    fetch(fileUrl, { mode: 'cors' })
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch file');
            return response.blob();
        })
        .then(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName.endsWith('.zip') ? fileName : `${fileName}.zip`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        })
        .catch(console.error);
}
