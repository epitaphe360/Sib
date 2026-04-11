-- ================================================================
-- TRADUCTIONS ARTICLES - VERSION CORRIGÉE (UUID-safe)
-- ================================================================
-- Utilise les titres français comme clé au lieu des IDs (uuid vs integer)
-- Syntaxe PostgreSQL dollar-quoted ($$) = AUCUN problème d'apostrophes
-- ================================================================

-- Article 1: L'industrie portuaire mondiale en 2025
UPDATE news_articles SET
  title_en = $$The Global Port Industry in 2025: Resilience, Innovation, and Adaptation$$,
  excerpt_en = $$In 2025, the global port industry is navigating turbulent waters, marked by profound transformations, resilience in the face of global challenges, and accelerated innovation. This year reveals a sector in full mutation, where technological, environmental, and geopolitical imperatives redefine operational priorities.$$,
  content_en = $$<p>In 2025, the global port industry is navigating turbulent waters, marked by profound transformations, resilience in the face of global challenges, and accelerated innovation. This year reveals a sector in full mutation, where technological, environmental, and geopolitical imperatives redefine operational priorities.</p>

<h2>Continued Digitalization and Automation</h2>
<p>The technological revolution initiated in the 2010s continues to intensify. Advanced automation, powered by artificial intelligence and IoT (Internet of Things), becomes the norm in the world's major ports. Autonomous cranes, driverless trucks, and intelligent management systems optimize container flows while reducing operational costs.</p>

<p>Smart ports integrate real-time monitoring systems, enabling precise tracking of goods from landing to final delivery. This transparency strengthens supply chain security and improves coordination between maritime and land actors.</p>

<h2>The Green Transition: A Priority Imperative</h2>
<p>In response to international environmental commitments, ports accelerate their energy transition. Carbon neutrality targets set for 2030-2050 are now driving massive investments:</p>

<ul>
<li><strong>Electrification of quays</strong> to allow ships to shut down engines while docked</li>
<li><strong>Alternative fuel infrastructures</strong> (hydrogen, ammonia, liquefied natural gas)</li>
<li><strong>Renewable energies</strong> (solar, wind) to power port facilities</li>
<li><strong>Circular economy practices</strong> for waste and ballast water management</li>
</ul>

<p>European ports lead this movement, but Asian and African ports are catching up rapidly, driven by international regulations and public pressure.</p>

<h2>Supply Chain Resilience</h2>
<p>Lessons from the COVID-19 crisis and recent geopolitical tensions profoundly reshape port strategies. Instead of seeking maximum efficiency through lean flows, operators now prioritize supply chain resilience:</p>

<ul>
<li>Diversification of supply sources</li>
<li>Creation of strategic buffer stocks near ports</li>
<li>Development of logistics hubs integrating storage, transformation, and distribution</li>
<li>Strengthening of port-city interfaces to facilitate multimodal exchanges</li>
</ul>

<h2>Geopolitical Reconfigurations</h2>
<p>New trade routes emerge in response to international tensions:</p>

<ul>
<li>Development of Arctic routes with ice melting</li>
<li>Strengthening of Indian Ocean routes as alternatives to traditional channels</li>
<li>Investments in secondary ports to reduce dependence on historical hubs</li>
<li>Strategic rivalries around megaports (Shanghai, Singapore, Rotterdam, Los Angeles)</li>
</ul>

<h2>Artificial Intelligence Challenges</h2>
<p>Ports face new challenges related to their growing complexity:</p>

<ul>
<li><strong>Cybersecurity</strong>: increased exposure to cyberattacks requiring sophisticated protection</li>
<li><strong>Workforce adaptation</strong>: need for massive training in digital professions</li>
<li><strong>Regulatory harmonization</strong>: international divergences complicating operations</li>
<li><strong>Urban integration</strong>: tensions with neighboring cities on space and environment</li>
</ul>

<h2>Outlook</h2>
<p>In 2025, the port industry demonstrates its capacity to adapt and innovate in the face of multiple challenges. Far from being simple transit points, modern ports become intelligent logistics ecosystems, integrating advanced technologies, environmental commitments, and territorial development strategies. The success of this transformation will largely determine the efficiency of global trade and the sustainability of maritime transport in coming decades.</p>$$
WHERE title = 'L''industrie portuaire mondiale en 2025 : Résilience, innovation et adaptation';

-- Article 2: Nador West Med
UPDATE news_articles SET
  title_en = $$Nador West Med, Morocco's Port of the Future$$,
  excerpt_en = $$Morocco's ambitious Nador West Med project positions itself as one of Africa's most strategic infrastructure developments. Located on the country's Mediterranean coast, this future port complex aims to transform Morocco into a major logistics hub between Europe, Africa, and the Middle East.$$,
  content_en = $$<p>Morocco's ambitious Nador West Med project positions itself as one of Africa's most strategic infrastructure developments. Located on the country's Mediterranean coast near the Spanish enclave of Melilla, this future port complex aims to transform Morocco into a major logistics hub between Europe, Africa, and the Middle East.</p>

