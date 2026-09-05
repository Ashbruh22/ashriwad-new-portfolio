import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const roots = ['app', 'components', 'lib', 'public'];
const forbidden = /moncy|yohannan/i;
const rootDirectory = process.cwd();
const violations = [];

async function scanDirectory(relativeDirectory) {
  const absoluteDirectory = path.join(rootDirectory, relativeDirectory);
  const entries = await readdir(absoluteDirectory, { withFileTypes: true });

  await Promise.all(entries.map(async (entry) => {
    const relativePath = path.join(relativeDirectory, entry.name);
    if (forbidden.test(entry.name)) violations.push(`${relativePath} (filename)`);

    if (entry.isDirectory()) {
      await scanDirectory(relativePath);
      return;
    }

    const content = await readFile(path.join(rootDirectory, relativePath), 'utf8');
    if (forbidden.test(content)) violations.push(`${relativePath} (content)`);
  }));
}

await Promise.all(roots.map(scanDirectory));

if (violations.length > 0) {
  console.error('Forbidden copied-site references found:');
  violations.sort().forEach((violation) => console.error(`- ${violation}`));
  process.exit(1);
}

console.log('Prohibited content check passed.');