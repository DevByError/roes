import { useEffect, useState, type ReactNode } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { radius, useTheme } from "@/lib/theme";
import { Tap } from "./Tap";
import { Text } from "./Text";

export function Sheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
  footer,
  scroll = true,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
}) {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [mounted, setMounted] = useState(visible);
  const p = useSharedValue(0);
  const drag = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      drag.value = 0;
      p.value = withSpring(1, { damping: 22, stiffness: 230, mass: 0.9 });
    } else if (mounted) {
      p.value = withTiming(0, { duration: 210 }, (done) => {
        if (done) runOnJS(setMounted)(false);
      });
    }
  }, [visible]);

  const pan = Gesture.Pan()
    .activeOffsetY(8)
    .onUpdate((e) => {
      drag.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > 110 || e.velocityY > 900) runOnJS(onClose)();
      else drag.value = withSpring(0, { damping: 20, stiffness: 240 });
    });

  const panel = useAnimatedStyle(() => ({ transform: [{ translateY: interpolate(p.value, [0, 1], [height, 0]) + drag.value }] }));
  const scrim = useAnimatedStyle(() => ({ opacity: p.value }));

  if (!mounted) return null;
  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View style={[{ position: "absolute", inset: 0, backgroundColor: t.scrim }, scrim]}>
          <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Close" />
        </Animated.View>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, justifyContent: "flex-end" }} pointerEvents="box-none">
          <Animated.View
            style={[
              {
                maxHeight: height * 0.9,
                backgroundColor: t.surface,
                borderTopLeftRadius: radius.xl,
                borderTopRightRadius: radius.xl,
                paddingBottom: Math.max(insets.bottom, 14),
                width: "100%",
                maxWidth: 560,
                alignSelf: "center",
              },
              panel,
            ]}
          >
            <GestureDetector gesture={pan}>
              <View collapsable={false}>
                <View style={{ alignItems: "center", paddingTop: 10, paddingBottom: 6 }}>
                  <View style={{ width: 42, height: 5, borderRadius: 3, backgroundColor: t.border }} />
                </View>
                {title ? (
                  <View style={{ flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 22, paddingTop: 6, paddingBottom: 12, gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text v="heading">{title}</Text>
                      {subtitle ? <Text v="small" color="sub" style={{ marginTop: 3 }}>{subtitle}</Text> : null}
                    </View>
                    <Tap onPress={onClose} haptic="none" accessibilityLabel="Close" style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: t.surface2, alignItems: "center", justifyContent: "center" }}>
                      <X size={17} color={t.sub} />
                    </Tap>
                  </View>
                ) : null}
              </View>
            </GestureDetector>
            {scroll ? (
              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 8 }} bounces={false}>
                {children}
              </ScrollView>
            ) : (
              <View style={{ paddingHorizontal: 22 }}>{children}</View>
            )}
            {footer ? <View style={{ paddingHorizontal: 22, paddingTop: 10 }}>{footer}</View> : null}
          </Animated.View>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  );
}