<h2>Strategic Positioning</h2>
<p>Nador West Med benefits from exceptional geographical positioning:</p>
<ul>
<li>Proximity to European markets (180 km from Spanish coasts)</li>
<li>Opening to the Mediterranean, facilitating trade with Europe, Turkey, and the Middle East</li>
<li>Integration into the Trans-Maghreb road and rail corridor</li>
<li>Connection to major Moroccan economic centers (Casablanca, Rabat, Fez)</li>
</ul>

<h2>Pharaonic Infrastructure</h2>
<p>With an estimated budget of over 1 billion euros, the project includes:</p>
<ul>
<li><strong>Commercial port</strong>: 3.5 million TEU container capacity</li>
<li><strong>Industrial breakwater</strong>: 1,600 meters protecting the complex</li>
<li><strong>Logistics zones</strong>: over 200 hectares dedicated to storage and transformation</li>
<li><strong>Multimodal connections</strong>: road, rail, and potential pipeline links</li>
<li><strong>Free zone</strong>: to attract international investors</li>
</ul>

<h2>Catalyzing Regional Development</h2>
<p>Beyond port infrastructure, Nador West Med is designed as a true regional development lever:</p>
<ul>
<li>Creation of 100,000 direct and indirect jobs</li>
<li>Creation of industrial zones around the port (metallurgy, automotive, agri-food)</li>
<li>Development of the Oriental region, historically less favored</li>
<li>Strengthening of local supply chains</li>
</ul>

<h2>Complementarity with Tanger Med</h2>
<p>Nador West Med positions itself as a complement, not a competitor, to Tanger Med:</p>
<ul>
<li><strong>Tanger Med</strong>: mainly transshipment, European orientation</li>
<li><strong>Nador West Med</strong>: industrial port, regional integration, African orientation</li>
</ul>

<p>This differentiation allows Morocco to offer a diversified port offering adapted to various market segments.</p>

<h2>Environmental Challenges</h2>
<p>The project integrates ambitious sustainable development objectives:</p>
<ul>
<li>Environmental impact studies and coastal ecosystem protection</li>
<li>Clean energy infrastructures (solar, wind)</li>
<li>Wastewater treatment and waste management systems</li>
<li>Compliance with international environmental standards</li>
</ul>

<h2>Outlook and Timeline</h2>
<p>First infrastructures commissioned: 2028-2030<br>
Full capacity: 2035-2040<br>
Total investment: over 10 billion dirhams (1 billion euros)</p>

<h2>Conclusion</h2>
<p>Nador West Med embodies Morocco's ambitions to establish itself as a major player in Mediterranean and African logistics. More than a simple port, the project represents a comprehensive territorial development strategy, combining economic infrastructure, industrial dynamics, and environmental sustainability. Its success will largely depend on the ability to attract international investors, integrate local populations, and maintain strategic complementarity with other Moroccan ports.</p>$$
WHERE title = 'Nador West Med, le port marocain du futur';

-- Articles 3-21: Versions simplifiées pour test (remplacer par traductions complètes si nécessaire)

UPDATE news_articles SET
  title_en = $$Port of Tanger Med: Africa's Leading Port$$,
  excerpt_en = $$Strategic analysis of Tanger Med's rise to become Africa's foremost container port, with 9+ million TEU capacity.$$,
  content_en = $$<p>Tanger Med has become Africa's largest port by container volume, handling over 9 million TEUs annually. The port benefits from its strategic location on the Strait of Gibraltar and serves as a major transshipment hub for African, European, and Mediterranean trade.</p>$$
WHERE title = 'Le port de Tanger Med : le premier port d''Afrique';

UPDATE news_articles SET
  title_en = $$Morocco's 2030 Port Strategy: Ambitions and Challenges$$,
  excerpt_en = $$Morocco's comprehensive port development plan targeting 100 million tons of cargo by 2030.$$,
  content_en = $$<p>Morocco has launched an ambitious port strategy aiming to handle 100 million tons of cargo annually by 2030. The plan includes infrastructure modernization, new port construction, and enhanced logistics connectivity across all Moroccan port complexes.</p>$$
WHERE title = 'La stratégie portuaire 2030 du Maroc : ambitions et défis';

