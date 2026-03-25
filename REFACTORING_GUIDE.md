# Refactoring Guide - Utility Files

This guide shows how to replace duplicated code in existing components with the new centralized utility files.

## Files Created

### 1. `/src/data/constants.js` (197 lines)
**Purpose:** Single source of truth for all constants used across the application

**Key Exports:**
- `DOMAIN_NAMES` - Domain mappings DOM01-DOM16 (short names)
- `DOMAIN_NAMES_EXPANDED` - Full Portuguese descriptions
- `DOMAIN_NAMES_PEI` - Task Analysis variants
- `TASK_ANALYSIS_DOMAIN_MAP` - Domain to Task Analysis key mapping
- `STATUS_COLORS` - Color scheme for status visualization
- `COLOR_PALETTE` - Full RGB color palette for PDFs
- `SCORE_STATUS` - Status value constants
- `STORAGE_KEY` - localStorage key for sessions
- `BARRIERS_NAMES` - List of possible barriers
- `DEFAULTS` - Application default values

### 2. `/src/utils/domainMapping.js` (196 lines)
**Purpose:** Utilities for domain code operations and transformations

**Key Functions:**
- `getDomainName(domCode)` - Get short domain name
- `getDomainNameExpanded(domCode)` - Get full domain name
- `getDomainNamePEI(domCode)` - Get PEI-specific name
- `getTaskAnalysisKey(domCode)` - Get Task Analysis map key
- `isValidDomainCode(domCode)` - Validate domain code
- `getAllDomainCodes()` - Get all valid domain codes
- `extractDomainCode(blockId)` - Extract domain from blockId
- `parseBlockId(blockId)` - Parse full blockId structure
- `buildBlockId(domCode, level, milestone)` - Build blockId
- `groupBlocksByDomain(blockIds)` - Group blocks by domain
- `filterBlocksByDomain(blockIds, domCode)` - Filter blocks
- `calculateDomainStats(domCode, scores)` - Calculate statistics

### 3. `/src/utils/localStorage.js` (272 lines)
**Purpose:** Centralized localStorage operations for session management

**Key Functions:**
- `loadSessions()` - Load all sessions from storage
- `saveSessions(sessions)` - Save sessions to storage
- `getSessionById(sessionId)` - Get specific session
- `getSessionsByChild(childName)` - Get child's sessions
- `updateSession(sessionId, updates)` - Update session
- `addSession(session)` - Add new session
- `removeSession(sessionId)` - Remove session
- `removeSessionsByChild(childName)` - Remove child's sessions
- `clearAllSessions()` - Clear all sessions (DANGEROUS)
- `exportSessionsToJSON()` - Export for backup
- `importSessionsFromJSON(json, merge)` - Import from backup
- `getSessionsStats()` - Get session statistics
- `isValidSession(session)` - Validate session object

## Migration Examples

### Before: PainelCrianca.jsx
```javascript
const NOMES_DOMINIOS = {
  'DOM01': 'Mando', 'DOM02': 'Tato', // ... duplicated in multiple files
};

// In component code
const nomeExibido = NOMES_DOMINIOS[domCode];
```

### After: PainelCrianca.jsx
```javascript
import { getDomainName } from '../utils/domainMapping';

// In component code
const nomeExibido = getDomainName(domCode);
```

---

### Before: App.jsx
```javascript
useEffect(() => {
  const saved = localStorage.getItem('vbmapp_sessions');
  if (saved) {
    try {
      const parsedSessions = JSON.parse(saved);
      setSessions(parsedSessions);
    } catch (e) {
      localStorage.removeItem('vbmapp_sessions');
    }
  }
}, []);

useEffect(() => {
  if (sessions.length > 0) {
    localStorage.setItem('vbmapp_sessions', JSON.stringify(sessions));
  }
}, [sessions]);
```

### After: App.jsx
```javascript
import { loadSessions, saveSessions } from '../utils/localStorage';

useEffect(() => {
  setSessions(loadSessions());
}, []);

useEffect(() => {
  if (sessions.length > 0) {
    saveSessions(sessions);
  }
}, [sessions]);
```

---

### Before: PDFReport.jsx
```javascript
const CORES = {
    primaria: [124, 58, 237],
    verde: [16, 185, 129],
    // ... duplicated color definitions
};

const NOMES_DOMINIOS = {
    'DOM01': 'Mando',
    // ... duplicated
};

function getNomeDominio(codigo) {
    return NOMES_DOMINIOS[codigo] || codigo;
}
```

### After: PDFReport.jsx
```javascript
import { COLOR_PALETTE, getDomainNameExpanded } from '../utils/domainMapping';

// Replace all CORES references:
doc.setFillColor(...COLOR_PALETTE.primary);
doc.setTextColor(...COLOR_PALETTE.white);

// Replace all NOMES_DOMINIOS:
const nome = getDomainNameExpanded(domCode);
```

---

### Before: PEIScreen.jsx
```javascript
const DOMAIN_NAMES_PT = {
    'DOM01': 'Mando',
    'DOM02': 'Tato',
    // ... duplicated
};

const baseMap = {
    'DOM01': 'MANDO',
    'DOM04': 'HABILIDADES PERCEPTUAIS VISUAIS E PAREAMENTO AO MODELO',
    // ... duplicated
};
```

### After: PEIScreen.jsx
```javascript
import { getDomainNamePEI, getTaskAnalysisKey } from '../utils/domainMapping';

// Replace DOMAIN_NAMES_PT usage:
const name = getDomainNamePEI(domCode);

// Replace baseMap usage:
const taskKey = getTaskAnalysisKey(domCode);
```

## Benefits of Refactoring

1. **DRY Principle** - No more duplicate constants across files
2. **Maintainability** - Update domain names in one place, affects all components
3. **Consistency** - Guaranteed consistent naming across the app
4. **Type Safety** - Can easily add TypeScript definitions
5. **Reusability** - Utility functions reduce boilerplate code
6. **Error Handling** - Centralized validation and error handling
7. **Testability** - Isolated utility functions are easier to test
8. **Performance** - Reduced bundle size from deduplication

## Next Steps

1. Import utilities in each component
2. Replace duplicate constants with imports
3. Replace duplicate logic with utility function calls
4. Test each component after refactoring
5. Remove old constant definitions

## File Locations

- Constants: `/src/data/constants.js`
- Domain utilities: `/src/utils/domainMapping.js`
- Storage utilities: `/src/utils/localStorage.js`
