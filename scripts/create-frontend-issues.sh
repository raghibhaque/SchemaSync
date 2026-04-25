#!/bin/bash

set +e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}==================================${NC}"
echo -e "${BLUE}Frontend Features Issue Creator${NC}"
echo -e "${BLUE}==================================${NC}\n"

if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed${NC}"
    exit 1
fi

if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}Error: Not in a git repository${NC}"
    exit 1
fi

if ! gh auth status > /dev/null 2>&1; then
    echo -e "${RED}Error: GitHub CLI is not authenticated.${NC}"
    echo "Run: gh auth login"
    exit 1
fi

REPO=$(gh repo view --json nameWithOwner --jq .nameWithOwner)

echo -e "${GREEN}✓ Creating issues in: $REPO${NC}\n"

# Create labels if missing
gh label create frontend \
    --color 1D76DB \
    --description "Frontend related work" \
    --repo "$REPO" \
    2>/dev/null || true

gh label create enhancement \
    --color A2EEEF \
    --description "New feature or improvement" \
    --repo "$REPO" \
    2>/dev/null || true

declare -a FEATURES=(

"Performance optimization: Virtualize large mapping lists|Implement virtualization/windowing for large mapping tables.

### Problem
Large reconciliation results may cause the frontend to lag because every mapping row is rendered at once.

### Goal
Only render the visible rows while keeping scrolling smooth.

### Tasks
- Add virtualization using react-window or @tanstack/react-virtual.
- Preserve row expansion behaviour.
- Keep search and filters working.
- Test with 1,000+ mappings.

### Acceptance Criteria
- Large mapping files remain responsive.
- Expanded rows still work.
- Search and filtering remain correct."

"Dark/Light theme toggle|Add a theme switcher.

### Problem
Users cannot choose between dark and light modes.

### Goal
Allow users to switch theme from the UI.

### Tasks
- Add a theme toggle in the header.
- Store preference in localStorage.
- Respect system preference by default.
- Check contrast in both themes.

### Acceptance Criteria
- Theme switches instantly.
- Preference persists after refresh.
- UI remains readable in both modes."

"Keyboard navigation improvements|Improve keyboard-based review.

### Problem
Mapping review depends too much on mouse interaction.

### Goal
Allow users to navigate mappings quickly with the keyboard.

### Tasks
- Arrow Up/Down moves between rows.
- Enter expands/collapses selected row.
- Escape closes drawers/modals.
- Ctrl+K or / focuses search.
- Add visible focus states.

### Acceptance Criteria
- Mapping review is usable without a mouse.
- Focus states are visible.
- Existing shortcuts do not break."

"Save and load session state|Persist review progress locally.

### Problem
Users lose reviewed mappings, filters, and UI state after refresh.

### Goal
Save session state in localStorage.

### Tasks
- Save reviewed mapping IDs.
- Save search/filter state.
- Save expanded rows if useful.
- Add clear saved session button.
- Scope saved data per reconciliation result.

### Acceptance Criteria
- Refreshing does not wipe review progress.
- User can clear saved state.
- State does not leak between different results."

"Mapping templates and presets|Allow reusable mapping templates.

### Problem
Users may review similar schemas repeatedly.

### Goal
Allow users to save and reuse mapping configurations.

### Tasks
- Add Save as Template action.
- Add Load Template action.
- Store table mappings and column mappings.
- Start with localStorage-based templates.

### Acceptance Criteria
- User can save a template.
- User can load a template.
- Loaded mappings apply correctly."

"Advanced filtering options|Add compound filters.

### Problem
Current filtering is too basic for large reconciliation results.

### Goal
Allow users to combine filters.

### Tasks
- Filter by confidence.
- Filter by conflict type.
- Filter by reviewed/unreviewed.
- Filter by table name.
- Support AND/OR logic.
- Add clear filters button.

### Acceptance Criteria
- Multiple filters work together.
- Active filters are visible.
- Results update immediately."

"Undo/Redo functionality|Add undo and redo for review actions.

### Problem
Users can accidentally change reviewed status or mapping decisions.

### Goal
Allow users to reverse recent actions.

### Tasks
- Track review state changes.
- Track manual mapping edits.
- Add Ctrl+Z and Ctrl+Y.
- Add undo/redo buttons.
- Use a bounded history stack.

### Acceptance Criteria
- User can undo recent changes.
- User can redo undone changes.
- History resets safely for new results."

"Detailed conflict explanations|Improve conflict explanation UI.

### Problem
Conflict messages are not detailed enough.

### Goal
Explain why each conflict occurred and how to resolve it.

### Tasks
- Show conflict reason.
- Show affected table/column.
- Show severity.
- Suggest possible resolution.
- Add tooltip or drawer view.

### Acceptance Criteria
- Each conflict has a readable explanation.
- User understands the cause.
- UI stays clean."

"Column type conversion suggestions|Suggest SQL conversions for mismatched column types.

### Problem
Users need help resolving type mismatches.

### Goal
Show safe SQL conversion suggestions.

### Tasks
- Detect common mismatches.
- Suggest casts/conversions.
- Warn about lossy conversions.
- Make suggestions copyable.

### Acceptance Criteria
- Type mismatch conflicts show suggestions.
- Risky conversions are marked.
- SQL snippets can be copied."

"Batch mapping approval workflow|Add batch approval for mappings.

### Problem
Reviewing mappings one by one is slow.

### Goal
Allow safe approval of multiple mappings.

### Tasks
- Add multi-select rows.
- Approve selected mappings.
- Approve all high-confidence mappings.
- Add confirmation modal.
- Show affected mapping count.

### Acceptance Criteria
- User can batch approve mappings.
- Confirmation prevents mistakes.
- Reviewed state updates correctly."

"PDF report generation|Generate PDF reports from reconciliation results.

### Problem
Users may need documentation for stakeholders or migration planning.

### Goal
Export reconciliation results as a formatted PDF.

### Tasks
- Include summary stats.
- Include table mappings.
- Include confidence scores.
- Include conflicts.
- Include reviewed status.
- Add export button.

### Acceptance Criteria
- User can download a PDF.
- Report is readable.
- Large results do not break export."

"Mapping diff history|Track mapping changes over time.

### Problem
Users need visibility into how mappings changed during review.

### Goal
Show history of mapping decisions.

### Tasks
- Track timestamped changes.
- Record old and new values.
- Add history drawer.
- Support reverting a change later.

### Acceptance Criteria
- Changes are visible.
- History is understandable.
- Duplicate/noisy entries are avoided."

"Smart column matching suggestions|Suggest matches for unmatched columns.

### Problem
Some columns remain unmatched even when likely matches exist.

### Goal
Suggest possible matches for unmatched columns.

### Tasks
- Compare column names.
- Compare data types.
- Use naming similarity.
- Rank suggestions by confidence.
- Allow accept/reject.

### Acceptance Criteria
- Unmatched columns show suggestions.
- Suggestions have confidence scores.
- User can accept or reject suggestions."

"Data preview integration|Show sample data for mapped columns.

### Problem
Schema names alone may not verify mappings.

### Goal
Show sample values from source and target columns.

### Tasks
- Add data preview drawer.
- Show sample values from both sides.
- Mask sensitive-looking data.
- Handle missing preview data.

### Acceptance Criteria
- User can inspect sample values.
- Preview helps verify mappings.
- Missing data does not break the UI."

"Quick filter presets|Add saved filter presets.

### Problem
Users often reuse the same filters.

### Goal
Allow users to apply common filter presets quickly.

### Tasks
- Add built-in presets:
  - High confidence
  - Low confidence
  - Conflicts only
  - Unreviewed
- Allow custom saved presets.
- Persist presets locally.

### Acceptance Criteria
- Built-in presets work.
- Custom presets persist.
- Applying preset updates results."

"Export to migration tools|Export mappings to migration tool formats.

### Problem
Reconciliation results should connect to migration workflows.

### Goal
Support exports for Liquibase, Flyway, and AWS DMS-style outputs.

### Tasks
- Add export dropdown.
- Generate structured output.
- Include table mappings and column mappings.
- Include transformations where available.

### Acceptance Criteria
- User can export migration-ready files.
- Output is structured and readable.
- Invalid mappings are handled safely."

"Accessibility improvements|Improve frontend accessibility.

### Problem
The app should be usable with keyboard navigation and screen readers.

### Goal
Improve accessibility across the main review workflow.

### Tasks
- Add aria labels.
- Improve focus states.
- Use semantic HTML.
- Check colour contrast.
- Test keyboard-only flow.

### Acceptance Criteria
- Main workflow works without mouse.
- Interactive elements have accessible labels.
- Contrast is acceptable."

"Mobile responsive design|Improve layout for smaller screens.

### Problem
The UI is mostly desktop-focused.

### Goal
Make the app usable on tablets and smaller screens.

### Tasks
- Make mapping table responsive.
- Collapse drawers/panels properly.
- Avoid horizontal overflow.
- Improve spacing at small breakpoints.

### Acceptance Criteria
- App works on tablet widths.
- No broken mobile layout.
- Core review actions remain usable."

"Custom column mapping rules|Allow user-defined matching rules.

### Problem
Different teams use different naming conventions.

### Goal
Let users define custom rules for automatic column matching.

### Tasks
- Add rule builder UI.
- Support prefix/suffix removal.
- Support snake_case/camelCase normalization.
- Support synonym mappings.
- Apply rules during matching suggestions.

### Acceptance Criteria
- User can create a rule.
- Rule affects matching suggestions.
- User can edit/delete rules."
)

