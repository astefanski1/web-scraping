const express = require('express');
const bodyParser = require('body-parser');
const app = express();

let fs = require('fs');
let request = require('request');
let cheerio = require('cheerio');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

app.listen(4200, () => {
    console.log('Application is listening on port: 4200');
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.post('/download', (req, res) => {
    getFormData(req.body);
    res.redirect("/");
});

function getFormData(data) {
    console.log("Form data passed by user: ");
    console.log(data);
    let site = data.site;
    let type = 'Metodologia_nauki';
    let maxLength = data.maxLength;
    let articlesNumber = data.articlesNumber;

    switch (site) {
        case 'wikipedia':
            let url = 'https://pl.wikipedia.org/wiki/Kategoria:' + type;
            getWebPageDataWikipedia(url, maxLength, articlesNumber, site);
    }
}

function getWebPageDataWikipedia(url, maxLength, articlesNumber, site) {
    request(url, (err, response, body) => {
        if (!err && response.statusCode === 200) {
            let links = [];
            let $ = cheerio.load(body);
            $('li', 'div#mw-pages').each(function () {
                links.push("https://pl.wikipedia.org" + $(this).children().attr('href'));
            });
            getArticles(links, maxLength, articlesNumber, site);
        }
    });
}

function getArticles(links, maxLength, articlesNumber, site) {
    if (articlesNumber !== undefined && articlesNumber > 0) {
        for (let index = 0; index < articlesNumber; index++) {
            saveArticle(links[index], index, site);
        }
    } else console.log("No articles number passed");
}

function saveArticle(url, articleNumber, site) {
    request(url, (err, response, body) => {
        if (!err && response.statusCode === 200) {
            let $ = cheerio.load(body);
            let article = " ";
            $('p', 'div#mw-content-text').each(function () {
                article += $(this).text();
            });
            console.log("Saving article from wikipedia.org");
            let file = __dirname + '/articles/' + site + '/' + articleNumber + '.txt';
            fs.writeFileSync(file, article);
        }
    });
}

exports = module.exports = app;