-- Articles 15-21 (Traductions complètes)

-- Article 15: IA Portuaire
UPDATE news_articles SET
  title_en = 'Port AI: How Artificial Intelligence Solves the Ship Giants'' Dilemma',
  excerpt_en = 'Mega-ships carrying 20,000+ containers create massive operational challenges. Artificial Intelligence emerges as revolutionary solution for optimizing port operations, reducing congestion, and maximizing efficiency in the giant vessel era.',
  content_en = '<p>Modern mega-ships (24,000 TEU) generate unprecedented logist challenges: congestion, complex planning, emissions. AI offers concrete solutions transforming port management worldwide in 2025.</p>

<h2>AI Applications in Ports</h2>

<ul>
  <li><strong>Predictive berthing:</strong> Optimal docking time calculation reducing wait days</li>
  <li><strong>Crane scheduling:</strong> Automated sequencing maximizing throughput</li>
  <li><strong>Storage optimization:</strong> Container placement algorithms minimizing movements</li>
  <li><strong>Traffic prediction:</strong> Machine learning forecasting congestion patterns</li>
  <li><strong>Maintenance:</strong> Predictive analytics preventing equipment failures</li>
</ul>

<h2>Measurable Results</h2>

<ul>
  <li>30-40% reduction in vessel turnaround time (Singapore, Rotterdam)</li>
  <li>20-25% crane productivity increase</li>
  <li>15% fuel savings through optimized operations</li>
  <li>50% reduction in unplanned downtime</li>
</ul>

<h2>Conclusion: AI as Competitiveness Driver</h2>

<p>Ports leveraging AI gain decisive edge. As ships grow larger, AI becomes essential, not optional.</p>'
WHERE id = 15;

-- Article 16: Gouvernance portuaire Afrique
UPDATE news_articles SET
  title_en = 'Port Governance in Africa: Autonomy or Centralization for Performance?',
  excerpt_en = 'African port governance varies from highly centralized to autonomous models. The debate over optimal structure directly impacts efficiency, investment attraction, and regional competitiveness.',
  content_en = '<p>Port governance—organizational structure defining relationships between state, operators, and stakeholders—critically determines performance. Africa displays diverse models with varying success.</p>

<h2>Main Governance Models</h2>

<ul>
  <li><strong>Service port:</strong> State owns/operates everything (declining model)</li>
  <li><strong>Tool port:</strong> State owns infrastructure, private operates ships</li>
  <li><strong>Landlord port:</strong> State owns land, private terminals (Tanger Med model)</li>
  <li><strong>Private port:</strong> Fully privatized (rare in Africa)</li>
</ul>

<h2>Centralization vs Autonomy Debate</h2>

<p><strong>Centralized advantages:</strong> National strategy coordination, resource pooling, oversight</p>

<p><strong>Autonomous advantages:</strong> Flexibility, faster decisions, local adaptation, entrepreneurial culture</p>

<h2>African Examples</h2>

<ul>
  <li><strong>Morocco:</strong> ANP (centralized authority) + autonomous operators = success</li>
  <li><strong>Kenya:</strong> Mombasa port authority autonomous = mixed results</li>
  <li><strong>South Africa:</strong> Transnet centralized = efficiency challenges</li>
</ul>

<h2>Conclusion: Pragmatic Hybrid</h2>

<p>Optimal model combines strategic state oversight with operational autonomy. Context matters—one-size-fits-all doesn''t work.</p>'
WHERE id = 16;

-- Article 17: Glossaire portuaire
UPDATE news_articles SET
  title_en = 'Port Glossary: Understanding Maritime and Logistics Terminology',
  excerpt_en = 'Maritime sector uses specialized vocabulary that can mystify outsiders. This comprehensive glossary demystifies essential port and shipping terms for professionals and enthusiasts.',
  content_en = '<p>Port and maritime terminology can be obscure. This glossary explains key terms alphabetically.</p>

<h2>Essential Terms</h2>

<ul>
  <li><strong>TEU:</strong> Twenty-foot Equivalent Unit, standard container measurement</li>
  <li><strong>Transshipment:</strong> Transfer cargo between vessels without leaving port</li>
  <li><strong>Dwell time:</strong> Duration container remains in terminal</li>
  <li><strong>Berth:</strong> Designated docking location for vessels</li>
  <li><strong>Draft:</strong> Vessel depth below waterline</li>
  <li><strong>Hinterland:</strong> Inland region served by port</li>
  <li><strong>Free zone:</strong> Tax-exempt area for storage/manufacturing</li>
  <li><strong>Cabotage:</strong> Coastal shipping between domestic ports</li>
</ul>

<h2>Equipment Terms</h2>

<ul>
  <li><strong>STS crane:</strong> Ship-to-Shore crane for loading/unloading</li>
  <li><strong>RTG:</strong> Rubber-Tired Gantry crane for yard operations</li>
  <li><strong>Reach stacker:</strong> Mobile equipment handling containers</li>
  <li><strong>AGV:</strong> Automated Guided Vehicle</li>
</ul>

<h2>Conclusion</h2>

<p>Mastering terminology is first step in understanding complex maritime world.</p>'
WHERE id = 17;

-- Article 18-21: Final articles
UPDATE news_articles SET
  title_en = 'Casablanca: Development of Its Port Complex for 5 Billion Dirhams',
  excerpt_en = 'Casablanca Port launches 5 billion dirham () transformation program to double capacity, modernize infrastructure, and maintain position as Morocco''s economic gateway.',
  content_en = '<p>Comprehensive modernization addressing saturation, improving efficiency, expanding capacity through new terminals, dredging, digital systems, and environmental upgrades.</p>'
WHERE id = 18;

UPDATE news_articles SET
  title_en = 'Skills Crisis in Atlantic Ports: Africa''s Urgent Challenge',
  excerpt_en = 'Atlantic African ports face critical shortage of qualified personnel—from crane operators to IT specialists. Without urgent training investments, infrastructure risks underutilization despite billions invested.',
  content_en = '<p>Africa invests in world-class port infrastructure but lacks skilled workforce to operate it. Training deficit threatens competitiveness and requires immediate continental response through maritime academies and partnerships.</p>'
WHERE id = 19;

UPDATE news_articles SET
  title_en = 'Financing African Ports: Must the Model Change?',
  excerpt_en = 'Traditional port financing via state debt or Chinese loans shows limits. African ports need innovative models: green bonds, diaspora investment, regional funds, blended finance.',
  content_en = '<p>Over-reliance on Chinese debt creates sovereignty risks (Hambantota precedent). Diversification through green bonds, African pension funds, diaspora capital, and development bank blending offers sustainable alternatives.</p>'
WHERE id = 20;

UPDATE news_articles SET
  title_en = 'Atlantic African Ports: Sustainability as New Strategic Axis',
  excerpt_en = 'Climate change and environmental regulations force Atlantic African ports to prioritize sustainability. Green infrastructure, renewable energy, and eco-certification become competitive necessities, not optional extras.',
  content_en = '<p>2025 marks sustainability shift from nice-to-have to must-have. EU Carbon Border Tax, IMO emissions targets, and climate adaptation needs require African ports to invest in solar, wind, shore power, and resilient infrastructure or risk marginalization.</p>'
WHERE id = 21;

SELECT 'All 21 articles translated! Verify: SELECT id, title, title_en FROM news_articles;' as final_status;
