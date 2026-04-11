/**
 * Service de scrapping intelligent avec IA (GPT-4o-mini)
 * Extrait automatiquement les informations d'un site web pour remplir les profils
 *
 * COÛT: GPT-4o-mini = $0.15/1M tokens (le plus rentable qualité/prix)
 * USAGE: ~500 tokens par scrapping = $0.000075 par profil
 */

interface ScrapResult {
  success: boolean;
  data?: {
    companyName: string;
    description: string;
    sector: string;
    services: string[];
    logoUrl?: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
    foundedYear?: number;
    employeeCount?: string;
    socialLinks?: {
      linkedin?: string;
      twitter?: string;
      facebook?: string;
    };
  };
  error?: string;
}

interface MiniSiteScrapResult {
  success: boolean;
  data?: {
    // FONDATIONS
    companyName: string;
    tagline: string;
    logo?: string;
    description: string;
    
    // HÉRO
    heroTitle?: string;
    heroSubtitle?: string;
    heroImage?: string;
    heroCTA?: {
      text: string;
      link: string;
    };
    
    // PRÉSENTATION
    aboutTitle?: string;
    aboutDescription?: string;
    aboutImage?: string;
    mission?: string;
    values?: string[];
    stats?: Array<{
      label: string;
      value: string;
    }>;
    
    // PRODUITS/SERVICES
    products: Array<{
      name: string;
      description: string;
      category: string;
      image?: string;
      features?: string[];
      price?: string;
    }>;
    services: string[];
    
    // RÉALISATIONS
    achievements: string[];
    
    // ÉQUIPE
    teamMembers?: Array<{
      name: string;
      position: string;
      bio: string;
      photo?: string;
      specialties?: string[];
      email?: string;
      linkedin?: string;
      phone?: string;
    }>;
    
    // GALERIE
    gallery?: Array<{
      url: string;
      description?: string;
    }>;
    
    // CERTIFICATIONS
    certifications?: Array<{
      name: string;
      issuer: string;
      year: number;
      logo?: string;
      description?: string;
    }>;
    
    // ARTICLES/ACTUALITÉS
    articles?: Array<{
      title: string;
      excerpt: string;
      content: string;
      image?: string;
      date: string;
      category: string;
    }>;
    
    // RÉSEAUX SOCIAUX
    socialLinks?: {
      linkedin?: string;
      facebook?: string;
      instagram?: string;
      twitter?: string;
      youtube?: string;
      whatsapp?: string;
    };
    
    // CONTACT
    contactInfo: {
      email: string;
      phone: string;
      address?: string;
      website?: string;
    };
    
    // PERSONNALISATION
    theme?: 'modern' | 'classic' | 'dark' | 'vibrant';
    colors?: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
  error?: string;
}

class AIScrapperService {
  private apiKey: string;
  private apiUrl = 'https://api.openai.com/v1/chat/completions';
  private allowClientAI: boolean;

  constructor() {
    // SECURITY: Client-side OpenAI key usage is disabled by default.
    // Enable only for local development troubleshooting.
    this.allowClientAI = import.meta.env.DEV && import.meta.env.VITE_ENABLE_CLIENT_AI === 'true';
    this.apiKey = this.allowClientAI ? (import.meta.env.VITE_OPENAI_API_KEY || '') : '';

    if (!this.allowClientAI) {
      console.warn('⚠️ AI scrapper client direct is disabled. Use Edge Function scrape-and-create-minisite.');
      return;
    }

    if (!this.apiKey) {
      console.error('⚠️ VITE_OPENAI_API_KEY non définie dans .env (mode client AI activé)');
    }
  }

  /**
   * Scrape le contenu HTML d'un site web
   */
  private async fetchWebsiteContent(url: string): Promise<string> {
    try {
      // Utiliser un proxy CORS ou un service backend pour éviter les problèmes CORS
      // Option 1: Utiliser allorigins.win (gratuit)
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;

      const response = await fetch(proxyUrl);
      const data = await response.json();

      if (!data.contents) {
        throw new Error('Impossible de récupérer le contenu du site');
      }

      // Nettoyer le HTML: enlever scripts, styles, etc.
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = data.contents;

      // Supprimer les éléments inutiles
      const selectorsToRemove = ['script', 'style', 'noscript', 'iframe', 'nav', 'footer'];
      selectorsToRemove.forEach(selector => {
        const elements = tempDiv.querySelectorAll(selector);
        elements.forEach(el => el.remove());
      });

      // Extraire le texte visible
      const textContent = tempDiv.textContent || tempDiv.innerText || '';

      // Limiter à 5000 caractères pour économiser les tokens
      return textContent.trim().slice(0, 5000);
    } catch (error) {
      console.error('Erreur fetch website:', error);
      throw new Error('Impossible de charger le site web. Vérifiez l\'URL.');
    }
  }

