'use strict'

const cheerio = require('cheerio');
const fetch = require('node-fetch');
const fs = require('fs');

async function getPage(yearNum = 2022, monthNum = 3) {
    let events = [];
    const url = `https://calendar.ucsc.edu/calendar/month/${yearNum}/${monthNum}`;

    const result = await fetch(url);
    const html = await result.text();
    const $ = cheerio.load(html);
    let eventAnchors = $('.event_item > a');

    for (let i = 0; i < eventAnchors.length; i++) {
        const url = $(eventAnchors[i]).attr('href');
        if (!events.some((value) => {return url === value.url})) {
            await getEvent(url, events);
        }
    }

    return events;
}

async function getEvent(url, events) {
    const result = await fetch(url);
    const html =  await result.text();

    const $ = cheerio.load(html);

    let event = {
        url: url,
        name: '',
        imageUrl: '',
        description: '',
        startDate: null,
        endDate: null,
        location: ''
    };

    let nameEl = $('.summary');
    if (nameEl) {
        event.name = $(nameEl).text().trim();
    }

    let image = $('.img_big_square');
    if (image) {
        event.imageUrl = $(image).attr('src')
    }
    
    let descriptionParagraphs = $('div.description > p');
    descriptionParagraphs.each((index, el) => {
        event.description += ($(el).text());

        if (index !== descriptionParagraphs.length - 1) {
            event.description += '\n\n';
        } 
    });
    
    let locationEl = $('.location span');

    if (locationEl) {
        event.location = locationEl.text();
    }

    event.startDate = new Date(($('.dateright abbr.dtstart').attr('title')));
    
    let endDateEl = $('.dateright abbr.dtend').attr('title');
    if (endDateEl) {
        event.endDate = new Date(endDateEl);
    } else {
        event.endDate = new Date(event.startDate.getTime());
        event.endDate.setHours(23);
        event.endDate.setMinutes(59);
    }

    events.push(event);

    let allDates = $('#x-all-dates > .dateright');

    if (allDates) {
        allDates.each((index, el) => {
            let eventObj = {
                url: url,
                name: event.name,
                description: event.description,
                imageUrl: event.imageUrl,
                startDate: null,
                endDate: null,
                location: event.location
            };
            const dateArray = $(el).text().split(' at ');
            const date = dateArray[0];

            if (dateArray.length > 1) {
                let time = dateArray[1];
                let timeArray = time.split(' to ');

                let startTime;
                if (timeArray[0].includes('am')) {
                    startTime = timeArray[0].slice(0, timeArray[0].indexOf('am'));

                } else {
                    let trimmedTime = timeArray[0].slice(0, timeArray[0].indexOf('pm'));
                    let trimmedTimeArr = trimmedTime.split(':')
                    let hours = parseInt(trimmedTimeArr[0]);
                    if (hours !== 12) {
                        hours += 12;
                    }
                    startTime = hours + ':' + trimmedTimeArr[1];
                }

                eventObj.startDate = new Date(date + ' 2022 ' + startTime);

                if (timeArray.length > 1) {
                    let endTime;

                    if (timeArray[1].includes('am')) {
                        endTime = timeArray[1].slice(0, timeArray[1].indexOf('am'));

                    } else {
                        let trimmedTime = timeArray[1].slice(0, timeArray[1].indexOf('pm'));
                        let trimmedTimeArr = trimmedTime.split(':')
                        let hours = parseInt(trimmedTimeArr[0]);
                        if (hours !== 12) {
                            hours += 12;
                        }
                        endTime = hours + ':' + trimmedTimeArr[1];
                    }

                    eventObj.endDate = new Date(date + ' 2022 ' + endTime);
                }
            } else {
                eventObj.startDate = new Date(date + ' 2022');
                eventObj.endDate = new Date(eventObj.startDate.getTime());
                eventObj.endDate.setHours(23);
                eventObj.endDate.setMinutes(59);
            }

            events.push(eventObj);
        })
    }
}

async function main() {
    let events = await getPage(2022, 3);
    events.concat(await getPage(2022, 4));
    events.concat(await getPage(2022, 5));

    events = events.filter((event) => {
        return (event.name && event.description && event.startDate && event.endDate && event.location && event.imageUrl);
    });

    fs.writeFile('eventData.txt', JSON.stringify(events), function (err, data) {
        if (err) {
            console.log(error);
        }
    });
}

main();