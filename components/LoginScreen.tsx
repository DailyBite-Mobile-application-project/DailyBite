import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { Mail, Lock, User, Leaf } from 'lucide-react-native';
import { useApp } from './AppContext';
import { signup, login as apiLogin } from './api';

export function LoginScreen() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
    const { login } = useApp();

    // WALIDACJA
    const validate = () => {
        const newErrors: typeof errors = {};
        if (isSignUp && name.trim().length < 2) newErrors.name = 'Name is too short';
        if (!email.includes('@')) newErrors.email = 'Invalid email address';
        if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            const data = isSignUp
                ? await signup({ name, email, password })
                : await apiLogin({ email, password });
            login(data.user);
        } catch (err: unknown) {
            if (err instanceof Error) setErrors({ email: err.message }); // mo¿esz zmieniæ na bardziej globalny komunikat
            else setErrors({ email: 'Something went wrong' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
        >
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    backgroundColor: '#00c056ff',
                    justifyContent: 'center',
                    padding: 20
                }}
            >
                {/* LOGO */}
                <View style={{ alignItems: 'center', marginBottom: 32 }}>
                    <Leaf size={80} color="#ffffffff" />
                    <Text style={{ fontSize: 32, color: 'white', fontWeight: '700', marginTop: 10 }}>
                        DailyBites
                    </Text>
                    <Text style={{ color: '#f5f5f5ff', marginTop: 4 }}>
                        Your personal diet companion
                    </Text>
                </View>

                {/* FORM */}
                <View style={{ borderRadius: 24, padding: 24, backgroundColor: '#ffffff22' }}>
                    {/* TABS */}
                    <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                        <TouchableOpacity
                            onPress={() => setIsSignUp(false)}
                            style={{
                                flex: 1,
                                paddingVertical: 12,
                                backgroundColor: !isSignUp ? '#ffffffff' : '#aecfbcff',
                                borderRadius: 12,
                                alignItems: 'center',
                                marginRight: 6
                            }}
                        >
                            <Text style={{ color: !isSignUp ? '#3a3a3aff' : '#ffffffff', fontWeight: '600' }}>
                                Login
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setIsSignUp(true)}
                            style={{
                                flex: 1,
                                paddingVertical: 12,
                                backgroundColor: isSignUp ? '#ffffffff' : '#aecfbcff',
                                borderRadius: 12,
                                alignItems: 'center',
                                marginLeft: 6
                            }}
                        >
                            <Text style={{ color: isSignUp ? '#3a3a3aff' : '#ffffffff', fontWeight: '600' }}>
                                Sign Up
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* NAME FIELD */}
                    {isSignUp && (
                        <Field
                            icon={User}
                            value={name}
                            onChange={setName}
                            placeholder="Full Name"
                            error={errors.name}
                        />
                    )}

                    {/* EMAIL */}
                    <Field
                        icon={Mail}
                        value={email}
                        onChange={setEmail}
                        placeholder="Email"
                        error={errors.email}
                    />

                    {/* PASSWORD */}
                    <Field
                        icon={Lock}
                        value={password}
                        onChange={setPassword}
                        placeholder="Password"
                        secure
                        error={errors.password}
                    />

                    {/* FORGOT PASSWORD */}
                    {!isSignUp && (
                        <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 16 }}>
                            <Text style={{ color: '#f5f5f5ff', fontWeight: '500' }}>Forgot password?</Text>
                        </TouchableOpacity>
                    )}

                    {/* SUBMIT */}
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={loading}
                        style={{
                            backgroundColor: loading ? '#cccccc' : '#ffffffff',
                            paddingVertical: 14,
                            borderRadius: 12,
                            alignItems: 'center'
                        }}
                    >
                        <Text style={{ color: '#3a3a3aff', fontWeight: '700', fontSize: 16 }}>
                            {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Login'}
                        </Text>
                    </TouchableOpacity>

                    {/* TERMS */}
                    {isSignUp && (
                        <Text style={{ textAlign: 'center', color: '#f5f5f5ff', marginTop: 16 }}>
                            By signing up, you agree to our Terms & Privacy Policy
                        </Text>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

type FieldProps = {
    icon: any;
    value: string;
    onChange: (text: string) => void;
    placeholder: string;
    secure?: boolean;
    error?: string;
};

function Field({ icon: Icon, value, onChange, placeholder, secure = false, error }: FieldProps) {
    return (
        <View style={{ marginBottom: 16 }}>
            <View style={{ position: 'absolute', left: 12, top: 16 }}>
                <Icon size={18} color="#9ca3af" />
            </View>
            <TextInput
                placeholder={placeholder}
                value={value}
                onChangeText={onChange}
                secureTextEntry={secure}
                autoCapitalize="none"
                keyboardType={placeholder === 'Email' ? 'email-address' : 'default'}
                style={{
                    paddingLeft: 40,
                    paddingVertical: 12,
                    backgroundColor: '#f9fafb',
                    borderWidth: 1,
                    borderColor: error ? '#ff4d4d' : '#ddddddff',
                    borderRadius: 12,
                    fontSize: 15,
                    color: '#222222ff'
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
