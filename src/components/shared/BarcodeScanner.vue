<template>
  <div class="barcode-scanner-container">
    <!-- Scanner Button (Mobile Only) -->
    <button 
      v-if="!isScanning && isMobile" 
      @click="startScanner" 
      class="scanner-button"
      type="button"
    >
      <i class="fas fa-barcode"></i>
      Scan Barcode
    </button>

    <!-- Scanner Modal -->
    <div v-if="isScanning" class="scanner-modal">
      <div class="scanner-overlay" @click="stopScanner"></div>
      <div class="scanner-content">
        <div class="scanner-header">
          <h3>Barcode Scanner</h3>
          <button @click="stopScanner" class="close-button">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="scanner-viewport">
          <video 
            ref="videoElement" 
            class="viewport"
            autoplay
            muted
            playsinline
          ></video>
          <div class="scanner-overlay-box">
            <div class="scanner-target"></div>
          </div>
          
          <!-- Loading indicator -->
          <div v-if="isCameraLoading" class="camera-loading">
            <div class="loading-spinner"></div>
            <p>Initializing camera...</p>
          </div>
        </div>
        
        <div class="scanner-instructions">
          <p>Position the barcode within the box</p>
        </div>
        
        <!-- Success Notification -->
        <div v-if="lastScannedCode" class="scan-notification success">
          <i class="fas fa-check-circle"></i>
          <span>Scanned: {{ lastScannedCode }}</span>
        </div>
        
        <!-- Permission Help -->
        <div class="permission-help">
          <p><strong>Having trouble?</strong></p>
          <ul>
            <li>Make sure you're using HTTPS or localhost</li>
            <li>Allow camera permissions when prompted</li>
            <li>Try refreshing the page and try again</li>
            <li>Use Chrome, Firefox, or Safari browser</li>
          </ul>
        </div>
        
        <!-- Debug Info (for troubleshooting) -->
        <details class="debug-info">
          <summary>Debug Information</summary>
          <pre>{{ debugInfo }}</pre>
        </details>
        
        <!-- Test Camera Button -->
        <button @click="testCamera" class="test-camera-btn">
          Test Camera Permissions
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { BrowserMultiFormatReader, Result } from '@zxing/library';

// Props
interface Props {
  onCodeScanned?: (code: string) => void;
}

const props = withDefaults(defineProps<Props>(), {
  onCodeScanned: undefined
});

// Reactive state
const isScanning = ref(false);
const isMobile = ref(false);
const lastScannedCode = ref('');
const isCameraLoading = ref(false);
const debugInfo = ref('');
const videoElement = ref<HTMLVideoElement | null>(null);
let codeReader: BrowserMultiFormatReader | null = null;

