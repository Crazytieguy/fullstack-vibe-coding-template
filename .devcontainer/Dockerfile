FROM node:bookworm

RUN apt-get update && apt-get install -y ripgrep sudo
RUN echo "node ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers
RUN corepack install -g pnpm && corepack enable pnpm
RUN pnpm config set global-bin-dir /usr/local/bin/ && pnpm config set global-dir /opt/pnpm-store
RUN pnpm install -g @anthropic-ai/claude-code

# Support for Playwright
RUN apt-get install -y libgtk-3-0 libx11-xcb1 libxcomposite1 libxcursor1 libxdamage1 libxi6 libxtst6 libnss3 libxrandr2 libasound2 libpangocairo-1.0-0 libatk1.0-0 libatk-bridge2.0-0 libepoxy0 libgbm-dev libxshmfence1 openssh-client xvfb && rm -rf /var/lib/apt/lists/*


USER node
RUN corepack install -g pnpm && corepack enable pnpm