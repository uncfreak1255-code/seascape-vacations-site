const fs = require('fs');
const indexHtml = fs.readFileSync('DEPLOY THIS FOLDER TO NETLIFY/index.html', 'utf8');
const propsHtml = fs.readFileSync('DEPLOY THIS FOLDER TO NETLIFY/properties/index.html', 'utf8');

// The goal is to apply the JS and UI updates from index.html into properties/index.html
// But properties/index.html has a different <title> and OpenGraph tags, and <div id="page-properties" class="page active">

// 1. Extract the <head> block from properties.html, up to </head>
const propHeadMatch = propsHtml.match(/<head>.*?(?=<\/head>)/s);
const propHead = propHeadMatch ? propHeadMatch[0] : '';

// 2. Take index.html and replace its <head> content with properties.html's <head> content
let newPropsHtml = indexHtml.replace(/<head>.*?(?=<\/head>)/s, propHead);

// 3. In the new properties.html, remove 'active' from page-home
newPropsHtml = newPropsHtml.replace('<div id="page-home" class="page active">', '<div id="page-home" class="page">');

// 4. In the new properties.html, add 'active' to page-properties
newPropsHtml = newPropsHtml.replace('<div id="page-properties" class="page">', '<div id="page-properties" class="page active">');

fs.writeFileSync('DEPLOY THIS FOLDER TO NETLIFY/properties/index.html', newPropsHtml);
console.log('Synced properties/index.html perfectly!');
