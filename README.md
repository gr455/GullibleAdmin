# GullibleAdmin

An open-source XSS bot

## Run

1. Run npm install
2. Set your config options in config/ directory
3. Run node gullibleAdmin.js
4. Application will listen on port 31337 unless a GADMIN_PORT env var is set

## Configuration

Set the files in the config directory with your configuration options and preferences

### config/config.js
 - `useReCaptchaV2`(boolean): Whether or not to use Google reCAPTCHA v2
 - `hostBlacklist`(array[string]): Blacklist of hostnames (default: allows all)
 - `hostBlacklistRegex`(string): Hostnames matching the regex will be blacklisted (default: allows all)
 - `protocolWhitelist`(array[string]): Allowed protocols (default: http, https)
 - `urlRegex`(string): URLs not matching the regex will be blacklisted (default: general URL regex)
 - `adminCookies`(array[object]): Mentioned cookies will be set to the bot before URL visit
 - `pageTimeout`(integer): Time(in ms) for which the bot stays on the URL (default: 0)

All private IPs are blacklisted by default

### config/prefs.js

 - `customTitle`: Title of the view for the bot
 - `customHeading`: Text to display as a heading on the view