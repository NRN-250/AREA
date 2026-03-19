FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Install expo CLI and EAS CLI globally
RUN npm install -g expo-cli @expo/ngrok

# Copy application code
COPY . .

# Create export directory
RUN mkdir -p /export-apk

# Build web bundle as fallback (APK requires EAS Build or local Android SDK)
# For now, create a placeholder and documentation
RUN echo "AREA Mobile Application" > /export-apk/README.txt && \
    echo "------------------------" >> /export-apk/README.txt && \
    echo "" >> /export-apk/README.txt && \
    echo "To build the APK locally:" >> /export-apk/README.txt && \
    echo "1. Install EAS CLI: npm install -g eas-cli" >> /export-apk/README.txt && \
    echo "2. Login to Expo: eas login" >> /export-apk/README.txt && \
    echo "3. Build APK: eas build --platform android --profile preview" >> /export-apk/README.txt

# Create a placeholder APK for testing (will be replaced by real APK when built)
RUN echo "PK" > /export-apk/area.apk && \
    echo "AREA Mobile Placeholder APK - Replace with real APK from EAS build" >> /export-apk/area.apk

# Create startup script in /usr/local/bin (won't be overwritten by volume mount)
RUN echo '#!/bin/sh' > /usr/local/bin/start-expo.sh && \
    echo '# Create placeholder APK if it does not exist' >> /usr/local/bin/start-expo.sh && \
    echo 'if [ ! -f /export-apk/area.apk ]; then' >> /usr/local/bin/start-expo.sh && \
    echo '  echo "PK" > /export-apk/area.apk' >> /usr/local/bin/start-expo.sh && \
    echo '  echo "AREA Mobile Placeholder - Replace with real APK" >> /export-apk/area.apk' >> /usr/local/bin/start-expo.sh && \
    echo 'fi' >> /usr/local/bin/start-expo.sh && \
    echo 'cd /app && exec npx expo start --port 19000 --lan' >> /usr/local/bin/start-expo.sh && \
    chmod +x /usr/local/bin/start-expo.sh

EXPOSE 19000 19001 19002

# Set CI=1 for non-interactive mode
ENV CI=1

# Start with our custom script from /usr/local/bin
CMD ["/bin/sh", "/usr/local/bin/start-expo.sh"]

