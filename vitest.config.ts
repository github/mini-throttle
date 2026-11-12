import {defineConfig} from 'vitest/config'
import {playwright} from '@vitest/browser-playwright'

export default defineConfig({
  test: {
    include: ['test/**/*.ts'],
    // Type-only fixture for standard decorators; see test/standard/tsconfig.json
    exclude: ['test/standard/**'],
    browser: {
      enabled: true,
      instances: [
        {
          browser: 'chromium'
        }
      ],
      provider: playwright(),
      headless: true
    }
  }
})
