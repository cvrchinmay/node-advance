const puppeteer = require('puppeteer');
const sessionFactory = require('./factories/sessionFactory');
const userFactory = require('./factories/userFactory');

let browser;
let page;

// it runs before every test
beforeEach(async () => {
    browser = await puppeteer.launch({
        headless: false,                                    // headless -> false will launch physical browser 
        args: ['--no-sandbox']
    });
    page = await browser.newPage();
    await page.goto('localhost:3000');
})

// it runs after every test
afterEach(async () => {
    await browser.close();
})

// validate header
test('the header has a correct text', async () => {
    const text = await page.$eval('a.brand-logo', el => el.innerHTML);
    expect(text).toEqual('Blogster');
})

// validate login flow
test('clicking on login starts oAuth Flow', async () => {
    await page.click('.right a');
    const url = await page.url();

    expect(url).toMatch(/accounts\.google\.com/)
})

// validate log out button
test.only('when signed in, show logout button', async () => {
    const user = await userFactory();
    const { session, sig } = sessionFactory(user);
    
    await page.setCookie({
        name: 'session',
        value: session
    })

    await page.setCookie({
        name: 'session.sig',
        value: sig
    })
    await page.goto('localhost:3000');

    await page.waitFor('a[href="/auth/logout"]');

    const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML);
    expect(text).toEqual('Logout');
})