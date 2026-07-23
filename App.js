import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Clipboard from 'expo-clipboard';

// IP local o IP del servidor desplegado (ej. Render/VPS)
const DEFAULT_API_URL = 'http://192.168.1.50:3000'; // Puedes cambiar esta IP por la IP local de tu PC o tu servidor

export default function App() {
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [inputUrl, setInputUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFormat, setSelectedFormat] = useState(null);

  // Pegar desde el portapapeles
  const pasteFromClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setInputUrl(text);
      }
    } catch (e) {
      console.log('Error leyendo portapapeles:', e);
    }
  };

  // Buscar información del video
  const handleFetchInfo = async () => {
    if (!inputUrl.trim()) {
      Alert.alert('URL requerida', 'Por favor ingresa o pega la URL de un video');
      return;
    }

    setLoading(true);
    setVideoInfo(null);
    setSelectedFormat(null);

    try {
      const response = await fetch(`${apiUrl}/api/info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error procesando el enlace');
      }

      setVideoInfo(data);
      if (data.formats && data.formats.length > 0) {
        setSelectedFormat(data.formats[0]);
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo conectar con el servidor API');
    } finally {
      setLoading(false);
    }
  };

  // Descargar video/audio y guardar en la galería
  const handleDownload = async () => {
    const targetUrl = selectedFormat ? selectedFormat.url : videoInfo?.best_direct_url;
    if (!targetUrl) {
      Alert.alert('Error', 'No hay enlace de descarga disponible');
      return;
    }

    // Solicitar permisos de almacenamiento/galería
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso Denegado', 'Se requiere acceso a la galería para guardar tus descargas');
      return;
    }

    setDownloading(true);
    setProgress(0);

    const ext = selectedFormat?.ext || 'mp4';
    const cleanTitle = (videoInfo.title || 'video_download').replace(/[^a-zA-Z0-9_-]/g, '_');
    const localUri = `${FileSystem.documentDirectory}${cleanTitle}_${Date.now()}.${ext}`;

    const downloadResumable = FileSystem.createDownloadResumable(
      targetUrl,
      localUri,
      {},
      (downloadProgress) => {
        const pct = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        if (!isNaN(pct)) {
          setProgress(Math.round(pct * 100));
        }
      }
    );

    try {
      const result = await downloadResumable.downloadAsync();
      if (result?.uri) {
        // Guardar archivo en la Galería
        const asset = await MediaLibrary.createAssetAsync(result.uri);
        let album = await MediaLibrary.getAlbumAsync('OTK VIDEO');
        if (!album) {
          await MediaLibrary.createAlbumAsync('OTK VIDEO', asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }

        Alert.alert('¡Descarga Completada! 🎉', 'El archivo se ha guardado exitosamente en tu galería.');
      }
    } catch (e) {
      Alert.alert('Error en descarga', e.message || 'Fallo al descargar el archivo');
    } finally {
      setDownloading(false);
      setProgress(0);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.badge}>OTK RADAR</Text>
          <Text style={styles.title}>OTK VIDEO</Text>
          <Text style={styles.subtitle}>Descarga de YouTube, TikTok, Instagram, Twitter y más</Text>
        </View>

        {/* Input Card */}
        <View style={styles.card}>
          <Text style={styles.label}>URL del Video</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="https://www.youtube.com/watch?v=..."
              placeholderTextColor="#94A3B8"
              value={inputUrl}
              onChangeText={setInputUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.pasteBtn} onPress={pasteFromClipboard}>
              <Text style={styles.pasteBtnText}>📋 Pegar</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.mainBtn, loading && styles.disabledBtn]}
            onPress={handleFetchInfo}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.mainBtnText}>Analizar Video</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Result Card */}
        {videoInfo && (
          <View style={styles.resultCard}>
            {videoInfo.thumbnail && (
              <Image source={{ uri: videoInfo.thumbnail }} style={styles.thumbnail} resizeMode="cover" />
            )}

            <Text style={styles.videoTitle}>{videoInfo.title}</Text>
            {videoInfo.uploader && (
              <Text style={styles.uploader}>Canal / Creador: {videoInfo.uploader}</Text>
            )}

            {/* Formats Selector */}
            <Text style={styles.sectionLabel}>Seleccionar Calidad / Formato:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.formatScroll}>
              {videoInfo.formats.map((fmt, index) => {
                const isSelected = selectedFormat?.format_id === fmt.format_id;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.formatChip, isSelected && styles.selectedFormatChip]}
                    onPress={() => setSelectedFormat(fmt)}
                  >
                    <Text style={[styles.formatChipText, isSelected && styles.selectedFormatChipText]}>
                      {fmt.resolution} ({fmt.ext.toUpperCase()})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Download Progress */}
            {downloading && (
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>Descargando: {progress}%</Text>
                <View style={styles.progressBarBackground}>
                  <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                </View>
              </View>
            )}

            {/* Action Button */}
            <TouchableOpacity
              style={[styles.downloadBtn, downloading && styles.disabledBtn]}
              onPress={handleDownload}
              disabled={downloading}
            >
              {downloading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.downloadBtnText}>
                  Descargar {selectedFormat ? selectedFormat.resolution : 'Video'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Config / Server IP Input */}
        <View style={styles.configCard}>
          <Text style={styles.configTitle}>⚙️ Configuración de Servidor API</Text>
          <TextInput
            style={styles.configInput}
            value={apiUrl}
            onChangeText={setApiUrl}
            placeholder="http://192.168.x.x:3000 o https://tu-backend.render.com"
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#EFF6FF',
    color: '#0066FF',
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 6,
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  pasteBtn: {
    marginLeft: 8,
    backgroundColor: '#E2E8F0',
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pasteBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  mainBtn: {
    backgroundColor: '#0066FF',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  thumbnail: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  uploader: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  formatScroll: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  formatChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedFormatChip: {
    backgroundColor: '#0066FF',
    borderColor: '#0066FF',
  },
  formatChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  selectedFormatChipText: {
    color: '#FFFFFF',
  },
  downloadBtn: {
    backgroundColor: '#10B981',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  progressContainer: {
    marginBottom: 14,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0066FF',
    marginBottom: 6,
    textAlign: 'center',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0066FF',
  },
  disabledBtn: {
    opacity: 0.6,
  },
  configCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10,
  },
  configTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
  },
  configInput: {
    fontSize: 12,
    color: '#334155',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
});