  /**
   * Scrapper pour PROFIL PARTENAIRE
   */
  async scrapPartnerProfile(websiteUrl: string): Promise<ScrapResult> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'Clé API OpenAI non configurée'
      };
    }

    try {
      // 1. Récupérer le contenu du site
      const websiteContent = await this.fetchWebsiteContent(websiteUrl);

      // 2. Appeler GPT-4o-mini pour extraire les infos
      const prompt = `Tu es un assistant intelligent qui extrait des informations d'entreprise depuis le contenu d'un site web.

CONTENU DU SITE WEB:
${websiteContent}

TÂCHE: Extrais les informations suivantes au format JSON strict (pas de markdown, pas de \`\`\`):
{
  "companyName": "Nom de l'entreprise",
  "description": "Description courte de l'entreprise (200 caractères max)",
  "sector": "Secteur d'activité (construction, logistique, technologie, etc.)",
  "services": ["Service 1", "Service 2", "Service 3"],
  "logoUrl": "URL du logo si trouvé, sinon null",
  "contactEmail": "Email de contact si trouvé",
  "contactPhone": "Téléphone si trouvé",
  "address": "Adresse physique si trouvée",
  "foundedYear": 2020,
  "employeeCount": "50-100 employés",
  "socialLinks": {
    "linkedin": "URL LinkedIn si trouvé",
    "twitter": "URL Twitter si trouvé",
    "facebook": "URL Facebook si trouvé"
  }
}

RÈGLES:
- Retourne UNIQUEMENT le JSON, sans texte avant ou après
- Si une info n'est pas trouvée, mets null
- La description doit être professionnelle et concise
- Les services doivent être les principaux services offerts
- Le secteur doit être choisi parmi: construction, logistique, technologie, finance, industrie, services, autre`;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Tu es un assistant expert en extraction de données d\'entreprise. Tu réponds UNIQUEMENT en JSON valide.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API Error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      const aiResponse = result.choices[0]?.message?.content || '';

      // Parser le JSON de la réponse
      let extractedData;
      try {
        // Nettoyer la réponse (enlever les ``` si présents)
        const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        extractedData = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error('Erreur parsing JSON:', aiResponse);
        throw new Error('L\'IA n\'a pas retourné un JSON valide');
      }

      return {
        success: true,
        data: extractedData
      };

    } catch (error: any) {
      console.error('Erreur scrapping partner:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors du scrapping'
      };
    }
  }

  /**
   * Scrapper pour MINI-SITE EXPOSANT
   */
  async scrapExhibitorMiniSite(websiteUrl: string): Promise<MiniSiteScrapResult> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'Clé API OpenAI non configurée'
      };
    }

    try {
      // 1. Récupérer le contenu du site
      const websiteContent = await this.fetchWebsiteContent(websiteUrl);

      // 2. Appeler GPT-4o-mini pour extraire les infos du mini-site (VERSION ULTRA-OPTIMISÉE)
      const prompt = `# 🔍 EXTRACTEUR DE DONNÉES WEB - MODE STRICT

Tu es un **extracteur de données** professionnel. Ta mission est d'analyser le contenu HTML/texte d'un site web et d'en extraire TOUTES les informations RÉELLES.

## ⚠️ RÈGLE ABSOLUE: ZÉRO INVENTION

INTERDIT FORMELLEMENT:
❌ Inventer des données non présentes
❌ Halluciner des informations
❌ Deviner ou supposer
❌ Générer du contenu créatif
❌ Compléter les champs vides avec du texte générique
❌ Ajouter des URLs qui n'existent pas dans le HTML

OBLIGATOIRE:
✅ Extraire UNIQUEMENT ce qui est VISIBLE dans le contenu
✅ Retourner null pour tout champ non trouvé
✅ Copier/coller le texte exact du site
✅ Vérifier que chaque URL existe dans le HTML source

---

## 📄 CONTENU DU SITE À ANALYSER:

${websiteContent}

---

## 🎯 TÂCHE: Extraire ces données au format JSON

### SECTION 1: IDENTITÉ (chercher dans header, footer, meta, title)
- companyName: Chercher dans <title>, h1, logo alt, footer
- tagline: Chercher slogan, sous-titre du h1, meta description
- logo: URL de l'image logo (src de <img> avec "logo" dans class/alt/src)
- favicon: URL du favicon si présent

### SECTION 2: HÉRO (chercher dans la première section visible)
- heroTitle: Premier <h1> ou titre principal
- heroSubtitle: Texte juste après le h1, ou <p> dans section hero
- heroImage: Background-image ou première grande image (>800px)
- heroCTA: Bouton principal {text: "texte du bouton", link: "href"}

### SECTION 3: À PROPOS (chercher "about", "à propos", "qui sommes")
- aboutTitle: Titre de la section about
- aboutDescription: Contenu complet (copier le texte exact)
- aboutImage: Image dans la section about
- mission: Texte contenant "mission", "objectif", "but"
- values: Liste de valeurs si présentes (souvent en <li> ou cards)
- stats: Chiffres clés [{label: "X", value: "Y"}] (chercher nombres + texte)

### SECTION 4: PRODUITS/SERVICES (chercher "product", "service", "solution")
Pour CHAQUE produit/service trouvé:
- name: Titre du produit (h2, h3, h4)
- description: Texte descriptif (copier exactement)
- category: Catégorie si mentionnée
- image: URL image du produit (src)
- features: Liste de caractéristiques si présentes
- price: Prix si affiché (sinon null)

### SECTION 5: GALERIE (chercher "gallery", "portfolio", "projets", "réalisations")
Pour CHAQUE image:
- url: src de l'image
- description: alt text ou légende si présente
- caption: Texte associé

### SECTION 6: ÉQUIPE (chercher "team", "équipe", "notre équipe")
Pour CHAQUE membre:
- name: Nom complet
- position: Titre/fonction
- bio: Description/bio (copier exactement)
- photo: URL photo portrait
- email: Email si visible (pattern @)
- phone: Téléphone si visible
- linkedin: URL LinkedIn si présente
- specialties: Expertises listées

### SECTION 7: CERTIFICATIONS (chercher "certification", "ISO", "accréditation")
Pour CHAQUE certification:
- name: Nom exact (ISO 9001, etc)
- issuer: Organisme si mentionné
- year: Année si visible
- logo: URL logo certification
- description: Texte associé

### SECTION 8: ACTUALITÉS/BLOG (chercher "news", "blog", "actualités")
Pour CHAQUE article:
- title: Titre
- excerpt: Résumé/intro
- content: Contenu si visible
- image: Image article
- date: Date (format YYYY-MM-DD)
- author: Auteur si mentionné
- category: Catégorie

### SECTION 9: RÉSEAUX SOCIAUX (chercher icônes sociales, footer, liens)
- linkedin: URL complète contenant "linkedin.com"
- facebook: URL complète contenant "facebook.com"
- instagram: URL complète contenant "instagram.com"
- twitter: URL complète contenant "twitter.com" ou "x.com"
- youtube: URL complète contenant "youtube.com"
- whatsapp: Numéro ou lien wa.me
- tiktok: URL si présente

### SECTION 10: CONTACT (chercher "contact", footer, header)
- email: Pattern xxx@xxx.xxx
- phone: Pattern +XXX ou 0X XX XX XX XX
- address: Adresse physique
- website: URL canonique
- fax: Si présent
- horaires: Heures d'ouverture si mentionnées

### SECTION 11: STYLE (analyser CSS inline, classes, couleurs visibles)
- theme: "modern"/"classic"/"dark"/"minimal" selon design
- colors.primary: Couleur dominante #HEX
- colors.secondary: Couleur secondaire #HEX
- colors.accent: Couleur d'accent #HEX

---

## 📤 FORMAT DE RÉPONSE

Retourne UNIQUEMENT ce JSON (pas de markdown, pas de texte):

{
  "companyName": "string ou null",
  "tagline": "string ou null",
  "logo": "URL ou null",
  "description": "string ou null",
  
  "heroTitle": "string ou null",
  "heroSubtitle": "string ou null",
  "heroImage": "URL ou null",
  "heroCTA": {"text": "string", "link": "URL"} ou null,
  
  "aboutTitle": "string ou null",
  "aboutDescription": "string ou null",
  "aboutImage": "URL ou null",
  "mission": "string ou null",
  "values": ["string"] ou null,
  "stats": [{"label": "string", "value": "string"}] ou null,
  
  "products": [
    {
      "name": "string",
      "description": "string",
      "category": "string ou null",
      "image": "URL ou null",
      "features": ["string"] ou null,
      "price": "string ou null"
    }
  ] ou null,
  
  "services": ["string"] ou null,
  "achievements": ["string"] ou null,
  
  "teamMembers": [
    {
      "name": "string",
      "position": "string",
      "bio": "string ou null",
      "photo": "URL ou null",
      "email": "string ou null",
      "linkedin": "URL ou null",
      "phone": "string ou null",
      "specialties": ["string"] ou null
    }
  ] ou null,
  
  "gallery": [
    {"url": "URL", "description": "string ou null"}
  ] ou null,
  
  "certifications": [
    {
      "name": "string",
      "issuer": "string ou null",
      "year": number ou null,
      "logo": "URL ou null",
      "description": "string ou null"
    }
  ] ou null,
  
  "articles": [
    {
      "title": "string",
      "excerpt": "string ou null",
      "content": "string ou null",
      "image": "URL ou null",
      "date": "YYYY-MM-DD ou null",
      "category": "string ou null"
    }
  ] ou null,
  
  "socialLinks": {
    "linkedin": "URL ou null",
    "facebook": "URL ou null",
    "instagram": "URL ou null",
    "twitter": "URL ou null",
    "youtube": "URL ou null",
    "whatsapp": "string ou null"
  },
  
  "contactInfo": {
    "email": "string ou null",
    "phone": "string ou null",
    "address": "string ou null",
    "website": "URL ou null"
  },
  
  "theme": "modern|classic|dark|minimal",
  "colors": {
    "primary": "#HEX ou null",
    "secondary": "#HEX ou null",
    "accent": "#HEX ou null"
  },
  
  "_metadata": {
    "extractedAt": "${new Date().toISOString()}",
    "confidence": "high|medium|low",
    "fieldsFound": number,
    "fieldsTotal": 50
  }
}

---

## ✅ CHECKLIST FINALE

Avant de retourner le JSON, vérifie:
□ Chaque URL existe réellement dans le HTML source
□ Chaque texte est une copie exacte (pas de reformulation)
□ Aucun champ n'est inventé ou deviné
□ Les champs non trouvés sont null (pas "")
□ Le JSON est valide et parseable
□ Pas de commentaires dans le JSON`;

      // Message système renforcé anti-hallucination
      const systemMessage = `Tu es un EXTRACTEUR DE DONNÉES STRICT.

🚫 TU NE DOIS JAMAIS:
- Inventer des informations
- Halluciner du contenu
- Deviner ou supposer
- Compléter avec du texte générique
- Créer des URLs fictives

✅ TU DOIS TOUJOURS:
- Extraire UNIQUEMENT ce qui est visible dans le HTML
- Retourner null pour les champs non trouvés
- Copier le texte EXACTEMENT comme sur le site
- Vérifier que chaque URL existe dans le contenu source

FORMAT: JSON valide uniquement, sans markdown, sans commentaires.
LANGUE: Garde la langue originale du contenu.
PRIORITÉ: Précision et honnêteté > Complétude`;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: systemMessage
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,  // Très bas pour minimiser créativité
          max_tokens: 4000   // Plus de tokens pour contenu complet
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API Error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      const aiResponse = result.choices[0]?.message?.content || '';

      // Parser le JSON de la réponse
      let extractedData;
      try {
        const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        extractedData = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error('Erreur parsing JSON:', aiResponse);
        throw new Error('L\'IA n\'a pas retourné un JSON valide');
      }

      // Récupérer le HTML brut pour amélioration
      const htmlResponse = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(websiteUrl)}`);
      const htmlData = await htmlResponse.json();
      const htmlContent = htmlData.contents || '';

      // Améliorer les données avec extraction supplémentaire
      const enhancedData = await this.enhanceScrapedData(htmlContent, extractedData);

      return {
        success: true,
        data: enhancedData
      };

    } catch (error: any) {
      console.error('Erreur scrapping exhibitor:', error);
      return {
        success: false,
        error: error.message || 'Erreur lors du scrapping'
      };
    }
  }

  /**
   * Teste la connexion à l'API OpenAI
   */
  async testConnection(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 5
        })
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Améliore les données en extrayant images supplémentaires et éléments manquants
   */
  async enhanceScrapedData(
    htmlContent: string,
    initialData: any
  ): Promise<any> {
    if (!this.apiKey) return initialData;

    try {
      const prompt = `# EXTRACTION COMPLÉMENTAIRE - MODE STRICT

