`npm install playwright`

```js
import { chromium } from 'playwright';

const browser = await chromium.launch(
    { headless : true }
);

const page = await browser.newPage();

await page.goto(
    'https://www.amazon.com/s?k=relojes&__mk_es_US=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=32VA4L1GXY0CW&sprefix=reloje%2Caps%2C199&ref=nb_sb_noss_2'
);

const products = await page.$$eval(
    '.s-card-container',
    (results) => (
        results.map((el) => {
            const title = el.querySelector('h2')?.innerText;

            if (!title) {
                return null;
            }

            const image = el.querySelector('img').getAttribute('src');
            const price = el.querySelector('.a-price .a-offscreen')?.innerText;
            const link = el.querySelector('.a-link-normal')
                .getAttribute('href');
            
                return { title, image, price, link }
        })
    )
);

// Print the results
console.log(JSON.stringify(products));

await browser.close();
```