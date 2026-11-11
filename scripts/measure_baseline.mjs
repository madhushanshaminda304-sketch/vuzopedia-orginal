/**
 * Baseline Performance Measurement Script for Ded Vuzoped Assistant
 * 
 * Measures current:
 * 1. Time to First Content (TTFC)
 * 2. Total Completion Time (TCT)
 * Under current non-streaming complete-buffered architecture.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAssistantServer } from '../server/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runBaseline() {
  console.log('=== MEASURING BASELINE ASSISTANT RESPONSIVENESS ===\n');

  const testPort = 4205;
  const server = createAssistantServer();
  await new Promise((resolve) => server.listen(testPort, resolve));

  const queries = [
    { name: 'Factual lookup: Dormitory in BMSTU', prompt: 'Сколько стоит общежитие в Бауманке?' },
    { name: 'Factual lookup: Military in HSE', prompt: 'Есть ли военная кафедра в ВШЭ?' },
    { name: 'Deterministic tool: Credit 3%', prompt: 'Как работает образовательный кредит под 3%?' },
    { name: 'Broad advisory: IT universities in Moscow', prompt: 'Посоветуй лучшие IT вузы в Москве с общежитием' },
  ];

  const results = [];

  for (const q of queries) {
    const t0 = performance.now();
    let ttfc = 0;
    let tct = 0;

    try {
      const res = await fetch(`http://localhost:${testPort}/api/assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: q.prompt,
          evidence: '<evidence_data>[DATA_RECORD id="src-bmstu"]МГТУ Баумана[/DATA_RECORD]</evidence_data>',
          model: 'gemini-1.5-flash',
        }),
      });

      const data = await res.json();
      tct = Math.round(performance.now() - t0);
      // In current non-streaming architecture, TTFC equals TCT because client gets nothing until the whole response arrives!
      ttfc = tct;

      results.push({
        name: q.name,
        status: res.status,
        ttfc,
        tct,
        hasText: Boolean(data?.rawText),
      });

      console.log(`Query: "${q.name}" -> Status: ${res.status}, TTFC: ${ttfc}ms, TCT: ${tct}ms`);
    } catch (err) {
      console.error(`Error querying "${q.name}":`, err.message);
    }
  }

  await new Promise((resolve) => server.close(resolve));

  console.log('\n--- BASELINE SUMMARY ---');
  console.table(results);
}

runBaseline().catch(console.error);
