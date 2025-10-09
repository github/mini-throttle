import {defineConfig} from 'vitest/config'
import type {} from '@vitest/browser/providers/playwright'

export default defineConfig({
  test: {
    include: ['test/**/*.ts'],
    browser: {
      enabled: true,
      instances: [
        {
          browser: 'chromium'
        }
      ],
      provider: 'playwright',
      headless: true
    }
  }
})
