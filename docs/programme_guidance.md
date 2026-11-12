# Guided programme adviser

“I want to find the right program for me” now starts a local conversational journey before catalogue retrieval or any Gemini request. The journey asks about goals, interests, education, location and annual tuition budget. Each stage supports quick replies; students can also type an answer, skip, go back, restart or stop.

State travels in each saved assistant response. The modal supplies that state with conversation history, so switching conversations cannot share guidance answers. A named-university factual question can temporarily use the ordinary assistant pipeline without discarding the journey.

Recommendations use the existing Russian catalogue only. Programme code groups match broad interests; city and cost constraints are hard filters. Up to three results are ordered by listed annual tuition, not by a supposed quality or personality score. Cards explain the interest match, a field-specific consideration, recorded exam subjects and unverified cost. Funded places are a catalogue availability filter, not a scholarship or admission guarantee. Qualifications are remembered for the student to review, but are not used to claim eligibility.

This is a deterministic English/Russian guidance flow, not unrestricted natural-language career counselling. It does not introduce Sri Lankan programme data, Sinhala/Tamil guidance, verified admissions rules or currency conversion. Other assistant features retain their existing provider/fallback behavior.

## Validation

- Run `npm run test:assistant` for legacy quality checks and regressions.
- Run `npm run build` for TypeScript and production compilation.
- With the app running locally, run `node scripts/verify_programme_guidance.mjs` for the mobile UI journey. Optionally set `CHROME_PATH` to an installed Chromium executable and `TEST_URL` to the local app URL.
- The browser test was added but could not run in the implementation environment: Chromium was denied a required socket before startup. Visual/browser verification remains pending.

No provider key, new paid service, database migration or deployment change is required for this guided flow.
