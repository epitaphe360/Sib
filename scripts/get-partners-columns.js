async function getTableColumns() {
  const url = 'https://sbyizudifmqakzxjlndr.supabase.co/rest/v1/partners?select=*&limit=1';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
