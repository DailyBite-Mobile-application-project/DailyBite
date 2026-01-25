import { useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  type KeyboardTypeOptions
} from 'react-native';
import { Mail, Lock, User, Leaf } from 'lucide-react-native';
import { useApp } from './AppContext';
import { signup, login as apiLogin, getMe } from './api';
import { useT } from './i18n';
import { useTheme } from './theme';

export function LoginScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const { login, language, setLanguage, theme } = useApp();
  const t = useT();
  const colors = useTheme();

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const nameRef = useRef<TextInput>(null);

  // DEV BYPASS (offline login) - tylko do testów
  // Dane: dev@local / dev
  const isDevBypass = useMemo(() => {
    return (
      __DEV__ &&
      !isSignUp &&
      email.trim().toLowerCase() === 'dev@local' &&
      password === 'dev'
    );
  }, [email, password, isSignUp]);

  const validate = () => {
    const newErrors: typeof errors = {};

    if (isSignUp && name.trim().length < 2) newErrors.name = t('err.nameShort');
    if (!email.includes('@')) newErrors.email = t('err.badEmail');

    if (!isDevBypass && !password.trim()) newErrors.password = t('err.passShort');

    if (isSignUp && !isDevBypass && password.length < 6) newErrors.password = t('err.passShort');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const normalizeErrorMessage = (err: unknown) => {
    if (err instanceof Error) return err.message || t('err.generic');
    if (typeof err === 'string') return err;

    try {
      return JSON.stringify(err);
    } catch {
      return t('err.generic');
    }
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();

    if (!validate()) return;

    // DEV BYPASS
    if (isDevBypass) {
      setErrors({});
      setLoading(true);

      login({
        access_token: 'dev-access-token',
        refresh_token: 'dev-refresh-token',
        user: { id: 'dev', name: 'Developer', email: 'dev@local' }
      } as any);

      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const safeEmail = email.trim().toLowerCase();

      if (isSignUp) {
        await signup({ email: safeEmail, password, name: name.trim() });
      }

      const tokens = await apiLogin({ email: safeEmail, password });

      let me: any = null;
      try {
        me = await getMe(tokens.access_token);
      } catch {
        me = { email: safeEmail, name: name.trim() || '' };
      }

      const mergedUser = {
        ...(tokens as any).user,
        ...me,
        name: (me?.name && String(me.name).trim()) || (tokens as any).user?.name || name.trim() || ''
      };

      login({ ...tokens, user: mergedUser } as any);
    } catch (err: unknown) {
      setErrors(prev => ({ ...prev, email: normalizeErrorMessage(err) }));
    } finally {
      setLoading(false);
    }
  };

  const showForgotPasswordInfo = () => {
    Alert.alert(t('login.forgot.title'), t('login.forgot.msg'), [{ text: t('common.ok') }]);
  };

  const brandBg = theme === 'dark' ? '#0b3d2a' : '#00c056ff';
  const topInset = Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: brandBg }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            backgroundColor: brandBg,
            justifyContent: 'center',
            paddingHorizontal: 20,
            paddingBottom: 32,
            paddingTop: 20 + topInset
          }}
        >
          {/* LANGUAGE SWITCH */}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 12 }}>
            <LangBtn
              label="PL"
              active={language === 'pl'}
              onPress={() => setLanguage('pl')}
              colors={colors}
            />
            <View style={{ width: 8 }} />
            <LangBtn
              label="EN"
              active={language === 'en'}
              onPress={() => setLanguage('en')}
              colors={colors}
            />
          </View>

          {/* LOGO */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <Leaf size={80} color="#ffffff" />
            <Text style={{ fontSize: 32, color: 'white', fontWeight: '700', marginTop: 10 }}>
              DailyBites
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.90)', marginTop: 4 }}>
              {t('login.tagline')}
            </Text>
          </View>

          {/* FORM */}
          <View
            style={{
              borderRadius: 24,
              padding: 24,
              backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.25)' : '#ffffff22',
              borderWidth: 1,
              borderColor: theme === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.12)'
            }}
          >
            {/* TABS */}
            <View style={{ flexDirection: 'row', marginBottom: 20 }}>
              <TouchableOpacity
                onPress={() => setIsSignUp(false)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  backgroundColor: !isSignUp ? '#ffffff' : 'rgba(255,255,255,0.55)',
                  borderRadius: 12,
                  alignItems: 'center',
                  marginRight: 6
                }}
              >
                <Text style={{ color: !isSignUp ? '#1f2937' : '#ffffff', fontWeight: '600' }}>
                  {t('login.tab.login')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsSignUp(true)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  backgroundColor: isSignUp ? '#ffffff' : 'rgba(255,255,255,0.55)',
                  borderRadius: 12,
                  alignItems: 'center',
                  marginLeft: 6
                }}
              >
                <Text style={{ color: isSignUp ? '#1f2937' : '#ffffff', fontWeight: '600' }}>
                  {t('login.tab.signup')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* NAME FIELD */}
            {isSignUp && (
              <Field
                inputRef={nameRef}
                icon={User}
                value={name}
                onChange={setName}
                placeholder={t('login.name.placeholder')}
                error={errors.name}
                colors={colors}
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                textContentType="name"
                autoCorrect={false}
                autoCapitalize="words"
              />
            )}

            {/* EMAIL */}
            <Field
              inputRef={emailRef}
              icon={Mail}
              value={email}
              onChange={setEmail}
              placeholder={t('login.email.placeholder')}
              error={errors.email}
              keyboardType="email-address"
              colors={colors}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              textContentType="emailAddress"
              autoCorrect={false}
              autoCapitalize="none"
            />

            {/* PASSWORD */}
            <Field
              inputRef={passwordRef}
              icon={Lock}
              value={password}
              onChange={setPassword}
              placeholder={t('login.password.placeholder')}
              secure
              error={errors.password}
              colors={colors}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              textContentType={isSignUp ? 'newPassword' : 'password'}
              autoCorrect={false}
              autoCapitalize="none"
            />

            {/* FORGOT PASSWORD */}
            {!isSignUp && (
              <TouchableOpacity
                onPress={showForgotPasswordInfo}
                style={{ alignSelf: 'flex-end', marginBottom: 16 }}
              >
                <Text style={{ color: 'rgba(255,255,255,0.90)', fontWeight: '500' }}>
                  {t('login.forgot')}
                </Text>
              </TouchableOpacity>
            )}

            {/* SUBMIT */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              style={{
                backgroundColor: loading ? 'rgba(255,255,255,0.7)' : '#ffffff',
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: '#1f2937', fontWeight: '700', fontSize: 16 }}>
                {loading ? t('login.wait') : isSignUp ? t('login.create') : t('login.tab.login')}
              </Text>
            </TouchableOpacity>

            {/* TERMS */}
            {isSignUp && (
              <Text style={{ textAlign: 'center', color: 'rgba(255,255,255,0.90)', marginTop: 16 }}>
                {t('login.terms')}
              </Text>
            )}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

function LangBtn({
  label,
  active,
  onPress,
  colors
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useTheme>;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: active ? '#ffffff' : 'rgba(255,255,255,0.45)',
        borderWidth: 1,
        borderColor: active ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.18)'
      }}
    >
      <Text style={{ fontWeight: '700', color: '#1f2937' }}>{label}</Text>
    </TouchableOpacity>
  );
}