// Check if device is mobile
const checkMobile = () => {
  isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Check if browser supports required APIs
const checkBrowserSupport = () => {
  // Check for getUserMedia in different ways (for older browsers)
  const hasGetUserMedia = !!(
    navigator.mediaDevices?.getUserMedia ||
    (navigator as any).getUserMedia ||
    (navigator as any).webkitGetUserMedia ||
    (navigator as any).mozGetUserMedia ||
    (navigator as any).msGetUserMedia
  );
  
  const hasMediaDevices = !!navigator.mediaDevices;
  const hasGetUserMediaDirect = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  
  const supportInfo = {
    hasGetUserMedia,
    hasMediaDevices,
    hasGetUserMediaDirect,
    userAgent: navigator.userAgent,
    protocol: location.protocol,
    hostname: location.hostname,
    isMobile: isMobile.value,
    navigatorKeys: Object.keys(navigator),
    mediaDevicesKeys: navigator.mediaDevices ? Object.keys(navigator.mediaDevices) : []
  };
  
  console.log('Browser support check:', supportInfo);
  debugInfo.value = JSON.stringify(supportInfo, null, 2);
  
  if (!hasGetUserMedia) {
    console.error('getUserMedia not found in navigator:', {
      mediaDevices: !!navigator.mediaDevices,
      getUserMedia: !!(navigator as any).getUserMedia,
      webkitGetUserMedia: !!(navigator as any).webkitGetUserMedia,
      mozGetUserMedia: !!(navigator as any).mozGetUserMedia,
      msGetUserMedia: !!(navigator as any).msGetUserMedia
    });
    alert('Your browser does not support camera access. Please use a modern browser like Chrome, Firefox, or Safari.');
    return false;
  }
  
  return true;
};

// Start barcode scanner
const startScanner = async () => {
  if (!isMobile.value) {
    alert('Barcode scanning is only available on mobile devices');
    return;
  }

  // Check if running on HTTPS (required for camera access)
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    alert('Camera access requires HTTPS. Please use HTTPS or localhost.');
    return;
  }

  // Log browser info for debugging
  checkBrowserSupport();

  try {
    isScanning.value = true;
    isCameraLoading.value = true;
    lastScannedCode.value = '';

    // Wait for the next tick to ensure the video element is rendered
    await nextTick();

    // Initialize ZXing reader
    codeReader = new BrowserMultiFormatReader();
    
    console.log('Checking camera permissions...');
    
    // Get getUserMedia function (with polyfill for older browsers)
    const getUserMedia = navigator.mediaDevices?.getUserMedia ||
      (navigator as any).getUserMedia ||
      (navigator as any).webkitGetUserMedia ||
      (navigator as any).mozGetUserMedia ||
      (navigator as any).msGetUserMedia;

    if (!getUserMedia) {
      throw new Error('getUserMedia not available');
    }

    // First, try to get user media to check permissions
    try {
      const constraints = { 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      };

      console.log('Requesting camera with constraints:', constraints);
      
      const stream = await getUserMedia.call(navigator.mediaDevices || navigator, constraints);
      console.log('Camera permission granted, stream:', stream);
      // Stop the test stream
      stream.getTracks().forEach(track => track.stop());
    } catch (permissionError: any) {
      console.error('Camera permission error:', permissionError);
      throw new Error(`Camera permission denied: ${permissionError.message || 'Unknown error'}`);
    }
    
    // Get available video devices
    const videoInputDevices = await codeReader.listVideoInputDevices();
    console.log('Available video devices:', videoInputDevices);

    if (videoInputDevices.length === 0) {
      throw new Error('No camera devices found');
    }

    // Find back camera (usually the last one)
    const backCamera = videoInputDevices.find(device => 
      device.label.toLowerCase().includes('back') || 
      device.label.toLowerCase().includes('rear') ||
      device.label.toLowerCase().includes('environment')
    ) || videoInputDevices[videoInputDevices.length - 1];

    console.log('Selected camera:', backCamera);

    if (!videoElement.value) {
      throw new Error('Video element not found');
    }

    // Start scanning
    await codeReader.decodeFromVideoDevice(
      backCamera?.deviceId || null,
      videoElement.value,
      (result: Result | null, error: any) => {
        if (result && result.getText() !== lastScannedCode.value) {
          const code = result.getText();
          // Remove leading zero if code is 5 digits and starts with zero
          let processedCode = code;
          if (/^0\d{4}$/.test(code)) {
            processedCode = code.slice(1);
          }
          console.log('Barcode detected:', processedCode);
          lastScannedCode.value = processedCode;
          
          // Call the parent callback
          if (props.onCodeScanned) {
            console.log('Calling onCodeScanned with code:', processedCode);
            props.onCodeScanned(processedCode);
          }
          
          // Show notification for a short time
          setTimeout(() => {
            lastScannedCode.value = '';
          }, 2000);
        }
        
        if (error && error.name !== 'NotFoundException') {
          console.error('Scanning error:', error);
        }
      }
    );

    console.log('Scanner started successfully');
    isCameraLoading.value = false;
  } catch (error: any) {
    console.error('Failed to start scanner:', error);
    
    let errorMessage = 'Failed to initialize camera. Please check camera permissions and try again.';
    
    if (error.name === 'NotAllowedError') {
      errorMessage = 'Camera access denied. Please allow camera permissions and try again.';
    } else if (error.name === 'NotFoundError') {
      errorMessage = 'No camera found on this device.';
    } else if (error.message === 'No camera devices found') {
      errorMessage = 'No camera devices found. Please check your device camera.';
    } else if (error.message && error.message.includes('Camera permission denied')) {
      errorMessage = error.message;
    } else if (error.name === 'NotSupportedError') {
      errorMessage = 'Camera not supported on this device or browser.';
    } else if (error.name === 'NotReadableError') {
      errorMessage = 'Camera is in use by another application. Please close other camera apps and try again.';
    }
    
    console.log('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    alert(errorMessage);
    stopScanner();
  }
};

// Stop barcode scanner
const stopScanner = () => {
  isScanning.value = false;
  isCameraLoading.value = false;
  lastScannedCode.value = '';
  
  if (codeReader) {
    try {
      codeReader.reset();
      codeReader = null;
    } catch (error) {
      console.error('Error stopping scanner:', error);
    }
  }
};

// Test camera permissions manually
const testCamera = async () => {
  try {
    console.log('Testing camera permissions...');
    
    // Get getUserMedia function (with polyfill for older browsers)
    const getUserMedia = navigator.mediaDevices?.getUserMedia ||
      (navigator as any).getUserMedia ||
      (navigator as any).webkitGetUserMedia ||
      (navigator as any).mozGetUserMedia ||
      (navigator as any).msGetUserMedia;

    if (!getUserMedia) {
      throw new Error('getUserMedia not available');
    }

    const constraints = { 
      video: { 
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      } 
    };

    console.log('Testing camera with constraints:', constraints);
    
    const stream = await getUserMedia.call(navigator.mediaDevices || navigator, constraints);
    
    console.log('Camera test successful:', stream);
    alert('Camera permissions are working! You can now try the scanner.');
    
    // Stop the test stream
    stream.getTracks().forEach(track => track.stop());
  } catch (error: any) {
    console.error('Camera test failed:', error);
    alert(`Camera test failed: ${error.message || 'Unknown error'}`);
  }
};

// Lifecycle hooks
onMounted(() => {
  checkMobile();
});

onUnmounted(() => {
  if (isScanning.value) {
    stopScanner();
  }
});
</script>

<style scoped>
.barcode-scanner-container {
  position: relative;
}

.scanner-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.scanner-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.scanner-button:active {
  transform: translateY(0);
}

.scanner-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scanner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
}

