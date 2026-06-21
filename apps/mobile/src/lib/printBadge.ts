import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { PLATFORM } from '../config/platform';
import type { RefObject } from 'react';
import { InteractionManager } from 'react-native';
import type { View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

const PRINT_REF_TIMEOUT_MS = 3000;

const A4_HTML_HEAD = `
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      @page { size: A4 portrait; margin: 12mm; }
      body { margin: 0; display: flex; justify-content: center; align-items: flex-start; }
      img { width: 100%; max-height: 100vh; object-fit: contain; }
    </style>
  </head>
`;

/** Attend que la vue d'aperçu soit montée (layout prêt pour captureRef). */
export async function waitForPrintView(viewRef: RefObject<View | null>): Promise<void> {
  const deadline = Date.now() + PRINT_REF_TIMEOUT_MS;
  while (!viewRef.current) {
    if (Date.now() >= deadline) {
      throw new Error('Aperçu badge indisponible');
    }
    await new Promise<void>((resolve) => {
      InteractionManager.runAfterInteractions(() => resolve());
    });
    await new Promise((r) => setTimeout(r, 50));
  }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
}

async function captureViewAsBase64(viewRef: RefObject<View | null>): Promise<string> {
  await waitForPrintView(viewRef);
  return captureRef(viewRef, {
    format: 'png',
    quality: 1,
    result: 'base64',
  });
}

function buildPrintHtml(base64: string): string {
  return `
    <html>
      ${A4_HTML_HEAD}
      <body><img src="data:image/png;base64,${base64}" /></body>
    </html>
  `;
}

export async function printBadgeFromView(viewRef: RefObject<View | null>): Promise<void> {
  const base64 = await captureViewAsBase64(viewRef);
  await Print.printAsync({ html: buildPrintHtml(base64) });
}

export async function saveBadgePdfFromView(viewRef: RefObject<View | null>): Promise<string> {
  const base64 = await captureViewAsBase64(viewRef);
  const { uri: pdfUri } = await Print.printToFileAsync({ html: buildPrintHtml(base64) });
  return pdfUri;
}

export async function shareBadgePdfFromView(viewRef: RefObject<View | null>): Promise<void> {
  const pdfUri = await saveBadgePdfFromView(viewRef);
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) throw new Error('Partage non disponible sur cet appareil');
  await Sharing.shareAsync(pdfUri, { mimeType: 'application/pdf', dialogTitle: `Badge ${PLATFORM.name} PDF` });
}

export async function shareBadgeFromView(viewRef: RefObject<View | null>): Promise<void> {
  await waitForPrintView(viewRef);

  const uri = await captureRef(viewRef, {
    format: 'png',
    quality: 1,
    result: 'tmpfile',
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) throw new Error('Partage non disponible sur cet appareil');
  await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: `Badge ${PLATFORM.name}` });
}
