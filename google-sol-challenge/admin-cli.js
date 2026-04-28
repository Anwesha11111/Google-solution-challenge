#!/usr/bin/env node

// ============================================================
// admin-cli.js — Command-line admin tool for SEVA-OS
// Usage: node admin-cli.js <command> [args]
// ============================================================

require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

// ============================================================
// COMMANDS
// ============================================================

async function registerVolunteer() {
  console.log('\n📝 Register a new volunteer\n');

  const phone = await question('Phone (E.164, e.g., 919876543210): ');
  const pincode = await question('Pincode (6 digits): ');
  const skillsStr = await question('Skills (comma-separated: food,medical,shelter,safety): ');

  const skills = skillsStr.split(',').map(s => s.trim().toLowerCase());

  const { data, error } = await supabase
    .from('volunteers')
    .insert({
      phone_number: phone,
      pincode,
      skills,
      status: 'available',
      reliability_score: 100,
      total_impact: 0
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error:', error.message);
  } else {
    console.log('✅ Volunteer registered:', data);
  }
}

async function listVolunteers() {
  console.log('\n👥 All Volunteers\n');

  const { data, error } = await supabase
    .from('volunteers')
    .select('*')
    .order('total_impact', { ascending: false });

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  if (data.length === 0) {
    console.log('No volunteers registered.');
    return;
  }

  console.table(data.map(v => ({
    Phone: v.phone_number,
    Pincode: v.pincode,
    Skills: v.skills.join(', '),
    Status: v.status,
    Reliability: v.reliability_score,
    Impact: v.total_impact
  })));
}

async function listNeeds() {
  console.log('\n📋 All Needs\n');

  const { data, error } = await supabase
    .from('needs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  if (data.length === 0) {
    console.log('No needs recorded.');
    return;
  }

  console.table(data.map(n => ({
    ID: n.id.slice(0, 8),
    Category: n.category,
    Pincode: n.pincode,
    Urgency: n.urgency,
    Status: n.status,
    Created: new Date(n.created_at).toLocaleString()
  })));
}

async function listDispatches() {
  console.log('\n📡 All Dispatches\n');

  const { data, error } = await supabase
    .from('dispatches')
    .select('*, volunteers(phone_number), needs(category, pincode)')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  if (data.length === 0) {
    console.log('No dispatches recorded.');
    return;
  }

  console.table(data.map(d => ({
    ID: d.id.slice(0, 8),
    Volunteer: d.volunteers.phone_number,
    Category: d.needs.category,
    Pincode: d.needs.pincode,
    Status: d.status,
    Created: new Date(d.created_at).toLocaleString()
  })));
}

async function getStats() {
  console.log('\n📊 Statistics\n');

  const [
    { data: volunteers },
    { data: needs },
    { data: dispatches }
  ] = await Promise.all([
    supabase.from('volunteers').select('*'),
    supabase.from('needs').select('*'),
    supabase.from('dispatches').select('*')
  ]);

  const totalImpact = volunteers.reduce((sum, v) => sum + v.total_impact, 0);
  const avgReliability = (volunteers.reduce((sum, v) => sum + v.reliability_score, 0) / volunteers.length).toFixed(1);
  const resolvedNeeds = needs.filter(n => n.status === 'resolved').length;
  const completedDispatches = dispatches.filter(d => d.status === 'done').length;

  console.log(`Total Volunteers:      ${volunteers.length}`);
  console.log(`Total Needs:           ${needs.length}`);
  console.log(`Resolved Needs:        ${resolvedNeeds} (${((resolvedNeeds / needs.length) * 100).toFixed(1)}%)`);
  console.log(`Total Dispatches:      ${dispatches.length}`);
  console.log(`Completed Dispatches:  ${completedDispatches}`);
  console.log(`Total Impact:          ${totalImpact} lives helped`);
  console.log(`Avg Reliability Score: ${avgReliability}/100`);
}

async function topVolunteers() {
  console.log('\n🏆 Top Volunteers by Impact\n');

  const { data, error } = await supabase
    .from('volunteers')
    .select('*')
    .order('total_impact', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  console.table(data.map((v, i) => ({
    Rank: i + 1,
    Phone: v.phone_number,
    Impact: v.total_impact,
    Reliability: v.reliability_score,
    Status: v.status
  })));
}

async function resetVolunteer() {
  const phone = await question('Phone number to reset: ');

  const { error } = await supabase
    .from('volunteers')
    .update({
      status: 'available',
      reliability_score: 100
    })
    .eq('phone_number', phone);

  if (error) {
    console.error('❌ Error:', error.message);
  } else {
    console.log('✅ Volunteer reset to available');
  }
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  const command = process.argv[2];

  const commands = {
    register: registerVolunteer,
    list: listVolunteers,
    needs: listNeeds,
    dispatches: listDispatches,
    stats: getStats,
    top: topVolunteers,
    reset: resetVolunteer
  };

  if (!command || !commands[command]) {
    console.log(`
SEVA-OS Admin CLI

Usage: node admin-cli.js <command>

Commands:
  register    Register a new volunteer
  list        List all volunteers
  needs       List all needs
  dispatches  List recent dispatches
  stats       Show system statistics
  top         Show top volunteers
  reset       Reset a volunteer's status

Example:
  node admin-cli.js register
  node admin-cli.js stats
    `);
    rl.close();
    return;
  }

  try {
    await commands[command]();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }

  rl.close();
}

main();
