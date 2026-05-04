# AGENTS.md

You are an expert in JavaScript, Rspack, Rsbuild, Rslib, and library development. You write maintainable, performant, and accessible code.

## Commands

- `pnpm run build` - Build the library for production
- `pnpm run dev` - Turn on watch mode, watch for changes and rebuild the library

## Docs

- Rslib: https://rslib.rs/llms.txt
- Rsbuild: https://rsbuild.rs/llms.txt
- Rspack: https://rspack.rs/llms.txt
- Rstest: https://rstest.rs/llms.txt
- Rspress: https://rspress.rs/llms.txt

## Tools

### Rstest

- Run `pnpm run test` to run tests
- Run `pnpm run test:watch` to run tests in watch mode

### Rspress

- Run `pnpm run doc` to start the Rspress documentation dev server, which will also start Rslib in watch mode
- Run `pnpm run doc:build` to build the documentation


## Notes

### Testing

- Run the changed test file first (`pnpm exec rstest 'tests/xxx.test.ts'`), then run the full test suite (`pnpm run test`) after it passes

### Code Style

- Utility function comments must use JSDoc format (`/** ... */`)
