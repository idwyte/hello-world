import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useGameStore } from '../../store/gameStore';
import { useOwnerStore } from '../../store/ownerStore';
import { computeModifiers } from '../../engine/traitEngine';
import { calculateSatisfaction, calculateEarnings } from '../../engine/serviceEngine';
import { postReview } from '../../engine/reviewEngine';
import { NAIL_ART_DESIGNS } from '../../data/nailArtDesigns';
import { CustomerHintPanel } from '../../components/service/CustomerHintPanel';
import { ShapeSelector } from '../../components/service/ShapeSelector';
import { ColorPicker } from '../../components/service/ColorPicker';
import { NailArtPanel } from '../../components/service/NailArtPanel';
import { ServiceSummary } from '../../components/service/ServiceSummary';
import { UI, SPACING, FONT, RADIUS } from '../../constants/theme';
import { soundManager } from '../../hooks/useSound';

export default function ServiceScreen() {
  const {
    activeService,
    servicePhase,
    activeCustomers,
    setActiveService,
    setServicePhase,
    finalizePlayerService,
    purchasedUpgradeIds,
  } = useGameStore();

  const ownerProfile = useOwnerStore((s) => s.profile);
  const mods = computeModifiers(ownerProfile?.traits ?? []);

  const customer = activeCustomers.find((c) => c.id === activeService?.customerId);

  // Guard: bail if service was cleared or customer is gone (including mid-session)
  useEffect(() => {
    if (!activeService || !customer) {
      router.replace('/');
    }
  }, [activeService, customer]);

  // Applying phase: compute satisfaction after brief pause, then show complete
  useEffect(() => {
    if (servicePhase !== 'applying' || !activeService || !customer) return;
    soundManager.play('uv_lamp');

    const timer = setTimeout(() => {
      const score = calculateSatisfaction(
        customer.preferredNailShape,
        activeService.selectedShape,
        customer.preferredColorFamily,
        activeService.selectedColor,
        true // player-controlled = +5 personal touch bonus
      );
      setActiveService({ ...activeService, satisfactionScore: score });
      setServicePhase('complete');
    }, 1500);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servicePhase]);

  if (!activeService || !customer) return null;

  // Compute earnings breakdown
  const baseEarnings = calculateEarnings(customer.requestedServiceId, 1);
  const designBonus = activeService.nailArtDesignId
    ? (NAIL_ART_DESIGNS.find((d) => d.id === activeService.nailArtDesignId)?.priceBonus ?? 0)
    : 0;
  const tip = Math.round(customer.tip * mods.tipMultiplier);

  // Does this service include a nail art phase?
  const hasNailArtPhase =
    customer.requestedServiceId === 'nail_art' ||
    purchasedUpgradeIds.includes('nail_art_tools');

  // Phase advance handlers
  const advanceFromShape = () => {
    soundManager.play('nail_file');
    setServicePhase('color_selection');
  };

  const advanceFromColor = () => {
    soundManager.play('polish_stroke');
    setServicePhase(hasNailArtPhase ? 'nail_art' : 'applying');
  };

  const handleNailArtPick = (id: string) => {
    soundManager.play('nail_art_stamp');
    setActiveService({ ...activeService, nailArtDesignId: id });
    setServicePhase('applying');
  };

  const handleNailArtSkip = () => {
    setActiveService({ ...activeService, nailArtDesignId: null });
    setServicePhase('applying');
  };

  const handleDone = () => {
    postReview(customer.id, customer.name, activeService.satisfactionScore, mods.repGainPerInteraction);
    finalizePlayerService(activeService.stationId, baseEarnings + designBonus, tip);
    router.replace('/');
  };

  const canAdvanceShape = !!activeService.selectedShape;
  const canAdvanceColor = !!activeService.selectedColor;

  const ctaLabel = (() => {
    if (servicePhase === 'shape_selection') return 'Next: Choose Color →';
    if (servicePhase === 'color_selection')
      return hasNailArtPhase ? 'Next: Add Art →' : 'Apply Nails →';
    return '';
  })();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <CustomerHintPanel customer={customer} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Shape selection */}
        {servicePhase === 'shape_selection' && (
          <ShapeSelector
            selectedShape={activeService.selectedShape}
            onSelect={(shape) => setActiveService({ ...activeService, selectedShape: shape })}
          />
        )}

        {/* Color selection */}
        {servicePhase === 'color_selection' && (
          <ColorPicker
            selectedColor={activeService.selectedColor}
            onSelect={(color) => setActiveService({ ...activeService, selectedColor: color })}
          />
        )}

        {/* Nail art */}
        {servicePhase === 'nail_art' && (
          <NailArtPanel
            selectedDesignId={activeService.nailArtDesignId}
            onSelect={handleNailArtPick}
            onSkip={handleNailArtSkip}
            purchasedUpgradeIds={purchasedUpgradeIds}
          />
        )}

        {/* Applying — brief hold screen */}
        {servicePhase === 'applying' && (
          <View style={styles.applyingContainer}>
            <Text style={styles.applyingEmoji}>✨</Text>
            <Text style={styles.applyingText}>Applying…</Text>
          </View>
        )}

        {/* Complete — summary */}
        {servicePhase === 'complete' && (
          <ServiceSummary
            customer={customer}
            satisfactionScore={activeService.satisfactionScore}
            earnings={baseEarnings + designBonus}
            tip={tip}
            selectedShape={activeService.selectedShape}
            selectedColor={activeService.selectedColor}
            nailArtDesignId={activeService.nailArtDesignId}
            onDone={handleDone}
          />
        )}
      </ScrollView>

      {/* CTA button for shape + color phases */}
      {(servicePhase === 'shape_selection' || servicePhase === 'color_selection') && (
        <View style={styles.ctaBar}>
          <TouchableOpacity
            style={[
              styles.ctaBtn,
              !(servicePhase === 'shape_selection' ? canAdvanceShape : canAdvanceColor) &&
                styles.ctaBtnDisabled,
            ]}
            onPress={servicePhase === 'shape_selection' ? advanceFromShape : advanceFromColor}
            disabled={servicePhase === 'shape_selection' ? !canAdvanceShape : !canAdvanceColor}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaBtnText}>{ctaLabel}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#FAF3E0' },
  scroll:          { flex: 1 },
  scrollContent:   { paddingBottom: SPACING.xxl },
  applyingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  applyingEmoji: { fontSize: 56 },
  applyingText:  { fontSize: FONT.xl, fontWeight: '700', color: UI.textPrimary, marginTop: SPACING.md },
  ctaBar: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    paddingTop: SPACING.sm,
    backgroundColor: '#FAF3E0',
    borderTopWidth: 1,
    borderTopColor: UI.panelBorder,
  },
  ctaBtn: {
    backgroundColor: UI.btnActive,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  ctaBtnDisabled: { backgroundColor: UI.btnDisabled },
  ctaBtnText:     { color: UI.btnText, fontSize: FONT.lg, fontWeight: '700' },
});
