import { useEffect, useState } from 'react';
import { loadSibMaHomeContent, type SibMaHomeContent } from '../lib/sibMaContent';

export function useSibMaHomeContent() {
  const [content, setContent] = useState<SibMaHomeContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    loadSibMaHomeContent().then((data) => {
      if (!cancelled) {
        setContent(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { content, loading };
}
