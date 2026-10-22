import { forwardRef, useEffect, useState } from "react";
import { TextInput, View, type TextInputProps } from "react-native";
import Animated, { interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { Eye, EyeOff, type LucideIcon } from "lucide-react-native";
import { font, radius, useTheme } from "@/lib/theme";
import { Tap } from "./Tap";
import { Text } from "./Text";
import { buzz } from "./haptics";

export interface FieldProps extends Omit<TextInputProps, "style"> {
  label: string;
  icon?: LucideIcon;
  error?: string | null;
  hint?: string;
  secure?: boolean;
  shakeKey?: number;
  right?: React.ReactNode;
}

export const Field = forwardRef<TextInput, FieldProps>(function Field(
  { label, icon: Icon, error, hint, secure, shakeKey, right, value, onFocus, onBlur, multiline, ...rest },
  ref,
) {
  const { t } = useTheme();
  const [focused, setFocused] = useState(false);
  const [reveal, setReveal] = useState(false);
  const up = !!value || focused;
  const f = useSharedValue(0);
  const l = useSharedValue(up ? 1 : 0);
  const e = useSharedValue(error ? 1 : 0);
  const x = useSharedValue(0);

  useEffect(() => {
    f.value = withTiming(focused ? 1 : 0, { duration: 180 });
  }, [focused, f]);
  useEffect(() => {
    l.value = withTiming(up ? 1 : 0, { duration: 170 });
  }, [up, l]);
  useEffect(() => {
    e.value = withTiming(error ? 1 : 0, { duration: 180 });
  }, [error, e]);
  useEffect(() => {
    if (!shakeKey) return;
    buzz("error");
    x.value = withSequence(withTiming(-9, { duration: 55 }), withTiming(9, { duration: 70 }), withTiming(-6, { duration: 60 }), withTiming(0, { duration: 60 }));
  }, [shakeKey, x]);

  const box = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
    borderColor: interpolateColor(e.value, [0, 1], [interpolateColor(f.value, [0, 1], [t.border, t.primary]) as string, t.danger]),
    shadowColor: e.value > 0.5 ? t.danger : t.primary,
    shadowOpacity: interpolate(f.value, [0, 1], [0, 0.22]),
  }));
  const lab = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(l.value, [0, 1], [0, -11]) }, { scale: interpolate(l.value, [0, 1], [1, 0.78]) }],
  }));

  const secureOn = secure && !reveal;
  const h = multiline ? 112 : 60;

  return (
    <View>
      <Animated.View
        style={[
          {
            minHeight: h,
            borderRadius: radius.lg - 4,
            borderWidth: 1.5,
            backgroundColor: t.surface,
            flexDirection: "row",
            alignItems: multiline ? "flex-start" : "center",
            paddingLeft: Icon ? 14 : 16,
            paddingRight: 10,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
          },
          box,
        ]}
      >
        {Icon && (
          <View style={{ marginRight: 11, marginTop: multiline ? 20 : 0 }}>
            <Icon size={20} color={error ? t.danger : focused ? t.primary : t.mute} strokeWidth={2.2} />
          </View>
        )}
        <View style={{ flex: 1, height: multiline ? undefined : h, justifyContent: "center" }}>
          <Animated.Text
            pointerEvents="none"
            numberOfLines={1}
            style={[
              {
                position: "absolute",
                left: 0,
                top: multiline ? 14 : h / 2 - 10,
                fontFamily: font.medium,
                fontSize: 15,
                color: error ? t.danger : focused ? t.primary : t.mute,
                transformOrigin: "left center",
              },
              lab,
            ]}
          >
            {label}
          </Animated.Text>
          <TextInput
            ref={ref}
            value={value}
            multiline={multiline}
            secureTextEntry={secureOn}
            placeholderTextColor={t.mute}
            selectionColor={t.primary}
            cursorColor={t.primary}
            onFocus={(ev) => {
              setFocused(true);
              onFocus?.(ev);
            }}
            onBlur={(ev) => {
              setFocused(false);
              onBlur?.(ev);
            }}
            {...rest}
            style={[{
              fontFamily: font.semibold,
              fontSize: 16,
              color: t.text,
              paddingTop: multiline ? 30 : 18,
              paddingBottom: multiline ? 12 : 0,
              minHeight: multiline ? 96 : undefined,
              textAlignVertical: multiline ? "top" : "center",
            }, { outlineStyle: "none" } as object]}
          />
        </View>
        {secure ? (
          <Tap haptic="select" onPress={() => setReveal((r) => !r)} hitSlop={10} style={{ padding: 8 }} accessibilityLabel={reveal ? "Hide password" : "Show password"}>
            {reveal ? <EyeOff size={20} color={t.mute} /> : <Eye size={20} color={t.mute} />}
          </Tap>
        ) : (
          right
        )}
      </Animated.View>
      {error ? (
        <Animated.View style={{ flexDirection: "row", marginTop: 6, marginLeft: 4 }}>
          <Text v="small" color="danger" accessibilityRole="alert">{error}</Text>
        </Animated.View>
      ) : hint ? (
        <Text v="small" color="mute" style={{ marginTop: 6, marginLeft: 4 }}>{hint}</Text>
      ) : null}
    </View>
  );
});
