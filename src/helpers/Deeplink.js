// src/helpers/Deeplink.js

export function extractBranchDataFromUrl(url) {
    return new Promise((resolve, reject) => {
        // Check if Branch SDK is loaded
        if (typeof window.branch === 'undefined') {
            console.error('Branch SDK is not loaded properly.');
            reject('Branch SDK is not available');
            return;
        }
        console.log(url);
        // Initialize Branch SDK with the test key
        window.branch.init('key_test_asCmg1x2BDyHh3GHNcEzofihqvepEG95', (err, data) => {
            if (err) {
                console.error('Branch SDK initialization error:', err);
                reject(err);
                return;
            }

            console.log('Branch SDK initialized successfullyy:', data);

            // Check if a deep link was clicked
            if (data?.data_parsed['+clicked_branch_link']) {
                console.log('Deep link detected during initialization');
                const deepLinkData = handleBranchDeepLink(data);
                console.log(deepLinkData);
                resolve(deepLinkData); // Return deep link data
            } else {
                resolve(null); // No deep link data found
            }
        });
    });
}

function handleBranchDeepLink(data) {
    if (data?.data && data?.data_parsed?.file_id) {
        return {
            fileId: data?.data_parsed?.file_id,
            fileName: data.data_parsed.file_name,
            ...data.data_parsed
        };
    }
    return null;
}
