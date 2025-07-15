# Design Document: NPM to PNPM Migration

## Overview

This design outlines the migration strategy from npm to pnpm for the DevUtils project. The migration will maintain all existing functionality while leveraging pnpm's benefits including faster installations, reduced disk space usage, and better dependency management through strict node_modules structure.

## Architecture

### Current State Analysis
- **Package Manager**: npm with package-lock.json
- **Project Type**: Vite + React + TypeScript application
- **Dependencies**: 25 production dependencies, 32 development dependencies
- **Scripts**: Standard build, dev, test, lint, and custom screenshot scripts
- **Build Tool**: Vite with TypeScript compilation
- **Testing**: Jest with React Testing Library

### Target State
- **Package Manager**: pnpm with pnpm-lock.yaml
- **Dependency Resolution**: Strict, non-flat node_modules structure
- **Installation Speed**: Improved through content-addressable storage
- **Disk Usage**: Reduced through hard linking
- **Compatibility**: Full compatibility with existing Vite/React/TypeScript setup

## Components and Interfaces

### Package Management Layer
- **Lock File**: Transition from `package-lock.json` to `pnpm-lock.yaml`
- **Node Modules**: Restructured to pnpm's symlinked approach
- **Cache**: Utilize pnpm's global content-addressable cache

### Configuration Management
- **pnpm Configuration**: Optional `.npmrc` or `pnpm-workspace.yaml` if needed
- **Hoisting Settings**: Configure appropriate hoisting for Vite compatibility
- **Peer Dependencies**: Ensure proper peer dependency resolution

### Script Execution
- **Build Scripts**: Maintain compatibility with `tsc && vite build`
- **Development**: Ensure `vite` dev server works with pnpm resolution
- **Testing**: Verify Jest works with pnpm's node_modules structure
- **Custom Scripts**: Maintain `tsx` script execution for screenshot tools

## Data Models

### Package Configuration
```json
{
  "packageManager": "pnpm@8.x.x",
  "engines": {
    "pnpm": ">=8.0.0"
  }
}
```

### PNPM Configuration (if needed)
```yaml
# .npmrc or pnpm configuration
hoist-pattern[]=*eslint*
hoist-pattern[]=*prettier*
hoist-pattern[]=*vite*
```

## Error Handling

### Migration Risks and Mitigations

1. **Dependency Resolution Issues**
   - Risk: Some packages may not resolve correctly with pnpm's strict structure
   - Mitigation: Use hoisting patterns for problematic packages
   - Fallback: Configure shamefully-hoist if needed

2. **Build Tool Compatibility**
   - Risk: Vite may not find dependencies in pnpm's structure
   - Mitigation: Test build process thoroughly
   - Fallback: Configure Vite's resolve.alias if needed

3. **Testing Framework Issues**
   - Risk: Jest may have module resolution problems
   - Mitigation: Update Jest configuration for pnpm compatibility
   - Fallback: Use moduleNameMapper for problematic modules

4. **Script Execution Problems**
   - Risk: Custom scripts (tsx, capture-screenshots) may fail
   - Mitigation: Test all scripts after migration
   - Fallback: Use npx equivalent or adjust script paths

## Testing Strategy

### Pre-Migration Testing
1. Document current functionality baseline
2. Run full test suite with npm
3. Verify all scripts work correctly
4. Test build and preview processes

### Post-Migration Validation
1. **Installation Test**: Fresh clone and pnpm install
2. **Build Test**: Verify `pnpm run build` produces identical output
3. **Development Test**: Confirm `pnpm run dev` works correctly
4. **Testing Suite**: Run `pnpm run test` and verify all tests pass
5. **Script Validation**: Test custom scripts (screenshots, optimization)
6. **Linting**: Ensure `pnpm run lint` works correctly

### Compatibility Testing
1. **Dependency Resolution**: Verify all dependencies are correctly resolved
2. **Peer Dependencies**: Check for peer dependency warnings/errors
3. **Module Loading**: Test that all imports work correctly
4. **Build Output**: Compare build artifacts before and after migration

## Implementation Approach

### Phase 1: Preparation
- Backup current state (package-lock.json, node_modules)
- Document current working state
- Install pnpm globally if not present

### Phase 2: Core Migration
- Remove package-lock.json and node_modules
- Install dependencies with pnpm
- Update package.json with pnpm-specific configurations
- Test basic functionality

### Phase 3: Configuration Optimization
- Add pnpm configuration if needed for compatibility
- Configure hoisting patterns for problematic dependencies
- Optimize for project-specific needs

### Phase 4: Documentation and Cleanup
- Update README.md with pnpm instructions
- Update .gitignore for pnpm-lock.yaml
- Remove npm-specific artifacts
- Update any CI/CD references (if applicable)

## Rollback Strategy

If migration fails:
1. Restore package-lock.json from backup
2. Remove pnpm-lock.yaml and node_modules
3. Run `npm install` to restore original state
4. Document issues encountered for future attempts