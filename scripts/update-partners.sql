UPDATE partners 
SET 
  partnership_level = CASE 
    WHEN contact_info->>''email'' LIKE ''%gold%'' THEN ''gold''
    WHEN contact_info->>''email'' LIKE ''%platinium%'' OR contact_info->>''email'' LIKE ''%platinum%'' THEN ''platinium''
    WHEN contact_info->>''email'' LIKE ''%museum%'' THEN ''museum''
    WHEN contact_info->>''email'' LIKE ''%porttech%'' THEN ''gold''
    ELSE ''silver''
  END,
  partner_type = CASE
    WHEN contact_info->>''email'' LIKE ''%gold%'' THEN ''corporate''
    WHEN contact_info->>''email'' LIKE ''%platinium%'' OR contact_info->>''email'' LIKE ''%platinum%'' THEN ''corporate''
    WHEN contact_info->>''email'' LIKE ''%museum%'' THEN ''cultural''
    WHEN contact_info->>''email'' LIKE ''%porttech%'' THEN ''tech''
    WHEN contact_info->>''email'' LIKE ''%oceanfreight%'' THEN ''logistics''
    WHEN contact_info->>''email'' LIKE ''%coastal%'' THEN ''services''
    ELSE ''corporate''
  END;
