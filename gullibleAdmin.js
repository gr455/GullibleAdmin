const puppeteer = require('puppeteer');
const express = require('express');
const parser = require('body-parser');
const ejs = require('ejs');
const ip = require('ip');
const psl = require('psl');
const url = require('url');
const request = require('request');
const config = require('./config/config.json');
const prefs = require('./config/prefs.json');

/* Config */
const HOST_BLACKLIST = config.hostBlacklist || [];
const HOST_BLACKLIST_REGEX= config.hostBlacklistRegex || "$^";
const PROTOCOL_WHITELIST = config.protocolWhitelist || ["http:", "https:"];
const URL_REGEX =  config.urlRegex || /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/i;
const COOKIES = config.adminCookies || [];
const TIMEOUT = parseInt(config.pageTimeout) || 0;
/* End Config */

const app = express();
const browser = puppeteer.launch({ headless: true });

/* Middleware */
app.use(parser.urlencoded({ extended: false }));
app.use(parser.json());

// Middleware to validate Google ReCAPTCHA V2
const validateCaptchaV2 = (req, res, next) => {
	if(config.useReCaptchaV2 == false){
		next();
		return;
	}

	if(!process.env.CAPTCHA_SERVER_KEY || !process.env.CAPTCHA_SITE_KEY){
		res.redirect('/?flashError=Site owner has not set captcha keys');
		return;
	}

	if(!req.body['g-recaptcha-response']){
		res.redirect('/?flashError=Invalid captcha');
		return;
	}

	const apiUrl = `https://google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SERVER_KEY}&response=${req.body['g-recaptcha-response']}&remoteip=${req.connection.remoteAddress}`;

	request(apiUrl, (err, response, body) => {
		body = JSON.parse(body);
		if(!body.success){
			console.error("failed");
			res.redirect('/?flashError=Invalid captcha');
			return;
		}

		next();
	})
}
/* End Middleware */

/* Helpers */
const isBlacklisted = (hostname) => {
	if(hostname.match(HOST_BLACKLIST_REGEX) ||
		HOST_BLACKLIST.includes(hostname))

		return true;

	return false;
}

/* End Helpers */

/* Controllers */
app.get('/', async(req, res) => {
	let ctx = {data: {}, prefs: prefs};
	ctx['flashError'] = req.query.flashError;
	ctx['flashSuccess'] = req.query.flashSuccess;

	ctx['captchaSiteKey'] = process.env.CAPTCHA_SITE_KEY;
	ctx['usingRecaptcha2'] = config.useReCaptchaV2;
	res.status(200).render('bot.ejs', ctx);
});

app.post('/bot', validateCaptchaV2, async(req, res) => {
	let url = req.body.url;
	// Check captcha if used

	

	// Check if URL is valid
	if(!url || !url.match(URL_REGEX)){
		console.error("No valid URL");
		res.redirect("/?flashError=Invalid URL");
		return;
	}

	let parsedURL;
	try{
		parsedURL = new URL(url);
	}catch(e){
		console.error(e);
		res.redirect("/?flashError=Invalid URL");
		return;
	}
	
	// Disallow routing to private IPs
	if(ip.isPrivate(parsedURL.hostname)){
		res.redirect("/?flashError=Cannot route to private IP");
		return;
	}

	// Disallow blacklisted hosts
	if(isBlacklisted(parsedURL.hostname)){
		res.redirect("/?flashError=Hostname is blacklisted");
		return;
	}

	var wdw;
	try{
		wdw = await (await browser).createIncognitoBrowserContext();
		var page = await wdw.newPage();
		await page.setCookie(...COOKIES);
		await page.goto(url);
		setTimeout(() => {
			wdw.close();

		}, TIMEOUT);

	}catch(e){
		wdw.close();
		console.error(e);
		res.redirect("/?flashError=Something went wrong");
		return;

	}


	res.redirect("/?flashSuccess=The bot has visited the URL");
})

const port = process.env.GADMIN_PORT || 31337;
console.log(`Server started on port ${port}`);
app.listen(port)

/* End Controllers */