type FieldProps = {
  icon: any;
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
  secure?: boolean;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  colors: ReturnType<typeof useTheme>;
  inputRef?: React.RefObject<TextInput>;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  onSubmitEditing?: () => void;
  textContentType?: any;
  autoCorrect?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

function Field({
  icon: Icon,
  value,
  onChange,
  placeholder,
  secure = false,
  error,
  keyboardType,
  colors,
  inputRef,
  returnKeyType,
  onSubmitEditing,
  textContentType,
  autoCorrect,
  autoCapitalize
}: FieldProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ position: 'absolute', left: 12, top: 16 }}>
        <Icon size={18} color={colors.muted} />
      </View>

      <TextInput
        ref={inputRef}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChange}
        secureTextEntry={secure}
        autoCapitalize={autoCapitalize ?? 'none'}
        keyboardType={keyboardType ?? 'default'}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        textContentType={textContentType}
        autoCorrect={autoCorrect}
        style={{
          paddingLeft: 40,
          paddingVertical: 12,
          backgroundColor: colors.input,
          borderWidth: 1,
          borderColor: error ? '#ff4d4d' : colors.border,
          borderRadius: 12,
          fontSize: 15,
          color: colors.text
        }}
      />

      {error && (
        <Text style={{ color: '#ff4d4d', marginTop: 4, marginLeft: 4, fontSize: 13 }}>
          {error}
        </Text>
      )}
    </View>
  );
}
