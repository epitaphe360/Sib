export interface ScrapedArticle {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: Date;
  category: string;
  tags: string[];
  image?: string;
  sourceUrl: string;
  readTime: number;
}

export class NewsScraperService {
  private static readonly BASE_URL = 'https://sibevent.com';
  private static readonly NEWS_URL = 'https://sibevent.com/actualite-bâtiment/';

  /**
   * Scrape all news articles from the official SIB website
   */
  static async scrapeNewsArticles(): Promise<ScrapedArticle[]> {
    try {

      // Fetch the main news page
      const response = await fetch(this.NEWS_URL, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch news page: ${response.status} ${response.statusText}`);
      }

      const html = await response.text();

      // Parse the HTML to extract articles
      const articles = this.parseNewsArticles(html);

      return articles;
    } catch (error) {
      console.error('Error scraping news articles:', error);
      throw new Error(`Failed to scrape news articles: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse HTML content to extract news articles
   */
  private static parseNewsArticles(html: string): ScrapedArticle[] {
    const articles: ScrapedArticle[] = [];

    try {
      // Create a DOM parser
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Look for article containers - common patterns in WordPress sites and Elementor
      const articleSelectors = [
        'article',
        '.post',
        '.entry',
        '.news-item',
        '.article-item',
        '.post-item',
        '[class*="post"]',
        '[class*="article"]',
        '[class*="news"]',
        // Elementor specific selectors
        '.elementor-post',
        '.elementor-post-item',
        '[class*="elementor-post"]',
        // Generic content blocks
        '.elementor-element[class*="posts"]',
        '.elementor-widget-container'
      ];

      let articleElements: Element[] = [];

      // Try different selectors to find articles
      for (const selector of articleSelectors) {
        const elements = Array.from(doc.querySelectorAll(selector));
        if (elements.length > 0) {
          articleElements = elements;
          break;
        }
      }

      // If no articles found with common selectors, try to find links to individual articles
      if (articleElements.length === 0) {
        return [];
      } else {
        // Parse found article elements
        articleElements.slice(0, 20).forEach((element, index) => {
          try {
            const article = this.parseArticleElement(element, index);
            if (article) {
              articles.push(article);
            }
          } catch (error) {
            console.warn(`Error parsing article ${index}:`, error);
          }
        });
      }

      return articles;

    } catch (error) {
      console.error('Error parsing HTML:', error);
      return [];
    }
  }

  /**
   * Parse individual article element
   */
  private static parseArticleElement(element: Element, index: number): ScrapedArticle | null {
    try {
      // Extract title
      const titleSelectors = ['h1', 'h2', 'h3', '.title', '.post-title', '.entry-title', '[class*="title"]'];
      let title = '';
      for (const selector of titleSelectors) {
        const titleElement = element.querySelector(selector);
        if (titleElement?.textContent?.trim()) {
          title = titleElement.textContent.trim();
          break;
        }
      }

      // If no title found, try the element's text content
      if (!title) {
        title = element.textContent?.trim()?.split('\n')[0] || `Article ${index + 1}`;
      }

      // Extract excerpt/description
      const excerptSelectors = ['.excerpt', '.summary', '.description', '.post-excerpt', 'p'];
      let excerpt = '';
      for (const selector of excerptSelectors) {
        const excerptElement = element.querySelector(selector);
        if (excerptElement?.textContent?.trim()) {
          excerpt = excerptElement.textContent.trim();
          break;
        }
      }

      // Extract image
      const imageSelectors = ['img', '.featured-image img', '.post-thumbnail img'];
      let image = '';
      for (const selector of imageSelectors) {
        const imgElement = element.querySelector(selector) as HTMLImageElement;
        if (imgElement?.src) {
          image = imgElement.src;
          break;
        }
      }

      // Extract date
      const dateSelectors = ['time', '.date', '.published', '[datetime]', '.post-date'];
      let publishedAt = new Date();
      for (const selector of dateSelectors) {
        const dateElement = element.querySelector(selector);
        const dateText = dateElement?.textContent?.trim() || dateElement?.getAttribute('datetime');
        if (dateText) {
          const parsedDate = new Date(dateText);
          if (!isNaN(parsedDate.getTime())) {
            publishedAt = parsedDate;
            break;
          }
        }
      }

      // Extract link to full article
      const linkSelectors = ['a', '.read-more', '.permalink'];
      let sourceUrl = '';
      for (const selector of linkSelectors) {
        const linkElement = element.querySelector(selector) as HTMLAnchorElement;
        if (linkElement?.href) {
          sourceUrl = linkElement.href.startsWith('http') ? linkElement.href : `${this.BASE_URL}${linkElement.href}`;
          break;
        }
      }

      // If no link found, try the element itself if it's a link
      if (!sourceUrl && element.tagName === 'A') {
        const href = (element as HTMLAnchorElement).href;
        if (href) {
          sourceUrl = href.startsWith('http') ? href : `${this.BASE_URL}${href}`;
        }
      }

      // Extract category
      const categorySelectors = ['.category', '.cat', '.post-category', '[class*="cat"]'];
      let category = 'Actualités du Bâtiment';
      for (const selector of categorySelectors) {
        const categoryElement = element.querySelector(selector);
        if (categoryElement?.textContent?.trim()) {
          category = categoryElement.textContent.trim();
          break;
        }
      }

      // Calculate read time (rough estimate)
      const wordCount = (title + ' ' + excerpt).split(' ').length;
      const readTime = Math.max(1, Math.ceil(wordCount / 200)); // Assume 200 words per minute

      return {
        title: title || `Article ${index + 1}`,
        excerpt: excerpt || 'Description non disponible',
        content: excerpt || 'Contenu complet à charger depuis la page individuelle',
        author: 'SIB',
        publishedAt,
        category,
        tags: ['bâtiment', 'SIB', category.toLowerCase()],
        image: image || undefined,
        sourceUrl: sourceUrl || this.NEWS_URL,
        readTime
      };

    } catch (error) {
      console.warn(`Error parsing article element:`, error);
      return null;
    }
  }

  /**
   * Fetch full content from individual article URL
   */
  static async fetchFullArticle(url: string): Promise<string> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch article: ${response.status}`);
      }

      const html = await response.text();
      return this.extractArticleContent(html);
    } catch (error) {
      console.error('Error fetching full article:', error);
      return 'Contenu non disponible';
    }
  }

  /**
   * Extract article content from HTML
   */
  private static extractArticleContent(html: string): string {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Common content selectors for WordPress and other CMS
      const contentSelectors = [
        '.entry-content',
        '.post-content',
        '.content',
        '.article-content',
        '[class*="content"]',
        '.entry',
        'article .content',
        'main article'
      ];

      for (const selector of contentSelectors) {
        const contentElement = doc.querySelector(selector);
        if (contentElement) {
          // Remove unwanted elements
          const unwantedSelectors = ['script', 'style', 'nav', 'aside', 'footer', '.sidebar', '.comments'];
          unwantedSelectors.forEach(unwanted => {
            contentElement.querySelectorAll(unwanted).forEach(el => el.remove());
          });

          const text = contentElement.textContent?.trim();
          if (text && text.length > 100) {
            return text;
          }
        }
      }

      // Fallback: get all paragraph text
      const paragraphs = Array.from(doc.querySelectorAll('p'));
      const text = paragraphs.map(p => p.textContent?.trim()).filter(Boolean).join('\n\n');
      return text || 'Contenu non disponible';

    } catch (error) {
      console.error('Error extracting article content:', error);
      return 'Contenu non disponible';
    }
  }
}
