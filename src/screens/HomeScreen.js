// src/screens/HomeScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useAuth } from '../services/AuthContext';
import { SECTIONS, isSectionComplete } from '../data/stickers';
import {
  getOrCreateSpreadsheet,
  loadDataFromSheets,
  saveDataToSheets,
  exportToCustomSheet,
} from '../services/googleSheetsService';

export default function HomeScreen({ navigation }) {
  const { user, accessToken, signOut } = useAuth();
  const [allStates, setAllStates] = useState({});
  const [spreadsheetId, setSpreadsheetId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  // Cargar datos al iniciar
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    setLoading(true);
    try {
      const sheetId = await getOrCreateSpreadsheet(accessToken);
      setSpreadsheetId(sheetId);
      const data = await loadDataFromSheets(sheetId, accessToken);

      if (data) {
        setAllStates(data);
      } else {
        // Estado inicial vacío para todas las secciones
        const initial = {};
        SECTIONS.forEach(section => {
          initial[section.id] = {};
          for (let i = 0; i < section.totalStickers; i++) {
            initial[section.id][i] = false;
          }
        });
        setAllStates(initial);
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo conectar con Google Sheets. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  // Llamado desde StickerPage al volver con cambios
  const handleReturnFromSection = useCallback((sectionId, newStickerState) => {
    setAllStates(prev => {
      const updated = { ...prev, [sectionId]: newStickerState };
      // Auto-guardar en background
      if (spreadsheetId) {
        saveDataToSheets(spreadsheetId, accessToken, updated, SECTIONS).catch(console.error);
      }
      return updated;
    });
  }, [spreadsheetId, accessToken]);

  const handleExport = async () => {
    setMenuVisible(false);
    setExporting(true);
    try {
      const exportId = await exportToCustomSheet(accessToken, allStates, SECTIONS);
      if (exportId) {
        Alert.alert(
          'Exportación exitosa',
          'El archivo "fichas" ha sido guardado/actualizado en tu Google Drive.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'No se pudo exportar. Inténtalo de nuevo.');
      }
    } catch (e) {
      Alert.alert('Error', 'Error al exportar.');
    } finally {
      setExporting(false);
    }
  };

  const handleSignOut = () => {
    setMenuVisible(false);
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const getSectionStats = (section) => {
    const state = allStates[section.id] || {};
    const filled = Object.values(state).filter(Boolean).length;
    return { filled, total: section.totalStickers };
  };

  const renderSectionItem = ({ item: section }) => {
    const { filled, total } = getSectionStats(section);
    const complete = filled === total && total > 0;

    return (
      <TouchableOpacity
        style={[
          styles.sectionRow,
          complete ? styles.sectionRowComplete : styles.sectionRowIncomplete,
        ]}
        onPress={() =>
          navigation.navigate('StickerPage', {
            section,
            initialState: allStates[section.id] || {},
            onReturn: handleReturnFromSection,
          })
        }
        activeOpacity={0.75}
      >
        {/* Indicador de color lateral */}
        <View style={[styles.colorIndicator, complete ? styles.colorGreen : styles.colorWhite]} />

        {/* Nombre de la sección */}
        <View style={styles.sectionInfo}>
          <Text style={[styles.sectionTitle, complete && styles.sectionTitleComplete]}>
            {section.title}
          </Text>
          <Text style={styles.sectionProgress}>
            {filled}/{total} fichas
          </Text>
        </View>

        {/* Barra de progreso */}
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${total > 0 ? (filled / total) * 100 : 0}%` },
              complete && styles.progressBarComplete,
            ]}
          />
        </View>

        {/* Ícono de estado */}
        <Text style={styles.arrowIcon}>{complete ? '✅' : '›'}</Text>
      </TouchableOpacity>
    );
  };

  const totalFilled = SECTIONS.reduce((acc, s) => {
    const state = allStates[s.id] || {};
    return acc + Object.values(state).filter(Boolean).length;
  }, 0);
  const totalStickers = SECTIONS.reduce((acc, s) => acc + s.totalStickers, 0);
  const globalPercent = totalStickers > 0 ? Math.round((totalFilled / totalStickers) * 100) : 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Cargando álbum...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>⚽ Álbum Panini</Text>
          <Text style={styles.headerSubtitle}>FWC 2026</Text>
        </View>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
          <Text style={styles.menuIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Barra de progreso global */}
      <View style={styles.globalProgress}>
        <View style={styles.globalProgressHeader}>
          <Text style={styles.globalProgressLabel}>Progreso total</Text>
          <Text style={styles.globalProgressPercent}>{globalPercent}%</Text>
        </View>
        <View style={styles.globalProgressBarBg}>
          <View style={[styles.globalProgressBarFill, { width: `${globalPercent}%` }]} />
        </View>
        <Text style={styles.globalProgressDetail}>
          {totalFilled} de {totalStickers} fichas completadas
        </Text>
      </View>

      {/* Lista de secciones */}
      <FlatList
        data={SECTIONS}
        renderItem={renderSectionItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Menú de opciones */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuModal}>
            {/* Info del usuario */}
            <View style={styles.menuUserInfo}>
              <Text style={styles.menuUserName}>{user?.name}</Text>
              <Text style={styles.menuUserEmail}>{user?.email}</Text>
            </View>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleExport}
              disabled={exporting}
            >
              {exporting ? (
                <ActivityIndicator size="small" color="#4285F4" />
              ) : (
                <Text style={styles.menuItemIcon}>📊</Text>
              )}
              <Text style={styles.menuItemText}>
                {exporting ? 'Exportando...' : 'Exportar a Google Sheets'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.menuItemDanger]} onPress={handleSignOut}>
              <Text style={styles.menuItemIcon}>🚪</Text>
              <Text style={styles.menuItemTextDanger}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {syncing && (
        <View style={styles.syncingBar}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.syncingText}>Guardando...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a2e',
    gap: 16,
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#16213e',
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#4285F4',
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#0f3460',
  },
  menuIcon: {
    fontSize: 22,
    color: '#ffffff',
    fontWeight: '800',
  },
  globalProgress: {
    backgroundColor: '#16213e',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  globalProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  globalProgressLabel: {
    color: '#9ca3af',
    fontSize: 13,
  },
  globalProgressPercent: {
    color: '#4285F4',
    fontSize: 13,
    fontWeight: '700',
  },
  globalProgressBarBg: {
    height: 6,
    backgroundColor: '#0f3460',
    borderRadius: 3,
    overflow: 'hidden',
  },
  globalProgressBarFill: {
    height: '100%',
    backgroundColor: '#34A853',
    borderRadius: 3,
  },
  globalProgressDetail: {
    color: '#6b7280',
    fontSize: 11,
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    gap: 8,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionRowComplete: {
    backgroundColor: '#0d2818',
    borderWidth: 1,
    borderColor: '#34A853',
  },
  sectionRowIncomplete: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  colorIndicator: {
    width: 6,
    height: '100%',
    minHeight: 60,
  },
  colorGreen: {
    backgroundColor: '#34A853',
  },
  colorWhite: {
    backgroundColor: '#e5e7eb',
  },
  sectionInfo: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 4,
  },
  sectionTitleComplete: {
    color: '#4ade80',
  },
  sectionProgress: {
    fontSize: 12,
    color: '#64748b',
  },
  progressBarContainer: {
    width: 60,
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4285F4',
    borderRadius: 2,
  },
  progressBarComplete: {
    backgroundColor: '#34A853',
  },
  arrowIcon: {
    fontSize: 18,
    color: '#64748b',
    paddingRight: 12,
    fontWeight: '700',
  },
  // Modal menú
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: 16,
  },
  menuModal: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    width: 260,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },
  menuUserInfo: {
    padding: 16,
    backgroundColor: '#16213e',
  },
  menuUserName: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  menuUserEmail: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#334155',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  menuItemDanger: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  menuItemIcon: {
    fontSize: 18,
  },
  menuItemText: {
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: '500',
  },
  menuItemTextDanger: {
    color: '#f87171',
    fontSize: 15,
    fontWeight: '500',
  },
  syncingBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#4285F4',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 12,
  },
  syncingText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
