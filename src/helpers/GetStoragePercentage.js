export const StoragePrecentage = (bigger, smaller) => {
    const smallerNumber = parseFloat(smaller);

    console.log((smallerNumber / bigger) * 100);


    return (smallerNumber / bigger) * 100;
}