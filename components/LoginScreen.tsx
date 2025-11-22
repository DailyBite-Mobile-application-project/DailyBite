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

export function LoginScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { login } = useApp();

  const handleSubmit = () => {
    const user = {
      id: '1',
      name: name || 'Jan Kowalski',
      email,
      goal: 'Weight Loss',
      targetCalories: 2000
    };

    login(user);
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
        {/* LOGIN */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10
            }}
          >
            <Leaf size={80} color="#ffffffff" />
          </View>

          <Text style={{ fontSize: 32, color: 'white', fontWeight: '700' }}>
            DailyBites
          </Text>

          <Text style={{ color: '#f5f5f5ff', marginTop: 4 }}>
            Your personal diet companion
          </Text>
        </View>

        {/* FORM */}
        <View
          style={{
            borderRadius: 24,
            padding: 24
          }}
        >
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
              <Text
                style={{
                  color: !isSignUp ? '#3a3a3aff' : '#ffffffff',
                  fontWeight: '600'
                }}
              >
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
              <Text
                style={{
                  color: isSignUp ? '#3a3a3aff' : '#ffffffff',
                  fontWeight: '600'
                }}
              >
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
            />
          )}

          <Field
            icon={Mail}
            value={email}
            onChange={setEmail}
            placeholder="Email"
          />

          <Field
            icon={Lock}
            value={password}
            onChange={setPassword}
            placeholder="Password"
            secure
          />

          {/* FORGOT PASSWORD */}
          {!isSignUp && (
            <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 16 }}>
              <Text style={{ color: '#f5f5f5ff', fontWeight: '500' }}>
                Forgot password?
              </Text>
            </TouchableOpacity>
          )}

          {/* SUBMIT */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={{
              backgroundColor: '#ffffffff',
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: '#3a3a3aff', fontWeight: '700', fontSize: 16 }}>
              {isSignUp ? 'Create Account' : 'Login'}
            </Text>
          </TouchableOpacity>

          {/* TERMS */}
          {isSignUp && (
            <Text
              style={{
                textAlign: 'center',
                color: '#f5f5f5ff',
                marginTop: 16
              }}
            >
              By signing up, you agree to our Terms & Privacy Policy
            </Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ icon: Icon, value, onChange, placeholder, secure = false }) {
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
        style={{
          paddingLeft: 40,
          paddingVertical: 12,
          backgroundColor: '#f9fafb',
          borderWidth: 1,
          borderColor: '#ddddddff',
          borderRadius: 12,
          fontSize: 15,
          color: '#222222ff'
        }}
      />
    </View>
  );
}
