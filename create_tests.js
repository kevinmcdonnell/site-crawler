fs = require('fs');
_ = require('underscore');


const template_file = "template/test.js";
const links = "links.csv";

var template = fs.readFileSync(template_file, "utf8");
var compiled = _.template(template);

const urls = fs.readFileSync(links, "utf8").split('\n');

// Create a spec file for each url
let count = 0;
urls.forEach(function (url) {
    count++;
    output = compiled({test_url: url});
    fs.writeFile(`specs/test${count}.spec.js`, output);
})
