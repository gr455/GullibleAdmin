const puppeteer = require('puppeteer');
const express = require('express');
const parser = require('body-parser');
const ejs = require('ejs');
const config = require('./config/config.json');
const prefs = require('./config/prefs.json');

const HOST_BLACKLIST = [];
const PROTOCOL_WHITELIST = ["http:", "https:"];

const app = express();
const browser = puppeteer.launch();

/* Middleware */
app.use(parser.urlencoded({ extended: false }));
/* End Middleware */


/* Controllers */
app.get('/', async(req, res) => {
	let ctx = {data: {}, prefs: prefs};
	res.status(200).render('bot.ejs', ctx);
});

app.post('/bot', async(req, res) => {
	let url = req.body.url;
	console.log(url);
	try{
		let wdw = await (await (await browser).createIncognitoBrowserContext()).newPage();
		await wdw.goto(url);

	}catch(e){
		console.error(e);
		res.redirect("/");
	}


	res.redirect("/");
})

const port = process.env.GADMIN_PORT || 31337;
console.log(`Server started on port ${port}`);
app.listen(port)

/* End Controllers */
