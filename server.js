const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const BI_ARTICLES_NUMBER_ON_PAGE = 50;

let fs = require('fs');
let path = require('path');
let request = require('request');
let cheerio = require('cheerio');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, '/')));

app.listen(4200, () => {
    console.log('Application is listening on port: 4200');
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

let buisnessInsiderCategoryLinks = [
    {value: 'https://businessinsider.com.pl/firmy', text: 'Firmy'},
    {value: 'https://businessinsider.com.pl/finanse', text: 'Finanse'},
    {value: 'https://businessinsider.com.pl/twoje-pieniadze', text: 'Twoje Pieniądze'},
    {value: 'https://businessinsider.com.pl/motoryzacja', text: 'Motoryzacja'},
    {value: 'https://businessinsider.com.pl/technologie', text: 'Technologie'},
    {value: 'https://businessinsider.com.pl/rozwoj-osobisty', text: 'Rozwój osobisty'},
    {value: 'https://businessinsider.com.pl/lifestyle', text: 'Lifestyle'},
    {value: 'https://businessinsider.com.pl/media', text: 'Media'},
];

app.post('/getCategories', function (req, res) {
    let url = req.body.site;
    request(url, (err, response, body) => {
        let category_links = [];
        let isCategory = true;
        let $ = cheerio.load(body);
        console.log(url);
        if (url === 'https://pl.wikipedia.org/wiki/Portal:Kategorie_G%C5%82%C3%B3wne') {
            $('td p a', 'div#bodyContent').each(function () {
                if ($(this).text() === 'Jak działają kategorie na Wikipedii?') isCategory = false;
                if (isCategory) {
                    category_links.push({
                        value: 'https://pl.wikipedia.org/wiki/Kategoria:' + $(this).text(),
                        text: $(this).text()
                    });
                }
            });
        } else if (url === 'https://businessinsider.com.pl/') {
            category_links = buisnessInsiderCategoryLinks;
        }
        res.send(category_links);
    });
});

app.post('/download', (req, res) => {
    getFormData(req.body);
    res.redirect("/");
});

function getFormData(data) {
    console.log(data);
    let site = data.site;
    let type = data.type;
    let maxLength = data.maxLength;
    let articlesNumber = data.articlesNumber;

    switch (site) {
        case 'https://pl.wikipedia.org/wiki/Portal:Kategorie_G%C5%82%C3%B3wne':
            getWebPageDataWikipedia(type, maxLength, articlesNumber, 'wikipedia');
            break;
        case 'https://businessinsider.com.pl/':
            getWebPageDataBuisnessInsider(type, maxLength, articlesNumber, 'buisness-insider');
            break;
    }
}

function getWebPageDataBuisnessInsider(url, maxLength, articlesNumber, site) {
    let links = [];
    let page;
    let pagesToDownload = Math.ceil(articlesNumber / BI_ARTICLES_NUMBER_ON_PAGE);
    let linksLength = pagesToDownload * BI_ARTICLES_NUMBER_ON_PAGE;
    for (let i = 1; i <= pagesToDownload; i++) {
        page = url + '?s=' + i;
        request(page, (err, response, body) => {
            if (!err && response.statusCode === 200) {
                let $ = cheerio.load(body);
                $('article h2 a', 'div.river').each(function () {
                    links.push($(this).attr('href'));
                });
            }
            if (links.length === linksLength) {
                getArticles(links, maxLength, articlesNumber, site);
            }
        });
        if (i === pagesToDownload) isDone = false;
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
            getArticleData(links[index], index, site);
        }
    } else console.log("No articles number passed");
}

function getArticleData(url, articleNumber, site) {
    if (site === 'wikipedia') {
        request(url, (err, response, body) => {
            if (!err && response.statusCode === 200) {
                let $ = cheerio.load(body);
                let article = " ";
                $('p', 'div#mw-content-text').each(function () {
                    article += $(this).text();
                });
                saveArticle(site, articleNumber, article);
            }
        });
    }
    if (site === 'buisness-insider') {
        request(url, (err, response, body) => {
            if (!err && response.statusCode === 200) {
                let $ = cheerio.load(body);
                let article = " ";
                $('p', 'div#content').each(function () {
                    article += $(this).text();
                });
                saveArticle(site, articleNumber, article);
            }
        });
    }
}

function getRandomKey() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function saveArticle(site, articleNumber, article) {
    console.log("Saving article from " + site);
    let file = __dirname + '/articles/' + site + '/' + articleNumber + "_" + getRandomKey() + '.txt';
    fs.writeFileSync(file, article);
}

exports = module.exports = app;