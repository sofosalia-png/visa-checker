


const { chromium } = require('playwright');
const nodemailer = require('nodemailer');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--lang=de-DE']
  });

  const context = await browser.newContext({
    locale: 'de-DE'
  });

  const page = await context.newPage();

  try {
    await page.goto('https://tevis.ekom21.de/fra/select2?md=35');

    await page.waitForSelector('text=Team');

    await page.evaluate(() => {
      const inputs = document.querySelectorAll('input');
      inputs.forEach(input => {
        if (input.value === '0') {
          input.value = '1';
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    });

    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'Weiter' }).click();

    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'OK' }).click();

    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Weiter' }).click();

    await page.waitForURL('**/suggest');

    const slots = await page.locator('button, a').all();

    let validSlotFound = false;

    for (const slot of slots) {
      const text = await slot.innerText().catch(() => '');

      if (/April|Mai|Juni/.test(text)) {
        validSlotFound = true;
        break;
      }
    }

    if (validSlotFound) {
      console.log('🎉 SLOT FOUND');

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'sofo.salia@gmail.com',
          pass: 'aanc aadg tajf mqun'
        }
      });

      await transporter.sendMail({
        from: 'sofo.salia@gmail.com',
        to: 'sofo.salia@gmail.com',
        subject: '🚨 Immigration Appointment Available',
        text: 'Book immediately: https://tevis.ekom21.de/fra/select2?md=35'
      });

    } else {
      console.log('No slots yet');
    }

  } catch (err) {
    console.error('ERROR:', err);
  }

  await browser.close();
})();
