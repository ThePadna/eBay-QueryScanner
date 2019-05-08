const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

console.log("scanner started...");
fs.readFile('./options.json', function callback(error, data) {
    if(error) {
        console.log("NOTICE: Can't read options.json, generating one for you... please restart with updated options.txt.");
        let json = {
            time: 60,
            keywords: ['keyword1', 'keyword2', 'keyword3']
        };
        fs.writeFile('options.txt', JSON.stringify(json), function callback(err) {
            if(err) {
                console.log("NOTICE: Error creating options.txt.. log will follow.");
                console.log(err);
            }
        });
    } else {
        let json = JSON.parse(data);
        let keywords = json.keywords, time = (json.time * 1000);
        console.log("Performing first listing check... scheduled for every " + (time / 1000) + " minute(s).");
        setInterval(() => {
            fs.readFile('./listings.json', function callback(err, data) {
                if(err) {
                    console.log("NOTICE: Can't read listings.json, generating one for you... the first listings check will not report any new found items.");
                    
                }
            });
        }, time);
    }
});

function saveListings(query) {
    ///...
}
