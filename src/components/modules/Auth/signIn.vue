<script setup lang="ts">
import { ref } from 'vue';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../../../firebase';
import { useRouter } from 'vue-router';
import { dataService } from '../../../services/dataContext';
import { authService } from '../../../services/authService';

const router = useRouter();
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const loginWithGoogle = async () => {
  try {
    loading.value = true;
    error.value = '';
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    router.push('/');
    console.log('Logged in user:', user);
  } catch (err: any) {
    error.value = err.message;
    console.error('Google sign-in error:', err.message);
  } finally {
    loading.value = false;
  }
};

const loginWithEmail = async () => {
  if (!email.value || !password.value) {
    error.value = 'Please fill in all fields';
    return;
  }

  // Password validation
  // const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  // if (!passwordRegex.test(password.value)) {
  //   error.value = 'Password must be at least 8 characters long and contain both letters and numbers';
  //   return;
  // }
  
  try {
    loading.value = true;
    error.value = '';
    console.log(email.value, password.value)
    const result : any = await dataService.createOnline('/api/Auth/Login', {
      email: email.value,
      password: password.value
    });
    
    if (result.httpStatus === 200 && result.data?.token) {
      try {
        authService.setToken(result.data.token);
        dataService.setAuthToken(result.data.token);
        console.log(authService.getUser())
        router.push('/');
      } catch (tokenError: any) {
        error.value = tokenError.message || 'Invalid authentication token';
        console.error('Token error:', tokenError);
      }
    } else if(result.httpStatus === 503) {
      error.value = ''
    } else {
      error.value = result.message || 'Login failed';
    }
  } catch (err: any) {
    error.value = err.message || 'An error occurred during login';
    console.error('Email sign-in error:', err);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="sign-in-container">
    <div class="sign-in-wrapper">
      <div class="sign-in-card">
        <div class="card-header">
          <div class="logo-container">
            <div class="logo-circle"></div>
          </div>
          <h2 class="title">Welcome Back</h2>
          <p class="subtitle">Sign in to continue to your account</p>
        </div>

        <form @submit.prevent="loginWithEmail" class="sign-in-form">
          <div class="form-group">
            <div class="input-wrapper">
              <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="Email address"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <div class="input-wrapper">
              <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                id="password"
                v-model="password"
                type="password"
                placeholder="Password"
                required
              />
            </div>
          </div>

          <!-- <div class="form-footer">
            <label class="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#" class="forgot-password">Forgot password?</a>
          </div> -->

          <div v-if="error" class="error-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {{ error }}
          </div>

          <button 
            type="submit" 
            class="sign-in-button"
            :disabled="loading"
          >
            <span v-if="!loading">Sign In</span>
            <div v-else class="loading-spinner"></div>
          </button>
        </form>

        <div class="divider">
          <span>or continue with</span>
        </div>

        <button 
          @click="loginWithGoogle" 
          class="google-button"
          :disabled="loading"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" class="google-icon" />
          <span>Sign in with Google</span>
        </button>

        <!-- <p class="sign-up-prompt">
          Don't have an account? <a href="#" class="sign-up-link">Sign up</a>
        </p> -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.sign-in-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f6f8fd 0%, #f1f4f9 100%);
  padding: 20px;
}

.sign-in-wrapper {
  width: 100%;
  max-width: 420px;
  perspective: 1000px;
}

.sign-in-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 2.5rem;
  border-radius: 24px;
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.02),
    0 1px 3px rgba(0, 0, 0, 0.03),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  transform-style: preserve-3d;
  transition: transform 0.3s ease;
}

.sign-in-card:hover {
  transform: translateY(-2px);
}

.card-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-container {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
}

.logo-circle {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  border-radius: 16px;
  transform: rotate(45deg);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
}

.title {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #64748b;
  font-size: 1rem;
  font-weight: 400;
}

.sign-in-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  position: relative;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: #94a3b8;
  transition: color 0.2s;
}

input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  color: #1e293b;
  background: #f8fafc;
  transition: all 0.2s;
}

input:focus {
  outline: none;
  border-color: #6366f1;
  background: white;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

input:focus + .input-icon {
  color: #6366f1;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  cursor: pointer;
}

.remember-me input[type="checkbox"] {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1.5px solid #e2e8f0;
  cursor: pointer;
}

.forgot-password {
  color: #6366f1;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.forgot-password:hover {
  color: #4f46e5;
}

.sign-in-button {
  width: 100%;
  padding: 0.875rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.sign-in-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
}

.sign-in-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
  color: #64748b;
  font-size: 0.875rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e2e8f0;
}

.divider span {
  padding: 0 1rem;
}

.google-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.875rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  font-size: 1rem;
  font-weight: 500;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.2s;
}

.google-button:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.google-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.google-icon {
  width: 20px;
  height: 20px;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ef4444;
  font-size: 0.875rem;
  padding: 0.75rem;
  background: #fef2f2;
  border-radius: 8px;
  border: 1px solid #fee2e2;
}

.sign-up-prompt {
  text-align: center;
  margin-top: 1.5rem;
  color: #64748b;
  font-size: 0.875rem;
}

.sign-up-link {
  color: #6366f1;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.sign-up-link:hover {
  color: #4f46e5;
}

@media (max-width: 480px) {
  .sign-in-card {
    padding: 1.5rem;
  }
  
  .title {
    font-size: 1.75rem;
  }
  
  .form-footer {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }
}
</style>