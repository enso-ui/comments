import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@enso-ui/comments': resolve(__dirname),
            '@enso-ui/ui': resolve(__dirname, '../ui'),
            pinia: resolve(__dirname, 'node_modules/pinia'),
        },
    },
    test: {
        environment: 'jsdom',
    },
});
