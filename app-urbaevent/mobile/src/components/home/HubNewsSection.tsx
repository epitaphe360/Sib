import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { FadeSlideIn } from '../FadeSlideIn';
import { NewsHomePreview } from '../news/NewsHomePreview';
import { HomeSection } from './HomeSection';
import { useI18n } from '../../i18n/I18nProvider';
import { spacing } from '../../theme';

/** Actualités plateforme UrbaEvent — hub uniquement, pas dans l'espace salon. */
export function HubNewsSection() {
  const { t } = useI18n();

  return (
    <FadeSlideIn delay={120}>
      <HomeSection
        title={t('news.title')}
        subtitle={t('home.urba.hubNewsSubtitle')}
        actionLabel={t('news.viewAll')}
        onAction={() => router.push('/(visitor)/news' as never)}
      >
        <View style={styles.newsBody}>
          <NewsHomePreview />
        </View>
      </HomeSection>
    </FadeSlideIn>
  );
}

const styles = StyleSheet.create({
  newsBody: {
    paddingHorizontal: spacing.md,
  },
});
