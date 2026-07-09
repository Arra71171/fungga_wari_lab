import puppeteer from 'puppeteer';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.static(path.join(__dirname, 'packages/ui/storybook-static')));

const server = app.listen(0, async () => {
  const port = server.address().port;
  console.log(`Server running on port ${port}`);
  
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  await page.goto(`http://localhost:${port}/iframe.html`, { waitUntil: 'networkidle0' });
  
  await browser.close();
  server.close();
});