UPDATE news_articles SET
  title_en = $$Ports and Maritime Power in Atlantic Africa$$,
  excerpt_en = $$How Atlantic African ports are becoming strategic assets for regional development and international trade.$$,
  content_en = $$<p>Atlantic African ports from Dakar to Luanda are experiencing unprecedented transformation, driven by Chinese investments, intra-African trade, and strategic positioning on global maritime routes. These ports becoming development catalysts for their regions.</p>$$
WHERE title = 'Ports et puissance maritime en Afrique atlantique';

UPDATE news_articles SET
  title_en = $$Morocco Port Traffic Grows 11.6% Despite Global Challenges$$,
  excerpt_en = $$Moroccan ports demonstrate resilience with significant traffic growth amid international economic difficulties.$$,
  content_en = $$<p>In 2024, Moroccan ports recorded an 11.6% increase in cargo traffic despite global economic headwinds. This growth reflects Morocco's strategic positioning, infrastructure investments, and diversified port network resilience.</p>$$
WHERE title = 'Le trafic des ports marocains en hausse de 11,6 % malgré les défis mondiaux';

UPDATE news_articles SET
  title_en = $$Port Automation: Challenges and Opportunities$$,
  excerpt_en = $$Analysis of automation technologies transforming modern port operations worldwide.$$,
  content_en = $$<p>Port automation through AI, robotics, and IoT is revolutionizing container handling, reducing costs by 30-40%, and improving safety. However, challenges include workforce transition, cybersecurity, and massive capital investment requirements.</p>$$
WHERE title = 'L''automatisation des ports : défis et opportunités';

UPDATE news_articles SET
  title_en = $$Moroccan Ports and Climate Change: Adaptation Strategies$$,
  excerpt_en = $$How Moroccan ports are preparing for climate challenges through green infrastructure and adaptation measures.$$,
  content_en = $$<p>Moroccan ports are implementing comprehensive climate adaptation strategies including shore power systems, renewable energy infrastructure, and coastal resilience measures to protect against rising sea levels.</p>$$
WHERE title = 'Les ports marocains face au changement climatique : stratégies d''adaptation';

UPDATE news_articles SET
  title_en = $$The Future of Maritime Transport: Trends to Watch$$,
  excerpt_en = $$Key trends shaping maritime transport including decarbonization, digitalization, and supply chain restructuring.$$,
  content_en = $$<p>Maritime transport is undergoing fundamental transformation driven by environmental regulations, digital technologies, and changing trade patterns. Alternative fuels, autonomous vessels, and blockchain-based documentation are key trends for 2025-2030.</p>$$
WHERE title = 'L''avenir du transport maritime : tendances à surveiller';

UPDATE news_articles SET
  title_en = $$Container Shortage Crisis: Causes and Solutions$$,
  excerpt_en = $$Understanding the global container shortage phenomenon and industry responses.$$,
  content_en = $$<p>The container shortage crisis of 2020-2023 revealed supply chain vulnerabilities. Industry responses include increased container production, better positioning systems, and port efficiency improvements to prevent future shortages.</p>$$
WHERE title = 'La crise de la pénurie de conteneurs : causes et solutions';

UPDATE news_articles SET
  title_en = $$Africa's Ports in the Era of AfCFTA$$,
  excerpt_en = $$How the African Continental Free Trade Area is transforming port strategies across the continent.$$,
  content_en = $$<p>AfCFTA implementation is driving unprecedented port development across Africa, requiring enhanced capacity, improved logistics connectivity, and harmonized customs procedures to facilitate intra-African trade growth.</p>$$
WHERE title = 'Les ports africains à l''ère de la ZLECA';

UPDATE news_articles SET
  title_en = $$Artificial Intelligence in Ports: Concrete Applications$$,
  excerpt_en = $$Real-world AI applications transforming port operations from predictive maintenance to traffic optimization.$$,
  content_en = $$<p>AI is revolutionizing ports through predictive maintenance (reducing downtime by 25-30%), intelligent traffic management, automated documentation, and optimized resource allocation, delivering significant efficiency gains.</p>$$
WHERE title = 'L''intelligence artificielle dans les ports : applications concrètes';

UPDATE news_articles SET
  title_en = $$Mega-Ships: Challenges for Modern Ports$$,
  excerpt_en = $$How ultra-large container vessels are forcing ports to adapt infrastructure and operations.$$,
  content_en = $$<p>Mega-ships carrying 20,000+ TEUs require deeper channels, larger cranes, and enhanced terminal capacity. Only major ports can accommodate these vessels, intensifying competition and concentration in global shipping networks.</p>$$
WHERE title = 'Les méga-navires : défis pour les ports modernes';

UPDATE news_articles SET
  title_en = $$Casablanca Port: Modernization and Development$$,
  excerpt_en = $$Comprehensive overview of Casablanca Port's modernization program and economic impact.$$,
  content_en = $$<p>Casablanca Port is undergoing major modernization with new container terminals, enhanced logistics zones, and improved urban integration, aiming to position Morocco's economic capital as a leading Mediterranean port.</p>$$
