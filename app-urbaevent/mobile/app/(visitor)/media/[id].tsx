import { useLocalSearchParams } from 'expo-router';

import { useCallback, useEffect, useState } from 'react';

import { ActivityIndicator, ScrollView, StyleSheet, Text } from 'react-native';

import { fetchMediaById, getMediaTypeLabel, type MediaItem } from '../../../src/api/media';

import { MediaNativePlayer } from '../../../src/components/media/MediaNativePlayer';

import { IllustratedEmpty, Screen, ScreenTitle } from '../../../src/components/ui';

import { useI18n } from '../../../src/i18n/I18nProvider';

import { colors, fonts, spacing } from '../../../src/theme';



export default function MediaDetailScreen() {

  const { id } = useLocalSearchParams<{ id: string }>();

  const { t } = useI18n();

  const [item, setItem] = useState<MediaItem | null>(null);

  const [loading, setLoading] = useState(true);



  const load = useCallback(async () => {

    if (!id) return;

    setLoading(true);

    try {

      setItem(await fetchMediaById(id));

    } catch {

      setItem(null);

    } finally {

      setLoading(false);

    }

  }, [id]);



  useEffect(() => { load(); }, [load]);



  return (

    <Screen>

      <ScrollView contentContainerStyle={styles.scroll}>

        {loading ? (

          <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: spacing.xl }} />

        ) : item ? (

          <>

            <ScreenTitle title={item.title} subtitle={getMediaTypeLabel(item.type, t)} />

            <MediaNativePlayer

              videoUrl={item.videoUrl}

              audioUrl={item.audioUrl}

              thumbnailUrl={item.thumbnailUrl}

              title={item.title}

            />

            <Text style={styles.body}>{item.description || t('media.noDescription')}</Text>

          </>

        ) : (

          <IllustratedEmpty icon="play-outline" title={t('media.notFound')} message="" />

        )}

      </ScrollView>

    </Screen>

  );

}



const styles = StyleSheet.create({

  scroll: { paddingBottom: spacing.xl },

  body: { fontFamily: fonts.body, color: colors.text, lineHeight: 22 },

});

