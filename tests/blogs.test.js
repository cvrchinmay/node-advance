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

// login and create a new blog post
test('When logged in, can see blog create form', async() => {
    await page.login();
    await page.click('a.btn-floating');
    const label = await page.getContentsOf('form label');
    expect(label).toEqual('Blog Title')
})