CREATED=0
FAILED=0
SKIPPED=0

for feature in "${FEATURES[@]}"; do
    IFS='|' read -r TITLE DESCRIPTION <<< "$feature"

    echo -n "Checking: $TITLE... "

    EXISTING=$(gh issue list \
        --repo "$REPO" \
        --search "$TITLE in:title" \
        --state all \
        --json number \
        --jq '.[0].number' 2>/dev/null || true)

    if [ -n "$EXISTING" ]; then
        echo -e "${YELLOW}skipped, already exists (#$EXISTING)${NC}"
        ((SKIPPED++))
        continue
    fi

    echo -n "creating... "

    if gh issue create \
        --title "$TITLE" \
        --body "$DESCRIPTION

---

**Type:** Feature Request  
**Component:** Frontend  
**Priority:** Medium" \
        --label "frontend" \
        --label "enhancement" \
        --repo "$REPO"; then

        echo -e "${GREEN}✓${NC}"
        ((CREATED++))
    else
        echo -e "${RED}✗${NC}"
        ((FAILED++))
    fi
done

echo -e "\n${BLUE}==================================${NC}"
echo -e "${GREEN}Issues created: $CREATED${NC}"
echo -e "${YELLOW}Issues skipped: $SKIPPED${NC}"

if [ "$FAILED" -gt 0 ]; then
    echo -e "${RED}Issues failed: $FAILED${NC}"
fi

echo -e "${BLUE}==================================${NC}\n"
echo -e "View all issues at: ${YELLOW}https://github.com/$REPO/issues?q=label%3Afrontend${NC}"