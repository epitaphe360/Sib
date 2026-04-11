async function getTableSchema() {
  const url = 'https://eqjoqgpbxhsfgcovipgu.supabase.co/rest/v1/information_schema.columns?table_name=eq.partners&select=column_name,data_type';
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
