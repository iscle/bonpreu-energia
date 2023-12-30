const puppeteer = require('puppeteer');

const USERNAME = '';
const PASSWORD = '';

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
    });
    const page = await browser.newPage();

    console.log('Loading page...');
    await page.goto('http://energia.bonpreuesclat.cat/');

    console.log('Logging in...');
    await page.type('#j_username', USERNAME);
    await page.type('#j_password', PASSWORD);
    await page.click('#loginButton');

    console.log('Waiting for redirection...');
    await page.waitForNavigation();

    console.log('Waiting for invoices...');
    const invoicesResponse = await page
        .waitForResponse(response => response.url().includes('invoices'))
        .then(response => response.json());

    console.log('Invoices received!')

    invoicesResponse['items'].forEach(invoice => {
        invoice['energy_per_period']
            .map(period => {
                const consumption = period['consumption']
                const periodName = period['period']

                // Period 2.0TD (P1)
                const periodNumber = periodName.match(/\(P(\d)\)/)[1]

                return {
                    consumption,
                    period: periodNumber,
                }

            })
            .sort((a, b) => a.period - b.period)
            .forEach(period => {
                console.log(`Period ${period.period} - ${period.consumption}kWh`);
            })

        const amountTotal = invoice['amount_total']
        console.log(`Total amount: ${amountTotal}€`);
    });

    await browser.close();
})();