const { chromium } = require('playwright');
const nodemailer = require('nodemailer');

const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

const sendEmail = async () => {
  try {
    console.log('Sending email...');

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
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

    console.log('Email sent');
  } catch (e) {
    console.error('Email error:', e);
  }
};

const checkSlots = async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();

  try {
    await page.goto('https://tevis.ekom21.de/fra/select2?md=35');

    await page.waitForSelector('text=Team');

    // select 1 person
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

    // ONLY check actual clickable slots
    const buttons = await page.locator('button').all();

    let validSlotFound = false;

    for (const btn of buttons) {
      const text = await btn.innerText().catch(() => '');

      if (
        text.includes('April') ||
        text.includes('Mai') ||
        text.includes('Juni')
      ) {
        validSlotFound = true;
        break;
      }
    }

    console.log('TEST EMAIL TRIGGER');
await sendEmail();

  } catch (err) {
    console.error('ERROR:', err);
  }

  await browser.close();
};

(async () => {
  while (true) {
    await checkSlots();
    await new Promise(r => setTimeout(r, 120000)); // every 2 minutes
  }
})();