Tu as du HTML brut. Extrais les éléments SUPPLÉMENTAIRES non encore capturés.

## ⚠️ RÈGLE ABSOLUE: EXTRACTION PURE

❌ INTERDIT: Inventer, supposer, deviner, générer
✅ OBLIGATOIRE: Extraire UNIQUEMENT ce qui EXISTE dans le HTML

## HTML SOURCE:
${htmlContent.slice(0, 8000)}

## TÂCHE: Trouver ces éléments manquants

Cherche dans le HTML:
1. IMAGES: Toutes les balises <img src="..."> 
2. EMAILS: Pattern xxx@xxx.xxx dans le texte ou href="mailto:"
3. TÉLÉPHONES: Patterns +XXX, 0X XX XX XX, href="tel:"
4. CERTIFICATIONS: Texte contenant "ISO", "certification", "certifié"
5. PHOTOS ÉQUIPE: Images dans sections "team", "équipe", "about"
6. ARTICLES: Titres dans sections "news", "blog", "actualités"
7. COULEURS: Style inline, CSS variables, class avec couleurs
8. LIENS SOCIAUX: href contenant linkedin, facebook, instagram, twitter, youtube

## FORMAT DE RÉPONSE (JSON strict):
{
  "additionalImages": [
    {"url": "URL exacte du src", "alt": "texte alt si présent", "context": "où trouvée"}
  ],
  "emails": ["email@exacte.com"],
  "phones": ["+XXX exact"],
  "certifications": ["Nom exact de certification"],
  "teamPhotos": [{"memberName": "Nom si associé", "photoUrl": "URL exacte"}],
  "newsItems": [{"title": "Titre exact", "url": "URL si lien"}],
  "colorPalette": {
    "found": ["#HEX exact trouvé dans CSS/style"],
    "dominant": "#HEX couleur la plus utilisée"
  },
  "socialMediaLinks": {
    "linkedin": "URL complète ou null",
    "facebook": "URL complète ou null",
    "instagram": "URL complète ou null",
    "twitter": "URL complète ou null",
    "youtube": "URL complète ou null",
    "whatsapp": "numéro ou lien ou null",
    "tiktok": "URL ou null"
  },
  "additionalData": {
    "foundElements": number,
    "htmlAnalyzed": true
  }
}

