function getDateString(startDate, endDate) {
    let dateString;
    const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const startMonth = month[startDate.getMonth()];
    const endMonth = month[endDate.getMonth()];
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();

    dateString = `${startMonth} ${startDay}`;

    if (startMonth !== endMonth) {
        dateString += ` - ${endMonth} ${endDay}`;

    } else if (startDay !== endDay) {
        dateString += ` - ${endDay}`
    }

    return dateString;
}

function getTimeString(time) {
    let hours = time.getHours();
    let minutes = time.getMinutes();
    const ampm = hours < 12 ? 'am' : 'pm';
    hours %= 12;
    hours = hours === 0 ? 12 : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    return hours + ':' + minutes + ampm;
}

export { getDateString, getTimeString}