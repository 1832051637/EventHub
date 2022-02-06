'use strict'

const cheerio = require('cheerio');
const fetch = require('node-fetch');

async function getPage(yearNum = 2022, monthNum = 3) {
    const url = `https://calendar.ucsc.edu/calendar/month/${yearNum}/${monthNum}`;

    fetch(url)
    .then(res => res.text())
    .then(html => {
        const $ = cheerio.load(html);
        let eventAnchors = $('.event_item > a');
        
        eventAnchors.each((index, el) => {
            getEvent($(el).attr('href'));
        })
    })
    .catch(err => console.error(err));
}

async function getEvent(url) {
    fetch(url)
    .then(res => res.text())
    .then(html => {
        let event = {};

        const $ = cheerio.load(html);

        event.title = $('h1.summary').text().trim();

        event.description = [];
        let descriptionParagraphs = $('div.description > p');
        descriptionParagraphs.each((index, el) => {
            event.description.push($(el).text());
        });

        console.log($('.dateright abbr.dtstart').attr('title'));
        console.log($('.dateright abbr.dtend').attr('title'));

        //event.startTime = new Date($('.dateright abbr.dtstart').attr('title'));
        //event.endTime = new Date($('.dateright abbr.dtend').attr('title'));

        event.location = $('.location span').text();

        //console.log(event);
    })
    .catch(err => console.error(err));
}

function main() {
    getPage(2022, 3);
}

main()