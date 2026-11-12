import {defineConfig} from 'vitest/config'
import {playwright} from '@vitest/browser-playwright'
import {ModuleKind, ScriptTarget, transpileModule} from 'typescript'

export default defineConfig({
  plugins: [
    {
      // Oxc only lowers legacy decorators, so compile test/standard with TypeScript's standard decorators instead.
      name: 'standard-decorators',
      enforce: 'pre',
      transform(code: string, id: string) {
        if (!id.includes('/test/standard/')) return
        const {outputText, sourceMapText} = transpileModule(code, {
          fileName: id,
          compilerOptions: {
            experimentalDecorators: false,
            target: ScriptTarget.ES2022,
            module: ModuleKind.ESNext,
            sourceMap: true
          }
        })
        return {code: outputText, map: sourceMapText}
      }
    }
  ],
  test: {
    include: ['test/**/*.ts'],
    // Type-only fixtures; see test/types/tsconfig.json
    exclude: ['test/types/**'],
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
