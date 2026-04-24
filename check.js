console.log('SCRIPT STARTED');

const EMAIL = sofo.sialia@gmail.com;

async function sendEmail() {
  try {
    console.log('Sending email via Resend...');

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: [sofo.sialia@gmail.com],
        subject: 'TEST EMAIL',
        html: '<strong>This is a test email</strong>'
      })
    });

    const data = await response.json();

    console.log('Resend response:', data);

  } catch (e) {
    console.error('Email error:', e);
  }
}

(async () => {
  console.log('TEST: sending email...');
  await sendEmail();
})();
