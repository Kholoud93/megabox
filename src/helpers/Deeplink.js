// src/helpers/Deeplink.js

export function extractBranchDataFromUrl() {
    return new Promise((resolve, reject) => {
        if (typeof window.branch === 'undefined') {
            reject('Branch SDK is not available');
            return;
        }
        window.branch.init('key_test_asCmg1x2BDyHh3GHNcEzofihqvepEG95', (err, data) => {
            if (err) {
                reject(err);
                return;
            }

            if (data?.data_parsed['+clicked_branch_link']) {
                const deepLinkData = handleBranchDeepLink(data);
                resolve(deepLinkData);
            } else {
                resolve(null);
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
