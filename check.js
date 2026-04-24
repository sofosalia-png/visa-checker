console.log('SCRIPT STARTED');

const EMAIL = process.env.EMAIL;

async function sendEmail() {
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
        subject: 'TEST EMAIL',
        html: '<strong>This is a test email</strong>'
      })
    });

    console.log('Email sent');
  } catch (e) {
    console.error('Email error:', e);
  }
}

(async () => {
  console.log('TEST: sending email...');
  await sendEmail();
})();
