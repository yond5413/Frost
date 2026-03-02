import fs from 'node:fs';

const filePath = new URL('../src/data/story.ts', import.meta.url);
const text = fs.readFileSync(filePath, 'utf8');

const sceneIdMatches = [...text.matchAll(/\n\s*[a-zA-Z0-9_]+:\s*{\n\s*id:\s*'([^']+)'/g)];
const nextSceneMatches = [...text.matchAll(/nextScene:\s*'([^']+)'/g)];

const sceneIds = new Set(sceneIdMatches.map((match) => match[1]));
const nextSceneIds = nextSceneMatches.map((match) => match[1]);

const missingTargets = [...new Set(nextSceneIds.filter((id) => !sceneIds.has(id)))];

if (missingTargets.length > 0) {
  console.error('Story graph integrity check failed. Missing scene targets:');
  missingTargets.forEach((id) => console.error(` - ${id}`));
  process.exit(1);
}

console.log(`Story graph integrity check passed: ${sceneIds.size} scenes, ${nextSceneIds.length} transitions.`);
