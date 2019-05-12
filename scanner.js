const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const URL_FORMAT = "https://www.ebay.com/sch/", FILE_FORMAT_LISTINGS = "./listings/";
var PAGE_DEPTH = 1, ITEMS_PER_REQUEST = 25;

console.log("scanner started...");
fs.mkdir(FILE_FORMAT_LISTINGS, () => {});
fs.readFile('./options.json', function callback(error, data) {
    if(error) {
        console.log("NOTICE: Can't read options.json, generating one for you... please restart with updated options.json.");
        console.log(error);
        let json = {
            time: 60,
            keywords: ['bunny', 'rabbit', 'wafer'],
            items_per_request: 25,
            page_depth: 1
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
        ITEMS_PER_REQUEST = json.items_per_request;
        PAGE_DEPTH = json.page_depth;
        console.log("Keywords: " + keywords + "\nIPR: " + ITEMS_PER_REQUEST + "\nPage Depth: " + PAGE_DEPTH);
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
    let all_links = [];
    fs.readFile(fileString, function callback(err, data) {
        for(let i = 0; i <= PAGE_DEPTH-1; i++) {
            console.log("SCRAPING PG " + (i+1) + " OF " + PAGE_DEPTH);
            scrapeLinks(query, 1, ITEMS_PER_REQUEST, function callback(links) {
                all_links = [].concat(all_links, links);
                if((i+1) == PAGE_DEPTH) {
                    if(err) {
                        fs.writeFile(fileString, JSON.stringify(all_links, null, 2), (err) => {
                            if(err) {
                                console.log("NOTICE: Failed to write links to file on query " + query + ", stack will follow.");
                                console.log(err);
                            } else {
                                console.log("INFO: Writing " + all_links.length + " items to " + fileString);
                            }
                        });
                    } else {
                        fs.unlink(fileString, function callback(err) {
                            if(err) {
                                console.log("NOTICE: Failed to delete listings file " + fileString + ", stack will follow.");
                                console.log(err);
                                return null;
                            }
                        });
                        
                    }
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

function scrapeLinks(query, pageNumber, itemsPerRequest, callback) {
    let links = [], queryLink = URL_FORMAT + query + "&_ipg=" + itemsPerRequest + "&_pgn=" + pageNumber;
    console.log(queryLink);
    request(queryLink, (err, res, html) => {
        if(err) console.log(err);
        let $ = cheerio.load(html);
        $('#srp-river-results').find('ul > li > div > div > a').each((index, element) => {
            let link = $(element).attr('href');
            //40 times
            links.push(link);
        });
        callback(links);
    })
}