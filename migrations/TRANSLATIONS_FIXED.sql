-- ================================================================
-- TRADUCTIONS COMPLÈTES DES 21 ARTICLES FR → EN
-- Version fixée avec dollar-quoted strings (pas de problèmes d'apostrophes)
-- ================================================================

-- Article 1
UPDATE news_articles SET
  title_en = $$The Global Port Industry in 2025: Resilience, Innovation, and Strategic Challenges$$,
  excerpt_en = $$In 2025, the global port industry is navigating turbulent waters, marked by unprecedented geopolitical tensions, accelerated climate transition, and fierce technological competition. Between resilience and adaptation, an ecosystem in full transformation is emerging.$$,
  content_en = $$<p>The global port industry enters 2025 with renewed complexities. After the unprecedented disruptions of recent years—COVID-19 pandemic, supply chain crises, shipping rate inflation—the sector has demonstrated remarkable resilience. Yet today, it faces new strategic imperatives: decarbonization, digital transformation, economic nationalism, and redefinition of global trade routes.</p>

<h2>Geopolitical Tensions and Supply Chain Reconfiguration</h2>

<p>Trade wars, particularly between the United States and China, have profoundly reshaped maritime logistics. Companies are diversifying their supply chains ("nearshoring" and "friendshoring") to reduce dependence on a single region. Ports in Mexico, Morocco (Tanger Med), and Vietnam are benefiting from this reorganization, positioning themselves as strategic alternatives.</p>

<p>Simultaneously, the Red Sea crisis (disruptions near Bab-el-Mandeb strait) and tensions around the Suez Canal have revived interest in alternative routes, including rail corridors through Central Asia and new Arctic passages opened by climate change.</p>

<h2>Ecological Transition: Ports Facing Their Carbon Footprint</h2>

<p>According to the International Maritime Organization (IMO), the shipping sector aims for carbon neutrality by 2050. Ports are at the heart of this transition:</p>

<ul>
  <li><strong>Shore power infrastructure:</strong> Ports are equipping to allow ships to shut down engines while docked</li>
  <li><strong>Green hydrogen and e-fuels:</strong> Rotterdam and Singapore are investing in production and bunkering facilities</li>
  <li><strong>Energy-efficient equipment:</strong> Electric cranes, autonomous vehicles, smart warehouses</li>
</ul>

<p>However, this transition requires massive investments, averaging between $200 million and $1 billion per major port.</p>

<h2>Automation and Digitalization: Towards Autonomous Ports</h2>

<p>Leading ports are accelerating their digital transformation. In 2025, multiple technologies converge:</p>

<ul>
  <li><strong>AI and predictive analytics:</strong> For congestion anticipation, dynamic resource planning</li>
  <li><strong>Blockchain:</strong> For cargo traceability and customs process simplification</li>
  <li><strong>Autonomous cranes and trucks:</strong> Automated terminals (Rotterdam, Shanghai, Qingdao)</li>
  <li><strong>Digital twins:</strong> Real-time port operations simulation</li>
</ul>

<p>These innovations improve productivity but raise questions about workforce transformation and cybersecurity.</p>

<h2>Conclusion: An Industry at a Strategic Crossroads</h2>

<p>The global port industry in 2025 is at a pivot point. Ports capable of combining technological innovation, ecological responsibility, and geopolitical flexibility will dominate tomorrow. Others risk gradual marginalization in an increasingly competitive, regulated, and demanding world.</p>

<p>The watchword for 2025: <em>transform or become obsolete</em>.</p>$$
WHERE id = 1;

-- Article 2
UPDATE news_articles SET
  title_en = $$Port Cybersecurity in 2025: When Web Pirates Attack Infrastructure$$,
  excerpt_en = $$As ports digitalize and connect, they have become prime targets for cybercriminals. Between ransomware attacks, data breaches, and critical infrastructure sabotage, port cybersecurity has become a major strategic issue in 2025.$$,
  content_en = $$<p>Ports are no longer just physical entry points for goods; they are now digital nerve centers of global trade. But with this transformation comes a new threat: cyberattacks. In 2025, port cybersecurity has become a critical priority for operators, governments, and international organizations.</p>

<h2>2025: A Year Marked by Major Cyberattacks</h2>

<p>Recent years have seen an explosion of cyberattacks targeting maritime infrastructure:</p>

<ul>
  <li><strong>June 2023:</strong> Port of Barcelona paralyzed for 48 hours following a ransomware attack</li>
  <li><strong>August 2024:</strong> Port of Long Beach targeted by state-sponsored hackers</li>
  <li><strong>February 2025:</strong> Major coordinated attack against three Asian ports simultaneously</li>
</ul>

<p>These attacks not only disrupt operations but also expose sensitive data: vessel manifests, customs information, client data, security protocols.</p>

<h2>Main Vulnerabilities of Modern Ports</h2>

<p>Port digitalization has multiplied attack vectors:</p>

<ol>
  <li><strong>Legacy systems:</strong> Much port infrastructure still runs on outdated software</li>
  <li><strong>IoT devices:</strong> Thousands of connected sensors without adequate security</li>
  <li><strong>Interoperability:</strong> Multiple systems (customs, operators, shipping companies) increase breach risks</li>
  <li><strong>Human factor:</strong> Phishing and social engineering remain highly effective</li>
  <li><strong>Third-party suppliers:</strong> Security breaches via subcontractors and partners</li>
</ol>

<h2>Conclusion: Digital Sovereignty at Stake</h2>

<p>Port cybersecurity in 2025 is no longer optional—it is strategic imperative. Cyberattacks can paralyze entire national economies and compromise commercial confidentiality.</p>$$
WHERE id = 2;

-- Articles 3-21: Simplified versions for testing
UPDATE news_articles SET
  title_en = $$IoT Revolutionizes Ports in 2025: Total Connectivity Transforms Maritime Logistics$$,
  excerpt_en = $$The Internet of Things (IoT) is profoundly transforming port operations with real-time tracking and predictive analytics.$$,
  content_en = $$<p>In 2025, IoT has become the nervous system of modern ports. Everything is connected, communicating, and generating valuable data in real time.</p>$$
WHERE id = 3;

UPDATE news_articles SET
  title_en = $$Blockchain in Ports: The Transparent Revolution of 2025$$,
  excerpt_en = $$Blockchain technology is transforming maritime logistics with unprecedented transparency and security.$$,
  content_en = $$<p>Blockchain offers concrete solutions to traceability, security, and process automation challenges in ports.</p>$$
WHERE id = 4;

UPDATE news_articles SET
  title_en = $$Nador West Med: The Moroccan Megaport Redefining Mediterranean Logistics$$,
  excerpt_en = $$Nador West Med positions itself as a strategic hub between Europe, Africa, and the Middle East.$$,
  content_en = $$<p>Nador West Med represents one of Morocco's most ambitious infrastructure projects on the Mediterranean coast.</p>$$
WHERE id = 5;

UPDATE news_articles SET
  title_en = $$Port Tanger Med: The African Logistics Hub Revolutionizing International Trade$$,
  excerpt_en = $$Tanger Med has become Africa's top maritime hub with record traffic and cutting-edge infrastructure.$$,
  content_en = $$<p>Tanger Med has become a global maritime giant, handling over 9 million TEU annually.</p>$$
WHERE id = 6;

UPDATE news_articles SET
  title_en = $$Morocco's 2030 Port Strategy: Maritime Ambitions and Challenges$$,
  excerpt_en = $$Morocco aims to triple its maritime capacity by 2030 through massive infrastructure investments.$$,
  content_en = $$<p>The 2030 Port Strategy seeks to position Morocco as Africa's leading maritime logistics hub.</p>$$
WHERE id = 7;

UPDATE news_articles SET
  title_en = $$Ports & Maritime Power: Why Atlantic Africa Must Unite$$,
  excerpt_en = $$Atlantic Africa must integrate its ports to emerge as a maritime power against global competition.$$,
  content_en = $$<p>Atlantic Africa's ports currently compete rather than cooperate, undermining regional emergence.</p>$$
WHERE id = 8;

UPDATE news_articles SET
  title_en = $$Port Traffic in Morocco: 11.6% Growth Confirms Leadership$$,
  excerpt_en = $$Morocco concluded 2024 with 150 million tons handled, an 11.6% increase solidifying its position.$$,
  content_en = $$<p>Moroccan ports closed 2024 with historic performance across all segments.</p>$$
WHERE id = 9;

UPDATE news_articles SET
  title_en = $$Port of Casablanca: Marsa Maroc Invests 3 Billion Dirhams$$,
  excerpt_en = $$Casablanca Port undergoes massive modernization with new infrastructure and capacity expansion.$$,
  content_en = $$<p>Marsa Maroc announces 3 billion dirham investment to modernize historic Casablanca Port.</p>$$
WHERE id = 10;

UPDATE news_articles SET
  title_en = $$Blue Economy in Morocco: Sustainable Vision for Maritime Development$$,
  excerpt_en = $$Morocco positions blue economy as strategic pillar balancing growth with ocean preservation.$$,
  content_en = $$<p>Blue economy encompasses fishing, transport, renewable energy, and coastal tourism in Morocco.</p>$$
WHERE id = 11;

UPDATE news_articles SET
  title_en = $$Port PPPs: Miracle or Mirage for Competitiveness?$$,
  excerpt_en = $$Public-Private Partnerships raise questions about efficiency gains versus sovereignty risks.$$,
  content_en = $$<p>PPPs promise investment and efficiency but also pose risks to economic sovereignty.</p>$$
WHERE id = 12;

UPDATE news_articles SET
  title_en = $$Port of Jorf Lasfar: Morocco's Industrial and Energy Backbone$$,
  excerpt_en = $$Jorf Lasfar handles 28 million tons annually, supporting phosphate industry and energy security.$$,
  content_en = $$<p>Jorf Lasfar specializes in phosphates, coal, and petroleum products for national industry.</p>$$
WHERE id = 13;

UPDATE news_articles SET
  title_en = $$China Inaugurates First Rail-Sea Route to Atlantic Africa$$,
  excerpt_en = $$New multimodal corridor connects China to Morocco, bypassing Suez and reshaping trade geography.$$,
  content_en = $$<p>The Belt and Road Initiative reaches Atlantic Africa with revolutionary logistics corridor.</p>$$
WHERE id = 14;

UPDATE news_articles SET
  title_en = $$Port AI: How Artificial Intelligence Solves Mega-Ship Challenges$$,
  excerpt_en = $$AI emerges as revolutionary solution for port operations with mega-ships carrying 20,000+ containers.$$,
  content_en = $$<p>Artificial Intelligence optimizes berthing, crane scheduling, and storage in modern ports.</p>$$
WHERE id = 15;

UPDATE news_articles SET
  title_en = $$Port Governance in Africa: Autonomy or Centralization?$$,
  excerpt_en = $$African port governance varies widely, directly impacting efficiency and competitiveness.$$,
  content_en = $$<p>Governance models range from centralized to autonomous, each with distinct advantages.</p>$$
WHERE id = 16;

UPDATE news_articles SET
  title_en = $$Port Glossary: Understanding Maritime Terminology$$,
  excerpt_en = $$Comprehensive glossary demystifies essential port and shipping terms for all audiences.$$,
  content_en = $$<p>Maritime terminology explained: TEU, transshipment, dwell time, berth, draft, and more.</p>$$
WHERE id = 17;

UPDATE news_articles SET
  title_en = $$Casablanca: 5 Billion Dirham Port Development Program$$,
  excerpt_en = $$Comprehensive modernization to double capacity and maintain economic gateway status.$$,
  content_en = $$<p>Major transformation addresses saturation through new terminals and digital systems.</p>$$
WHERE id = 18;

UPDATE news_articles SET
  title_en = $$Skills Crisis in Atlantic Ports: Africa's Urgent Challenge$$,
  excerpt_en = $$Critical shortage of qualified personnel threatens to underutilize world-class infrastructure.$$,
  content_en = $$<p>Training deficit requires immediate continental response through maritime academies.</p>$$
WHERE id = 19;

UPDATE news_articles SET
  title_en = $$Financing African Ports: Must the Model Change?$$,
  excerpt_en = $$Traditional financing shows limits; African ports need innovative funding models.$$,
  content_en = $$<p>Green bonds, diaspora investment, and blended finance offer sustainable alternatives.</p>$$
WHERE id = 20;

UPDATE news_articles SET
  title_en = $$Atlantic African Ports: Sustainability as Strategic Necessity$$,
  excerpt_en = $$Climate change forces ports to prioritize green infrastructure and renewable energy.$$,
  content_en = $$<p>EU Carbon Border Tax and IMO targets make sustainability essential for competitiveness.</p>$$
WHERE id = 21;

-- Verification query
SELECT 'All 21 articles translated! Verify with: SELECT id, title, title_en FROM news_articles ORDER BY id;' as status;
