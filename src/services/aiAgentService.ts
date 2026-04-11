export class AiAgentService {
  /**
   * Call the configured AI agent endpoint to generate a mini-site payload.
   * Supports multiple fallback URLs and improved error handling.
   */
  static async generate(websiteUrl: string): Promise<any> {
    if (!websiteUrl || !websiteUrl.trim()) {
      throw new Error('URL du site web requise');
    }

    const env = (import.meta && (import.meta as any).env) || {};
    const apiKey = env.VITE_AI_AGENT_KEY || (window && (window as any).AI_AGENT_KEY) || null;
    
    // URLs de fallback multiples pour plus de robustesse
    const possibleUrls = [
      env.VITE_AI_AGENT_URL,
      (window && (window as any).AI_AGENT_URL),
      'http://localhost:3001/generate',
      '/api/ai-generate', // Endpoint local via serveur principal
    ].filter(Boolean);


    let lastError: Error | null = null;

    // Essayer chaque URL dans l'ordre
    for (const agentUrl of possibleUrls) {
      try {
        
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (apiKey) headers['x-ai-agent-key'] = apiKey;

        const response = await fetch(agentUrl, { 
          method: 'POST', 
          headers, 
          body: JSON.stringify({ url: websiteUrl }),
          signal: AbortSignal.timeout(30000) // 30 secondes timeout
        });
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Erreur inconnue');
          throw new Error(`Agent IA indisponible (${response.status}): ${errorText}`);
        }
        
        const result = await response.json();
        
        // Validation du résultat
        if (!result || typeof result !== 'object') {
          throw new Error('Réponse invalide de l\'agent IA');
        }
        
        return {
          company: result.company || 'Entreprise',
          description: result.description || '',
          logo: result.logo || '',
          products: result.products || [],
          socials: result.socials || [],
          sections: result.sections || [],
          documents: result.documents || [],
          ...result
        };
        
      } catch (error) {
        console.warn(`⚠️ Échec avec ${agentUrl}:`, error);
        lastError = error as Error;
        continue; // Essayer l'URL suivante
      }
    }

    // Si toutes les tentatives ont échoué
    console.error('❌ Toutes les tentatives d\'agent IA ont échoué:', lastError?.message);
    
    // Fallback: retourner des données basiques extraites de l'URL
    return this.generateFallbackData(websiteUrl);
  }

  /**
   * Génère des données de base à partir de l'URL en cas d'échec de l'IA
   */
  private static generateFallbackData(websiteUrl: string) {
    try {
      const url = new URL(websiteUrl);
      const domain = url.hostname.replace(/^www\./, '');
      const companyName = domain.split('.')[0];
      
      return {
        company: companyName.charAt(0).toUpperCase() + companyName.slice(1),
        description: `Entreprise basée sur ${domain}`,
        logo: '',
        products: [`Produits et services de ${companyName}`],
        socials: [websiteUrl],
        sections: [
          {
            title: 'À propos',
            content: `Découvrez les produits et services de ${companyName}.`
          }
        ],
        documents: []
      };
    } catch (urlError) {
      return {
        company: 'Entreprise',
        description: 'Description générée automatiquement',
        logo: '',
        products: ['Produits et services'],
        socials: [websiteUrl],
        sections: [],
        documents: []
      };
    }
  }
}

export default AiAgentService;
