const Page = require('./helpers/page');

let page;

// it runs before every test
beforeEach(async () => {
    page = await Page.build();
    await page.goto('localhost:3000');
})

// it runs after every test
afterEach(async () => {
    await page.close();
})

// validate header
test('the header has a correct text', async () => {
    const text = await page.getContentsOf('a.brand-logo');
    expect(text).toEqual('Blogster');
})

// validate login flow
test('clicking on login starts oAuth Flow', async () => {
    await page.click('.right a');
    const url = await page.url();

    expect(url).toMatch(/accounts\.google\.com/)
})

// validate log out button
test('when signed in, show logout button', async () => {
    await page.login();
    const text = await page.getContentsOf('a[href="/auth/logout"]');
    expect(text).toEqual('Logout');
})