## ✅ VÉRIFICATION
- Chaque URL doit apparaître TEXTUELLEMENT dans le HTML
- Chaque email/phone doit être VISIBLE dans le source
- null pour tout élément non trouvé
- Pas d'estimation ni de déduction`;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Tu extrais UNIQUEMENT les données manquantes au format JSON strict.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2,
          max_tokens: 1000
        })
      });

      if (response.ok) {
        const result = await response.json();
        const enhancement = JSON.parse(
          result.choices[0]?.message?.content
            ?.replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim() || '{}'
        );

        // Fusionner les données améliorées
        return this.mergeEnhancedData(initialData, enhancement);
      }

      return initialData;
    } catch (error) {
      console.warn('Erreur lors de l\'amélioration des données:', error);
      return initialData;
    }
  }

  /**
   * Fusionne les données enhancées aux données initiales (nouveau format)
   */
  private mergeEnhancedData(initial: any, enhanced: any): any {
    const merged = JSON.parse(JSON.stringify(initial)); // Deep copy

    // Ajouter les images additionnelles
    if (enhanced.additionalImages?.length > 0) {
      if (!merged.gallery) merged.gallery = [];
      enhanced.additionalImages.forEach((img: any) => {
        const url = typeof img === 'string' ? img : img.url;
        if (url && !merged.gallery.some((g: any) => g.url === url)) {
          merged.gallery.push({ 
            url, 
            description: img.alt || img.context || null 
          });
        }
      });
    }

    // Legacy format support
    if (enhanced.images?.length > 0) {
      if (!merged.gallery) merged.gallery = [];
      enhanced.images.forEach((url: string) => {
        if (!merged.gallery.some((img: any) => img.url === url)) {
          merged.gallery.push({ url, description: null });
        }
      });
    }

    // Améliorer contacts
    if (!merged.contactInfo) merged.contactInfo = {};
    
    if (enhanced.emails?.length > 0 && !merged.contactInfo.email) {
      merged.contactInfo.email = enhanced.emails[0];
    }
    if (enhanced.missingEmails?.length > 0 && !merged.contactInfo.email) {
      merged.contactInfo.email = enhanced.missingEmails[0];
    }
    
    if (enhanced.phones?.length > 0 && !merged.contactInfo.phone) {
      merged.contactInfo.phone = enhanced.phones[0];
    }
    if (enhanced.missingPhones?.length > 0 && !merged.contactInfo.phone) {
      merged.contactInfo.phone = enhanced.missingPhones[0];
    }

    // Améliorer certifications
    const certNames = enhanced.certifications || enhanced.certificationsNames || [];
    if (certNames.length > 0) {
      if (!merged.certifications) merged.certifications = [];
      certNames.forEach((name: string) => {
        if (!merged.certifications.some((c: any) => c.name === name)) {
          merged.certifications.push({
            name,
            issuer: null,
            year: null,
            logo: null,
            description: null
          });
        }
      });
    }

    // Améliorer photos équipe
    const teamPhotos = enhanced.teamPhotos || [];
    if (teamPhotos.length > 0 && merged.teamMembers) {
      teamPhotos.forEach((photo: any) => {
        const memberName = photo.memberName || photo.name;
        const photoUrl = photo.photoUrl || photo.url;
        if (memberName && photoUrl) {
          const member = merged.teamMembers.find((m: any) =>
            m.name?.toLowerCase().includes(memberName.toLowerCase()) ||
            memberName.toLowerCase().includes(m.name?.toLowerCase())
          );
          if (member && !member.photo) {
            member.photo = photoUrl;
          }
        }
      });
    }

    // Améliorer réseaux sociaux (nouveau format)
    if (enhanced.socialMediaLinks) {
      if (!merged.socialLinks) merged.socialLinks = {};
      Object.keys(enhanced.socialMediaLinks).forEach(key => {
        if (enhanced.socialMediaLinks[key] && !merged.socialLinks[key]) {
          merged.socialLinks[key] = enhanced.socialMediaLinks[key];
        }
      });
    }
    
    // Legacy format
    if (enhanced.additionalLinks) {
      if (!merged.socialLinks) merged.socialLinks = {};
      Object.assign(merged.socialLinks, enhanced.additionalLinks);
    }

    // Améliorer articles/news
    if (enhanced.newsItems?.length > 0) {
      if (!merged.articles) merged.articles = [];
      enhanced.newsItems.forEach((news: any) => {
        if (!merged.articles.some((a: any) => a.title === news.title)) {
          merged.articles.push({
            title: news.title,
            excerpt: null,
            content: null,
            image: null,
            date: null,
            category: null,
            url: news.url || null
          });
        }
      });
    }

    // Améliorer couleurs (nouveau format)
    if (enhanced.colorPalette?.found?.length > 0) {
      if (!merged.colors) {
        merged.colors = {
          primary: enhanced.colorPalette.dominant || enhanced.colorPalette.found[0],
          secondary: enhanced.colorPalette.found[1] || null,
          accent: enhanced.colorPalette.found[2] || null
        };
      }
    }
    
    // Legacy format
    if (enhanced.colorScheme?.length >= 3 && !merged.colors) {
      merged.colors = {
        primary: enhanced.colorScheme[0],
        secondary: enhanced.colorScheme[1],
        accent: enhanced.colorScheme[2]
      };
    }

    return merged;
  }
}

// Export singleton
export const aiScrapperService = new AIScrapperService();
export default aiScrapperService;
