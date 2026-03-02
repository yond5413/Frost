import fs from 'node:fs';

const filePath = new URL('../src/data/story.ts', import.meta.url);
const text = fs.readFileSync(filePath, 'utf8');

const sceneRegex = /\n\s*([a-zA-Z0-9_]+):\s*{\n\s*id:\s*'([^']+)'([\s\S]*?)(?=\n\s*[a-zA-Z0-9_]+:\s*{|\n};)/g;
const nextSceneRegex = /nextScene:\s*'([^']+)'/g;

const scenes = new Map();

for (const match of text.matchAll(sceneRegex)) {
  const key = match[1];
  const id = match[2];
  const body = match[3] ?? '';
  const nextScenes = [...body.matchAll(nextSceneRegex)].map((m) => m[1]);
  const aiDriven = /aiDriven:\s*true/.test(body);
  const isEnding = /isEnding:\s*true/.test(body);
  scenes.set(id, { key, id, nextScenes, aiDriven, isEnding });
}

const startId = 'prologue_start';
if (!scenes.has(startId)) {
  console.error('Progression smoke failed: missing prologue_start scene.');
  process.exit(1);
}

const visited = new Set();
const queue = [startId];

while (queue.length > 0) {
  const id = queue.shift();
  if (!id || visited.has(id)) continue;
  visited.add(id);
  const scene = scenes.get(id);
  if (!scene) continue;
  scene.nextScenes.forEach((nextId) => {
    if (!visited.has(nextId)) queue.push(nextId);
  });
}

const reachable = [...visited].map((id) => scenes.get(id)).filter(Boolean);
const reachableAi = reachable.filter((scene) => scene.aiDriven);
const reachableDeterministic = reachable.filter((scene) => !scene.aiDriven);
const reachableEndings = reachable.filter((scene) => scene.isEnding);

const missingTargets = [];
for (const scene of scenes.values()) {
  for (const nextId of scene.nextScenes) {
    if (!scenes.has(nextId)) missingTargets.push(`${scene.id} -> ${nextId}`);
  }
}

if (missingTargets.length > 0) {
  console.error('Progression smoke failed: missing scene targets:');
  missingTargets.forEach((target) => console.error(` - ${target}`));
  process.exit(1);
}

if (reachableAi.length === 0) {
  console.error('Progression smoke failed: no reachable aiDriven scenes from prologue_start.');
  process.exit(1);
}

if (reachableDeterministic.length === 0) {
  console.error('Progression smoke failed: no reachable deterministic scenes from prologue_start.');
  process.exit(1);
}

if (reachableEndings.length === 0) {
  console.error('Progression smoke failed: no reachable endings from prologue_start.');
  process.exit(1);
}

console.log(
  `Progression smoke passed: reachable=${reachable.length}, aiDriven=${reachableAi.length}, deterministic=${reachableDeterministic.length}, endings=${reachableEndings.length}`
);
