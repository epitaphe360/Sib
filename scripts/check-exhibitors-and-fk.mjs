const SUPABASE_URL = 'https://sbyizudifmqakzxjlndr.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const headers = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json'
};

async function main() {
  // 1. Get all exhibitors
  const exRes = await fetch(`${SUPABASE_URL}/rest/v1/exhibitors?select=id,user_id,company_name,website,description,contact_info&order=company_name`, { headers });
  const exhibitors = await exRes.json();
  if (!Array.isArray(exhibitors)) { console.log('ERROR fetching exhibitors:', JSON.stringify(exhibitors)); return; }
  console.log(`\n=== EXHIBITORS (${exhibitors.length}) ===`);
  exhibitors.forEach(e => console.log(`${e.id.substring(0,8)} | user_id=${e.user_id} | ${e.company_name} | web=${e.website}`));

  // 2. Get existing mini-sites
  const msRes = await fetch(`${SUPABASE_URL}/rest/v1/mini_sites?select=*`, { headers });
  const miniSites = await msRes.json();
  console.log(`\n=== MINI_SITES (${miniSites.length}) ===`);
  if (miniSites.length > 0) {
    miniSites.forEach(m => console.log(`${m.id.substring(0,8)} | exhibitor_id=${m.exhibitor_id} | published=${m.published}`));
  }

  // 3. Try inserting a mini-site with an exhibitor.id directly to test FK
  const testExhibitor = exhibitors[0];
  console.log(`\n=== TEST INSERT with exhibitor.id (${testExhibitor.id.substring(0,8)}) ===`);
  const testRes = await fetch(`${SUPABASE_URL}/rest/v1/mini_sites`, {
    method: 'POST',
    headers: { ...headers, 'Prefer': 'return=representation' },
    body: JSON.stringify({
      exhibitor_id: testExhibitor.id,
      theme: 'modern',
      custom_colors: { primaryColor: '#1a365d', secondaryColor: '#2b6cb0', accentColor: '#4299e1' },
      sections: [],
      published: false
    })
  });
  const testResult = await testRes.text();
  console.log(`Status: ${testRes.status}`);
  console.log(`Result: ${testResult}`);
  
  // If it failed, try with user_id
  if (testRes.status >= 400 && testExhibitor.user_id) {
    console.log(`\n=== TEST INSERT with user_id (${testExhibitor.user_id?.substring(0,8)}) ===`);
    const testRes2 = await fetch(`${SUPABASE_URL}/rest/v1/mini_sites`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify({
        exhibitor_id: testExhibitor.user_id,
        theme: 'modern',
        custom_colors: { primaryColor: '#1a365d', secondaryColor: '#2b6cb0', accentColor: '#4299e1' },
        sections: [],
        published: false
      })
    });
    const testResult2 = await testRes2.text();
    console.log(`Status: ${testRes2.status}`);
    console.log(`Result: ${testResult2}`);
  }
  
  // If both fail, try without FK (no exhibitor_id)
  if (testRes.status >= 400) {
    console.log(`\n=== TEST INSERT with NULL exhibitor_id ===`);
    const testRes3 = await fetch(`${SUPABASE_URL}/rest/v1/mini_sites`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify({
        theme: 'modern',
        custom_colors: { primaryColor: '#1a365d' },
        sections: [],
        published: false
      })
    });
    const testResult3 = await testRes3.text();
    console.log(`Status: ${testRes3.status}`);
    console.log(`Result: ${testResult3}`);
    
    // Clean up test
    if (testRes3.status === 201) {
      const parsed = JSON.parse(testResult3);
      const id = Array.isArray(parsed) ? parsed[0].id : parsed.id;
      await fetch(`${SUPABASE_URL}/rest/v1/mini_sites?id=eq.${id}`, { method: 'DELETE', headers });
      console.log('Test record cleaned up');
    }
  }
  
  // Clean up first test if it succeeded
  if (testRes.status === 201) {
    const parsed = JSON.parse(testResult);
    const id = Array.isArray(parsed) ? parsed[0].id : parsed.id;
    await fetch(`${SUPABASE_URL}/rest/v1/mini_sites?id=eq.${id}`, { method: 'DELETE', headers });
    console.log('Test record cleaned up');
  }
}

main().catch(console.error);
