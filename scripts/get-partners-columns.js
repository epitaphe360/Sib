async function getTableColumns() {
  const url = 'https://eqjoqgpbxhsfgcovipgu.supabase.co/rest/v1/partners?select=*&limit=1';
  const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.log('HTTP Status:', response.status);
      const text = await response.text();
      console.log('Response:', text);
      return;
    }

    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        console.log('Columns in partners table:');
        Object.keys(data[0]).forEach(col => console.log('  - ' + col));
      } else {
        console.log('Table is empty');
      }
    } else {
      const text = await response.text();
      console.log('Response text:', text);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getTableColumns();
