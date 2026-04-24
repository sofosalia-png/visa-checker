const { chromium } = require('playwright');
const nodemailer = require('nodemailer');

const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

const sendEmail = async () => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL,
      pass: PASSWORD
    }
  });

  await transporter.sendMail({
    from: EMAIL,
    to: EMAIL,
    subject: '🚨 Visa slot available!',
    text: 'There is an appointment available before July!'
  });
};

const checkSlots = async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();

  try {
    await page.goto('https://tevis.ekom21.de/fra/select2?md=35');

    await page.waitForSelector('text=Team');

    await page.evaluate(() => {
      document.querySelectorAll('input').forEach(input => {
        if (input.value === '0') {
          input.value = '1';
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    });

    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'Weiter' }).click();
    await page.getByRole('button', { name: 'OK' }).click();
    await page.getByRole('button', { name: 'Weiter' }).click();

    await page.waitForURL('**/suggest');

    const content = await page.content();

    if (
      content.includes('April') ||
      content.includes('Mai') ||
      content.includes('Juni')
    ) {
      console.log('🎉 SLOT FOUND');
      await sendEmail();
    } else {
      console.log('No slots yet');
    }

  } catch (err) {
    console.error('ERROR:', err);
  }

  await browser.close();
};

(async () => {
  while (true) {
    await checkSlots();
    await new Promise(r => setTimeout(r, 2 * 60 * 1000)); // every 2 minutes
  }
})();
