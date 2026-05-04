// src/screens/StickerPage.js
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { getStickerLabel } from '../data/stickers';

const STICKERS_PER_ROW = 5;

export default function StickerPage({ route, navigation }) {
  const { section, initialState, onReturn } = route.params;
  const [stickerState, setStickerState] = useState({ ...initialState });
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const originalState = useRef({ ...initialState });

  const toggleSticker = useCallback((index) => {
    setStickerState(prev => {
      const updated = { ...prev, [index]: !prev[index] };
      // Verificar si hay cambios reales respecto al original
      const anyChange = Object.keys(updated).some(
        k => updated[k] !== originalState.current[k]
      );
      setHasChanges(anyChange);
      return updated;
    });
  }, []);

  const filledCount = Object.values(stickerState).filter(Boolean).length;
  const isComplete = filledCount === section.totalStickers;

  const handleBack = () => {
    if (hasChanges) {
      Alert.alert(
        'Guardar cambios',
        '¿Deseas guardar los cambios antes de regresar?',
        [
          {
            text: 'Descartar',
            style: 'destructive',
            onPress: () => {
              navigation.goBack();
            },
          },
          {
            text: 'Guardar y salir',
            onPress: async () => {
              setSaving(true);
              await onReturn(section.id, stickerState);
              setSaving(false);
              navigation.goBack();
            },
          },
          { text: 'Cancelar', style: 'cancel' },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    setSaving(true);
    try {
      await onReturn(section.id, stickerState);
      originalState.current = { ...stickerState };
      setHasChanges(false);
      Alert.alert('✓ Guardado', 'Los cambios han sido guardados en Google Sheets.');
    } catch (e) {
      Alert.alert('Error', 'No se pudieron guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAll = () => {
    Alert.alert(
      'Marcar todas',
      '¿Marcar todas las fichas como encontradas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            const allFilled = {};
            for (let i = 0; i < section.totalStickers; i++) {
              allFilled[i] = true;
            }
            setStickerState(allFilled);
            setHasChanges(true);
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Limpiar todas',
      '¿Marcar todas las fichas como vacías?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: () => {
            const allEmpty = {};
            for (let i = 0; i < section.totalStickers; i++) {
              allEmpty[i] = false;
            }
            setStickerState(allEmpty);
            setHasChanges(true);
          },
        },
      ]
    );
  };

  // Renderizar cuadrículas de fichas
  const renderStickers = () => {
    const rows = [];
    for (let i = 0; i < section.totalStickers; i += STICKERS_PER_ROW) {
      const rowStickers = [];
      for (let j = i; j < Math.min(i + STICKERS_PER_ROW, section.totalStickers); j++) {
        const filled = stickerState[j] === true;
        rowStickers.push(
          <TouchableOpacity
            key={j}
            style={[styles.stickerBox, filled ? styles.stickerFilled : styles.stickerEmpty]}
            onPress={() => toggleSticker(j)}
            activeOpacity={0.7}
          >
            <Text style={[styles.stickerLabel, filled && styles.stickerLabelFilled]}>
              {getStickerLabel(section, j)}
            </Text>
            {filled && <Text style={styles.stickerCheck}>✓</Text>}
          </TouchableOpacity>
        );
      }
      rows.push(
        <View key={i} style={styles.stickerRow}>
          {rowStickers}
        </View>
      );
    }
    return rows;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      {/* Header con botón de regreso */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backIcon}>‹</Text>
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{section.title}</Text>
        </View>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveButton, !hasChanges && styles.saveButtonDisabled]}
          disabled={!hasChanges || saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveText}>Guardar</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Stats de la sección */}
      <View style={[styles.statsBar, isComplete && styles.statsBarComplete]}>
        <View style={styles.statsItem}>
          <Text style={styles.statsNumber}>{filledCount}</Text>
          <Text style={styles.statsLabel}>Encontradas</Text>
        </View>
        <View style={styles.statsItem}>
          <Text style={styles.statsNumber}>{section.totalStickers - filledCount}</Text>
          <Text style={styles.statsLabel}>Faltantes</Text>
        </View>
        <View style={styles.statsItem}>
          <Text style={[styles.statsNumber, styles.statsPercent]}>
            {Math.round((filledCount / section.totalStickers) * 100)}%
          </Text>
          <Text style={styles.statsLabel}>Completado</Text>
        </View>
        {isComplete && (
          <View style={styles.completeBadge}>
            <Text style={styles.completeBadgeText}>¡COMPLETO! 🎉</Text>
          </View>
        )}
      </View>

      {/* Instrucciones */}
      <View style={styles.instructionsBar}>
        <Text style={styles.instructionsText}>
          Toca cada ficha para marcarla como{' '}
          <Text style={styles.textGreen}>encontrada</Text> o{' '}
          <Text style={styles.textGray}>pendiente</Text>
        </Text>
      </View>

      {/* Cuadrículas de fichas */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stickersGrid}>
          {renderStickers()}
        </View>

        {/* Acciones rápidas */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionBtn} onPress={handleMarkAll}>
            <Text style={styles.quickActionText}>✓ Marcar todas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickActionBtn, styles.quickActionClear]} onPress={handleClearAll}>
            <Text style={[styles.quickActionText, styles.quickActionClearText]}>✕ Limpiar todas</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Barra inferior con indicador de cambios */}
      {hasChanges && (
        <View style={styles.changesBar}>
          <Text style={styles.changesText}>⚠ Tienes cambios sin guardar</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            <Text style={styles.changesAction}>Guardar ahora</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#16213e',
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minWidth: 70,
  },
  backIcon: {
    fontSize: 28,
    color: '#4285F4',
    fontWeight: '300',
    lineHeight: 30,
  },
  backText: {
    fontSize: 15,
    color: '#4285F4',
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#4285F4',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    minWidth: 70,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#334155',
  },
  saveText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#0f3460',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  statsBarComplete: {
    backgroundColor: '#0d2818',
  },
  statsItem: {
    flex: 1,
    alignItems: 'center',
  },
  statsNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
  },
  statsPercent: {
    color: '#4285F4',
  },
  statsLabel: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  completeBadge: {
    backgroundColor: '#34A853',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  completeBadgeText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
  instructionsBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  instructionsText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
  textGreen: {
    color: '#34A853',
    fontWeight: '600',
  },
  textGray: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  stickersGrid: {
    gap: 10,
  },
  stickerRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-start',
  },
  stickerBox: {
    width: 58,
    height: 70,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  stickerEmpty: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  stickerFilled: {
    backgroundColor: '#0d4a1f',
    borderColor: '#34A853',
    shadowColor: '#34A853',
    shadowOpacity: 0.3,
  },
  stickerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 2,
  },
  stickerLabelFilled: {
    color: '#4ade80',
  },
  stickerCheck: {
    fontSize: 16,
    color: '#34A853',
    fontWeight: '800',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  quickActionBtn: {
    flex: 1,
    backgroundColor: '#0d4a1f',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#34A853',
  },
  quickActionClear: {
    backgroundColor: '#2d1515',
    borderColor: '#f87171',
  },
  quickActionText: {
    color: '#4ade80',
    fontSize: 13,
    fontWeight: '700',
  },
  quickActionClearText: {
    color: '#f87171',
  },
  changesBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#854d0e',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  changesText: {
    color: '#fef3c7',
    fontSize: 13,
    fontWeight: '500',
  },
  changesAction: {
    color: '#fbbf24',
    fontSize: 13,
    fontWeight: '700',
  },
});
