var Crawler = require("crawler");
var _ = require('underscore');
var fs = require('fs');

const domain = process.env.URL;
const links = [];
const links_file = "links.csv";
const specs_dir = 'specs'

// // Create specs dir if it's missing
// if (fs.existsSync(specs_dir)){
//     fs.mkdirSync(specs_dir);
// }

var c = new Crawler({
    maxConnections : 10,
    // This will be called for each crawled page
    callback : function (error, res, done) {
        if(error) {
            console.log(error);
        } else{
            var $ = res.$;
            // $ is Cheerio by default
            //a lean implementation of core jQuery designed specifically for the server
            let pageLinks = $("a")
            _.each(pageLinks, function(key, value, obj) {
                let link = key.attribs.href;

                if(link){
                    if(link.indexOf('https://') === 0 || link.indexOf('http://') === 0) {
                        // Should be an absolute path
                        if(link.indexOf(domain) === 0) {
                            if(links.indexOf(link) === -1) {
                                fs.appendFile(links_file, link + '\n', function(err) {
                                    if(err) {
                                        return console.log(err);
                                    }
                                });
                                links.push(link)
                                c.queue(link)
                            }
                        }
                    } else {
                        // Should be a relative path
                        link = link[0] === '/' ? `${domain}${link}` : `${domain}/${link}`
                        if(links.indexOf(link) === -1) {
                            links.push(link)
                            fs.appendFile(links_file, link + '\n', function(err) {
                                if(err) {
                                    return console.log(err);
                                }
                            });
                            c.queue(link)
                        }
                    }
                }
            });
        }
        done();
    }
});

// Queue just one URL, with default callback
c.queue(domain);
