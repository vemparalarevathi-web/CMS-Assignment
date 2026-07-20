require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Admin = require('../models/Admin');
const Page = require('../models/Page');

async function seed() {
  await connectDB();

  const username = process.env.SEED_ADMIN_USERNAME || 'admin';
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@renewcred.test';
  const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';

  let admin = await Admin.findOne({ email });
  if (!admin) {
    admin = await Admin.create({ username, email, password, role: 'admin' });
    console.log(`[seed] Created admin -> ${email} / ${password}`);
  } else {
    console.log(`[seed] Admin already exists -> ${email}`);
  }

  const existingPage = await Page.findOne({ slug: 'home' });
  if (!existingPage) {
    await Page.create({
      title: 'Home',
      slug: 'home',
      status: 'published',
      updatedBy: admin._id,
      blocks: [
        {
          type: 'header',
          order: 0,
          data: { text: 'Renewable Credit Scoring, Explained', level: 1 }
        },
        {
          type: 'paragraph',
          order: 1,
          data: {
            text: 'RenewCred combines traditional credit history with renewable-energy usage data to produce a more complete picture of financial reliability.'
          }
        },
        {
          type: 'header',
          order: 2,
          data: { text: 'How the score is calculated', level: 2 }
        },
        {
          type: 'list',
          order: 3,
          data: {
            ordered: false,
            items: [
              { text: 'Payment history' },
              {
                text: 'Energy usage signals',
                items: [{ text: 'Solar credit repayment' }, { text: 'Utility bill consistency' }]
              },
              { text: 'Credit utilization' }
            ]
          }
        },
        {
          type: 'table',
          order: 4,
          data: {
            headers: ['Factor', 'Weight'],
            rows: [
              ['Payment history', '35%'],
              ['Energy usage signals', '20%'],
              ['Credit utilization', '30%'],
              ['Length of history', '15%']
            ]
          }
        },
        {
          type: 'equation',
          order: 5,
          data: {
            equation: 'Score = 0.35P + 0.20E + 0.30U + 0.15L',
            displayMode: true
          }
        },
        {
          type: 'callout',
          order: 6,
          data: {
            text: 'This content is entirely managed from the admin CMS — edit or delete this page to see the public site update instantly.',
            variant: 'info'
          }
        }
      ]
    });
    console.log('[seed] Created sample page -> /home');
  } else {
    console.log('[seed] Sample page already exists -> /home');
  }

  await mongoose.disconnect();
  console.log('[seed] Done.');
}

seed().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
