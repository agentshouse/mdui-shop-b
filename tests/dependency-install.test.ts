import fs from 'node:fs';
import { expect, it } from 'vitest';

it('keeps the pinned dependency manifest and npm ci lockfile in sync', () => {
  const manifest = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
  expect(lock.lockfileVersion).toBe(3);
  expect(lock.packages[''].dependencies).toEqual(manifest.dependencies);
  expect(lock.packages[''].devDependencies).toEqual(manifest.devDependencies);
});

it('records the donor lockfile peer-resolution policy in the project itself', () => {
  // Keep plain npm ci independent of an installer's user/global npm settings.
  // Revisit this guard together with the documented donor dependency migration.
  const settings = fs.readFileSync('.npmrc', 'utf8').split(/\r?\n/)
    .map(line => line.trim()).filter(line => line && !line.startsWith('#'));
  expect(settings).toEqual(['legacy-peer-deps=true']);
  expect(fs.readFileSync('README.md', 'utf8')).toContain('legacy-peer-deps=true');
});
