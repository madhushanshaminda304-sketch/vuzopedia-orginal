# Quality Contract (CONSTRAINTS.md)

## Quality Floor & Baseline Standards
1. **Console**: 0 console errors or unhandled exceptions on load or user interaction.
2. **Accessibility**:
   - WCAG 2.2 AA compliant.
   - Full keyboard navigation and tab index support across all interactive widgets (tabs, modals, sliders, inputs).
   - High contrast ratios (minimum 4.5:1 for normal text, 3:1 for large text and UI components).
   - Semantic HTML with valid ARIA roles and labels.
3. **Performance**:
   - Initial JS bundle ≤ 200 KB gzipped.
   - LCP ≤ 2.0 s.
   - CLS ≤ 0.05.
   - INP ≤ 100 ms.
   - Client-side search and filtering response time ≤ 16 ms (60 fps).
4. **No-Regression Rules**:
   - All 11 USE subjects available with official point ranges (0-100).
   - Every top Russian educational hub represented (Moscow, SPb, Novosibirsk, Kazan, Ekaterinburg, Tomsk, etc.).
   - Full feature parity with Vuzopedia's core workflows: Universities, Specialties, Professions, USE Calculator, Tests, Comparison, City Hubs, Calendar.
   - Zero aggressive ad blocks, zero layout shifts, zero broken navigation links.