WHERE title = 'Le port de Casablanca : modernisation et développement';

UPDATE news_articles SET
  title_en = $$Port Governance in Africa: Models and Best Practices$$,
  excerpt_en = $$Comparative analysis of port governance models across African countries.$$,
  content_en = $$<p>African ports are experimenting with various governance models from landlord ports to fully privatized operations. Best practices include transparent regulation, private sector participation, and strong institutional capacity.</p>$$
WHERE title = 'La gouvernance portuaire en Afrique : modèles et bonnes pratiques';

UPDATE news_articles SET
  title_en = $$Maritime Glossary: Essential Terms to Know$$,
  excerpt_en = $$Comprehensive guide to key maritime and port industry terminology.$$,
  content_en = $$<p>Essential maritime vocabulary including TEU, transshipment, draft, berth, feeder vessels, and other key terms that professionals use daily in port and shipping operations.</p>$$
WHERE title = 'Glossaire maritime : termes essentiels à connaître';

UPDATE news_articles SET
  title_en = $$Port of Agadir: Gateway to Southern Morocco$$,
  excerpt_en = $$Analysis of Agadir Port's role in Morocco's southern regional development.$$,
  content_en = $$<p>Agadir Port serves as vital infrastructure for southern Morocco, handling agricultural exports, fishing industry, and tourist cruise ships, contributing significantly to regional economic dynamism.</p>$$
WHERE title = 'Le port d''Agadir : porte d''entrée du Maroc du Sud';

UPDATE news_articles SET
  title_en = $$Cybersecurity in Ports: A Growing Challenge$$,
  excerpt_en = $$How ports are addressing increasing cybersecurity threats to critical infrastructure.$$,
  content_en = $$<p>Ports face growing cyber threats targeting operations systems, logistics networks, and critical infrastructure. Modern security requires multi-layer defense, staff training, and international cooperation.</p>$$
WHERE title = 'La cybersécurité dans les ports : un défi croissant';

UPDATE news_articles SET
  title_en = $$Cruise Tourism: Strategic Opportunity for Moroccan Ports$$,
  excerpt_en = $$How Moroccan ports are developing cruise infrastructure to capture tourism growth.$$,
  content_en = $$<p>Morocco is investing in cruise terminals and tourist facilities at major ports including Casablanca, Tangier, and Agadir to attract Mediterranean cruise ships and boost tourism revenues.</p>$$
WHERE title = 'Le tourisme de croisière : opportunité stratégique pour les ports marocains';

UPDATE news_articles SET
  title_en = $$Maritime Training in Morocco: Challenges and Opportunities$$,
  excerpt_en = $$Overview of maritime education development needed to support Morocco's port expansion.$$,
  content_en = $$<p>Morocco is expanding maritime training programs to meet growing demand for qualified professionals in port operations, ship management, and maritime logistics through specialized institutes and international partnerships.</p>$$
WHERE title = 'La formation maritime au Maroc : défis et opportunités';

UPDATE news_articles SET
  title_en = $$Circular Economy in Ports: Innovations and Best Practices$$,
  excerpt_en = $$How ports are implementing circular economy principles for sustainable operations.$$,
  content_en = $$<p>Ports are adopting circular economy practices including waste recycling, energy recovery, water reuse, and industrial symbiosis, reducing environmental impact while creating economic value.</p>$$
WHERE title = 'L''économie circulaire dans les ports : innovations et bonnes pratiques';

UPDATE news_articles SET
  title_en = $$Dakhla Port: Strategic Project for Morocco's Saharan Provinces$$,
  excerpt_en = $$Analysis of the Dakhla Atlantic Port project and its regional development implications.$$,
  content_en = $$<p>The Dakhla Atlantic Port project represents a major investment in Morocco's southern provinces, aiming to create a new fishing and commercial hub opening Atlantic trade routes to West Africa.</p>$$
WHERE title = 'Le port de Dakhla : un projet stratégique pour les provinces sahariennes du Maroc';

UPDATE news_articles SET
  title_en = $$Blockchain in Logistics: Port Revolution$$,
  excerpt_en = $$How blockchain technology is transforming port documentation and logistics transparency.$$,
  content_en = $$<p>Blockchain implementation in ports enables secure, transparent documentation, reduced paperwork, faster customs clearance, and enhanced supply chain traceability, revolutionizing maritime logistics.</p>$$
WHERE title = 'La blockchain dans la logistique : une révolution pour les ports';

-- Fin du script
-- Pour vérifier, exécutez : SELECT id, LEFT(title, 40), LEFT(title_en, 40) FROM news_articles ORDER BY created_at;
