export const GetFileTypeByName = (str) => {
    const splitedArray = str.split(".");
    const fileType = splitedArray[splitedArray.length - 1];
    return fileType
}