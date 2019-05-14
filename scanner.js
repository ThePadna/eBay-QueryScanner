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
        saveData('options.json', JSON.stringify(json));
    } else {
        let json = JSON.parse(data);
        let keywords = json.keywords, time = (json.time * 1000);
        ITEMS_PER_REQUEST = json.items_per_request;
        PAGE_DEPTH = json.page_depth;
        console.log("Keywords: " + keywords + "\nIPR: " + ITEMS_PER_REQUEST + "\nPage Depth: " + PAGE_DEPTH);
        console.log("Performing first listing check... scheduled for every " + (time / 1000) + " minute(s).");
        keywords.forEach(function callback(i) {
            saveListings(i);
        });
        setInterval(() => {
            keywords.forEach(function callback(i) {
                saveListings(i);
            });
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
                        saveData(fileString, JSON.stringify(all_links, null, 2));
                    } else {
                        let oldLinks = JSON.parse(data);
                        let linksUnsaved = findNewLinks(oldLinks, all_links);
                        if(linksUnsaved != null) {
                            fs.unlink(fileString, function callback(err) {
                                if(err) {
                                    console.log("NOTICE: Failed to delete listings file " + fileString + ", stack will follow.");
                                    console.log(err);
                                    return null;
                                }
                            });
                            saveData(fileString, JSON.stringify(all_links, null, 2));
                            console.log("New links found while querying (Have been saved):\n " + linksUnsaved);
                        } else {
                            //links identical
                        }
                    }
                }
            });
        }
    });
}

function saveData(fileName, data) {
    fs.writeFile(fileName, data, function callback(err) {
        if(err) {
            console.log("NOTICE: Failed to create file " + fileName + ", stack will follow.");
            console.log(err);
        } else {
            console.log("Saving data for file " + fileName);
        }
    });
}

function findNewLinks(linksArray, linksArrayNew) {
    let links = [];
    for(let i = 0; i < linksArrayNew.length; i++) {
        if(linksArray.indexOf(linksArrayNew[i]) === -1) {
            links.push(linksArrayNew[i]);
        }
    }
    if(links.length == 0) links = null;
    return links;
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
            links.push(link.substr(0, link.indexOf("?")));
        });
        callback(links);
    })
}