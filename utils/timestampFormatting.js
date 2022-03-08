// Stringifies date
function getDateString(date) {
    let dateString;
    const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dateMonth = month[date.getMonth()];
    const dateDay = date.getDate();

    return `${dateMonth} ${dateDay}`;
}

// Stringifies time
function getTimeString(time) {
    let hours = time.getHours();
    let minutes = time.getMinutes();
    const ampm = hours < 12 ? 'am' : 'pm';
    hours %= 12;
    hours = hours === 0 ? 12 : hours;
    
    if (minutes > 0 && minutes < 10) {
        minutes = '0' + minutes;
    }

    return (minutes !== 0 ? hours + ':' + minutes + ampm : hours + ampm)
}

// Returns a date-time string from a start timestamp and end timestamp
function getDateTimeString(startTime, endTime) {
    const startDateStr = getDateString(startTime);
    const endDateStr = getDateString(endTime);
    const startTimeStr = getTimeString(startTime);
    const endTimeStr = getTimeString(endTime);

    if (startDateStr === endDateStr) {
        return startDateStr + ' at ' + startTimeStr + ' - ' + endTimeStr;
    } else {
        return startDateStr + ' at ' + startTimeStr + ' to ' + endDateStr + ' at ' + endTimeStr;
    }
}

export { getDateTimeString }