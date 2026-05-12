async function getTableSchema() {
  const url = 'https://sbyizudifmqakzxjlndr.supabase.co/rest/v1/information_schema.columns?table_name=eq.partners&select=column_name,data_type';
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

    console.log('Status:', response.status);
    const data = await response.json();
    
    if (Array.isArray(data)) {
      console.log('Columns in partners table:');
      data.forEach(col => console.log(`  ${col.column_name} (${col.data_type})`));
    } else {
      console.log('Response:', data);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getTableSchema();