.scanner-content {
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 20px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.scanner-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.scanner-header h3 {
  margin: 0;
  color: #2d3748;
  font-size: 18px;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 20px;
  color: #4a5568;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.close-button:hover {
  background-color: #f7fafc;
}

.scanner-viewport {
  position: relative;
  width: 100%;
  max-width: 400px;
  height: 300px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 8px;
}

.viewport {
  width: 100%;
  height: 100%;
}

.scanner-overlay-box {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.scanner-target {
  width: 200px;
  height: 100px;
  border: 2px solid #4299e1;
  border-radius: 8px;
  background: rgba(66, 153, 225, 0.1);
  position: relative;
}

.scanner-target::before,
.scanner-target::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border: 3px solid #4299e1;
}

.scanner-target::before {
  top: -3px;
  left: -3px;
  border-right: none;
  border-bottom: none;
}

.scanner-target::after {
  bottom: -3px;
  right: -3px;
  border-left: none;
  border-top: none;
}

.scanner-instructions {
  text-align: center;
  color: #4a5568;
  font-size: 14px;
  margin-top: 8px;
}

.camera-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.permission-help {
  margin-top: 16px;
  padding: 12px;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.permission-help p {
  margin: 0 0 8px 0;
  color: #2d3748;
  font-weight: 600;
}

.permission-help ul {
  margin: 0;
  padding-left: 20px;
  color: #4a5568;
  font-size: 13px;
}

.permission-help li {
  margin-bottom: 4px;
}

.debug-info {
  margin-top: 16px;
  font-size: 12px;
}

.debug-info summary {
  cursor: pointer;
  color: #4a5568;
  font-weight: 500;
  padding: 8px;
  background: #f1f5f9;
  border-radius: 4px;
}

.debug-info pre {
  margin: 8px 0 0 0;
  padding: 8px;
  background: #1a202c;
  color: #e2e8f0;
  border-radius: 4px;
  font-size: 11px;
  overflow-x: auto;
  white-space: pre-wrap;
}

.test-camera-btn {
  margin-top: 12px;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.test-camera-btn:hover {
  background: #3182ce;
}

.scan-notification {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  animation: slideIn 0.3s ease;
}

.scan-notification.success {
  background: #c6f6d5;
  color: #22543d;
  border: 1px solid #9ae6b4;
}

.scan-notification i {
  font-size: 16px;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile specific styles */
@media (max-width: 768px) {
  .scanner-content {
    padding: 16px;
    max-width: 95vw;
    max-height: 95vh;
  }
  
  .scanner-viewport {
    height: 250px;
  }
  
  .scanner-target {
    width: 180px;
    height: 80px;
  }
}
</style> 