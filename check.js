console.log('SCRIPT STARTED');
const { chromium } = require('playwright');

const EMAIL = process.env.EMAIL;

const sendEmail = async () => {
  try {
    console.log('Sending email via Resend...');

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Visa Checker <onboarding@resend.dev>',
        to: [EMAIL],
        subject: '🚨 Visa slot available!',
        html: '<strong>There is an appointment available before July!</strong>'
      })
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

    const checkSlots = async () => {
  console.log('TEST: sending email...');
  await sendEmail();
};

  } catch (err) {
    console.error('ERROR:', err);
  }

  await browser.close();
};

(async () => {
  console.log('SCRIPT STARTED');

  while (true) {
    console.log('RUNNING CHECK');

    try {
      await checkSlots();
    } catch (e) {
      console.error('CHECK FAILED:', e);
    }

    await new Promise(r => setTimeout(r, 120000));
  }
})();
