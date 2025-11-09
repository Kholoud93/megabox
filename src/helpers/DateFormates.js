import { formatDistanceToNow, differenceInDays, format } from "date-fns";

export const AgoFormatter = (DateValue) => {
    const date = new Date(DateValue);
    const now = new Date();

    const daysDiff = differenceInDays(now, date);

    if (daysDiff > 2) {
        return format(date, "dd-MM-yyyy");
    }

    const formatted = formatDistanceToNow(date, {
        addSuffix: true,
    }).replace("about ", "");

    return formatted;
};


export const DateFormatter = (gmtString) => {
    // Create a Date object from the GMT string
    const date = new Date(gmtString);

    // Define month names for both English and Arabic
    const monthNames = {
        en: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ]
    };


    // Extract the day, month, and year
    const day = date.getUTCDate();
    const month = monthNames["en"][date.getUTCMonth()];
    const year = date.getUTCFullYear();


    // Return the date in "Day Month Year" format
    return `${day} ${month} ${year}`;
};