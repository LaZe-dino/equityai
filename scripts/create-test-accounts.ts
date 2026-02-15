#!/usr/bin/env tsx
/**
 * Create test accounts for AD
 * Usage: npx tsx scripts/create-test-accounts.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xikswjbanjuwepbsqngj.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const accounts = [
  {
    email: 'ad.founder@equityai.test',
    password: 'TestPass123!',
    fullName: 'AD Founder',
    role: 'founder',
  },
  {
    email: 'ad.investor@equityai.test',
    password: 'TestPass123!',
    fullName: 'AD Investor',
    role: 'investor',
  },
];

async function createAccount(account: typeof accounts[0]) {
  console.log(`\nCreating ${account.role} account: ${account.email}`);

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers?.users.find(u => u.email === account.email);

  if (existingUser) {
    console.log(`  User already exists, deleting first...`);
    const { error: deleteError } = await supabase.auth.admin.deleteUser(existingUser.id);
    if (deleteError) {
      console.error(`  Error deleting existing user:`, deleteError.message);
      return;
    }
  }

  // Create the user
  const { data: userData, error: createError } = await supabase.auth.admin.createUser({
    email: account.email,
    password: account.password,
    email_confirm: true, // Auto-confirm email
    user_metadata: {
      full_name: account.fullName,
      role: account.role,
    },
  });

  if (createError) {
    console.error(`  Error creating user:`, createError.message);
    return;
  }

  if (!userData.user) {
    console.error(`  No user returned`);
    return;
  }

  console.log(`  ✓ User created: ${userData.user.id}`);

  // The trigger should have created the profile, but let's verify and update it
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userData.user.id)
    .single();

  if (profileError) {
    console.error(`  Error fetching profile:`, profileError.message);
    // Try to create profile manually
    const { error: insertError } = await supabase.from('profiles').insert({
      id: userData.user.id,
      email: account.email,
      full_name: account.fullName,
      role: account.role,
      onboarded: true, // Skip onboarding for test accounts
    });

    if (insertError) {
      console.error(`  Error creating profile:`, insertError.message);
      return;
    }
    console.log(`  ✓ Profile created manually`);
  } else {
    // Update profile to mark as onboarded
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ onboarded: true })
      .eq('id', userData.user.id);

    if (updateError) {
      console.error(`  Error updating profile:`, updateError.message);
    } else {
      console.log(`  ✓ Profile updated (onboarded: true)`);
    }
  }

  // If founder, create a sample company
  if (account.role === 'founder') {
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        founder_id: userData.user.id,
        name: 'Acme AI Labs',
        description: 'Building the future of AI-powered automation for enterprise workflows.',
        sector: 'Artificial Intelligence',
        stage: 'seed',
        website: 'https://acmeai.example.com',
        founded_year: 2024,
        team_size: 5,
        location: 'Austin, TX',
      })
      .select()
      .single();

    if (companyError) {
      console.error(`  Error creating company:`, companyError.message);
    } else {
      console.log(`  ✓ Sample company created: ${company.name}`);

      // Create a sample offering
      const { data: offering, error: offeringError } = await supabase
        .from('offerings')
        .insert({
          company_id: company.id,
          title: 'Seed Round - Acme AI Labs',
          description: 'Raising capital to expand our engineering team and accelerate product development.',
          offering_type: 'safe',
          target_raise: 2000000,
          minimum_investment: 25000,
          valuation_cap: 15000000,
          status: 'live',
          deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
          highlights: [
            'Experienced team with exits at Google and Meta',
            '10 paying enterprise customers',
            '$500K ARR growing 20% MoM',
            'Proprietary ML models with 40% efficiency gains',
          ],
          use_of_funds: [
            { category: 'Engineering', amount: 800000, description: 'Hire 4 senior engineers' },
            { category: 'Sales & Marketing', amount: 600000, description: 'Expand sales team and marketing' },
            { category: 'Operations', amount: 400000, description: 'Office, legal, and admin' },
            { category: 'Reserve', amount: 200000, description: 'Working capital reserve' },
          ],
        })
        .select()
        .single();

      if (offeringError) {
        console.error(`  Error creating offering:`, offeringError.message);
      } else {
        console.log(`  ✓ Sample offering created: ${offering.title}`);
      }
    }
  }

  // If investor, create investor profile
  if (account.role === 'investor') {
    const { error: investorError } = await supabase
      .from('investor_profiles')
      .insert({
        user_id: userData.user.id,
        accredited: true,
        investment_min: 25000,
        investment_max: 500000,
        sectors_of_interest: ['Artificial Intelligence', 'SaaS', 'Fintech', 'Healthcare'],
        stages_of_interest: ['pre-seed', 'seed', 'series-a'],
      });

    if (investorError) {
      console.error(`  Error creating investor profile:`, investorError.message);
    } else {
      console.log(`  ✓ Investor profile created`);
    }
  }

  console.log(`\n  ✅ Account ready!`);
  console.log(`     Email: ${account.email}`);
  console.log(`     Password: ${account.password}`);
}

async function main() {
  console.log('========================================');
  console.log('EquityAI Test Account Creator');
  console.log('========================================');

  for (const account of accounts) {
    await createAccount(account);
  }

  console.log('\n========================================');
  console.log('All accounts created successfully!');
  console.log('========================================');
  console.log('\nLogin credentials:');
  console.log('  Founder:  ad.founder@equityai.test / TestPass123!');
  console.log('  Investor: ad.investor@equityai.test / TestPass123!');
  console.log('\nYou can now log in at: http://localhost:3000/login');
}

main().catch(console.error);
