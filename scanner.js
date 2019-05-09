const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const URL_FORMAT = "https://www.ebay.com/sch/", FILE_FORMAT_LISTINGS = "./listings/";

console.log("scanner started...");
fs.readFile('./options.json', function callback(error, data) {
    if(error) {
        console.log("NOTICE: Can't read options.json, generating one for you... please restart with updated options.json.");
        console.log(error);
        let json = {
            time: 60,
            keywords: ['keyword1', 'keyword2', 'keyword3']
        };
        fs.writeFile('options.json', JSON.stringify(json), function callback(err) {
            if(err) {
                console.log("NOTICE: Error creating options.json.. log will follow.");
                console.log(err);
            }
        });
    } else {
        let json = JSON.parse(data);
        let keywords = json.keywords, time = (json.time * 1000);
        console.log("Performing first listing check... scheduled for every " + (time / 1000) + " minute(s).");
        keywords.forEach(function callback(i) {
            let newItems = saveListings(i);
            if(newItems === null) {
                console.log("NOTICE: there was a problem comparing items with new listings on keyword " + i + ".");
            } else {
                //notify
            }
        });
        setInterval(() => {
        }, time);
    }
});

function saveListings(query) {
    let fileString = FILE_FORMAT_LISTINGS + query + ".json";
    fs.readFile(fileString, function callback(err, data) {
        console.log("got ere");
        request(URL_FORMAT + query, function callback(err, res, html) {
            if(err || res.statusCode != 200) {
                console.log("NOTICE: Failed to query eBay for listings on query " + query + ", stack will follow.");
                console.log(err);
            } else {
                let $ = cheerio.load(html);
                console.log("cheerio loaded html");
            }
        });
        if(err) {
        } else {
            fs.unlink(fileString, function callback(err) {
                if(err) {
                    console.log("NOTICE: Failed to delete listings file " + fileString + ", stack will follow.");
                    console.log(err);
                    return null;
                }
            });
            
        }
    });
}

function saveData(fileName, jsonData) {
    fs.writeFile(fileName, jsonData, function callback(err) {
        if(err) {
            console.log("NOTICE: Failed to create file " + fileName + ", stack will follow.");
            console.log(err);
        } else {
            console.log("Saving data for file " + fileName);
        }
    });
}

function compare(data, data1) {
    return true;
}