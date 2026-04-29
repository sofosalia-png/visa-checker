const { chromium } = require('playwright');

const EMAIL = 'sofo.salia@gmail.com';

async function sendEmail() {
  try {
    console.log('Sending email...');

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: [EMAIL],
        subject: '🚨 Appointment Found!',
        html: '<strong>There is a visa appointment available before July.</strong>',
      }),
    });

    const text = await response.text();
    console.log('Email response:', text);

  } catch (e) {
    console.error('Email error:', e);
  }
}

async function checkSlots() {
  const browser = await chromium.launch({
    args: ['--no-sandbox'],
    timeout: 60000
  });

  const page = await browser.newPage();

  page.setDefaultTimeout(90000);
  page.setDefaultNavigationTimeout(60000);

  try {
    console.log('Checking slots...');

    await page.goto('https://tevis.ekom21.de/fra/select2?md=35', {
      waitUntil: 'domcontentloaded'
    });

    await page.waitForSelector('text=Team');

    // Set number of persons to 1
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

    await Promise.race([
      page.waitForURL('**/suggest'),
      page.waitForSelector('button')
    ]);

    const buttons = await page.locator('button').all();

    let found = false;

    for (const btn of buttons) {
      const text = await btn.innerText().catch(() => '');

      if (
        (text.includes('April') ||
         text.includes('Mai') ||
         text.includes('Juni')) &&
        text.match(/\d{1,2}:\d{2}/)
      ) {
        found = true;
        break;
      }
    }

    if (found) {
      console.log('🎉 REAL SLOT FOUND');
      await sendEmail();
    } else {
      console.log('No slots yet');
    }

  } catch (err) {
    console.error('ERROR:', err);
  }

  await browser.close();
}

(async () => {
  console.log('SCRIPT STARTED');

  while (true) {
    await checkSlots();
    await new Promise(r => setTimeout(r, 120000)); // every 2 min
  }
})();
