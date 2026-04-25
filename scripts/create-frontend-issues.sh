#!/bin/bash

set -e

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
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}Error: Not in a git repository${NC}"
    exit 1
fi

REPO=$(gh repo view --json nameWithOwner --jq .nameWithOwner 2>/dev/null || echo "")

if [ -z "$REPO" ]; then
    echo -e "${RED}Error: Could not determine GitHub repo. Run 'gh auth login' first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Creating issues in: $REPO${NC}\n"

declare -a FEATURES=(

"Performance optimization: Virtualize large mapping lists|Implement virtualization/windowing for large mapping tables.

### Problem
When reconciliation results contain hundreds or thousands of mappings, the frontend may become slow because every row is rendered at once.

### Goal
Render only the rows visible on screen while keeping scrolling smooth.

### Suggested Implementation
- Use a library such as \`react-window\` or \`@tanstack/react-virtual\`
- Virtualize the main mapping list
- Preserve row expansion behaviour
- Ensure search and filtering still work correctly
- Test with 1,000+ mapping rows

### Acceptance Criteria
- Large mapping files remain responsive
- Expanding rows still works
- No visual layout breaking
- Search/filter behaviour remains unchanged"

"Dark/Light theme toggle|Add a user-facing dark/light theme switcher.

### Problem
The app currently lacks a clear way for users to switch between visual themes.

### Goal
Allow users to choose between dark mode and light mode.

### Suggested Implementation
- Add a theme toggle button in the main layout/header
- Store user preference in \`localStorage\`
- Respect system preference by default
- Ensure all components support both themes
- Check contrast and readability

### Acceptance Criteria
- User can switch theme instantly
- Preference persists after reload
- Components remain readable in both modes"

"Keyboard navigation improvements|Improve keyboard support for mapping review.

### Problem
Users currently rely too heavily on mouse interaction when reviewing mappings.

### Goal
Allow faster review using keyboard shortcuts.

### Suggested Implementation
- Arrow Up/Down moves between mapping rows
- Enter expands/collapses selected mapping
- Escape closes drawers/modals
- Slash or Ctrl+K focuses search
- Add visible focus states

### Acceptance Criteria
- User can navigate mappings without mouse
- Expanded rows work with Enter
- Focus states are clear and accessible"

"Save and load session state|Persist local review state between page refreshes.

### Problem
Users lose reviewed mappings, filters, and UI state after refreshing or closing the browser.

### Goal
Use localStorage to save session state.

### Suggested Implementation
- Save reviewed mapping IDs
- Save active filters/search
- Save expanded rows if useful
- Add reset/clear saved session option
- Scope saved data to the reconciliation result

### Acceptance Criteria
- Refreshing does not wipe review progress
- User can clear saved state
- State does not leak between different files/results"

"Mapping templates and presets|Allow reusable mapping templates.

### Problem
Users may reconcile similar schemas repeatedly and should not have to manually review the same mappings every time.

### Goal
Let users save and reuse mapping configurations.

### Suggested Implementation
- Add Save as Template action
- Allow loading a template during reconciliation review
- Store template name, table mappings, column mappings, and rules
- Initially store locally; later support backend persistence

### Acceptance Criteria
- User can save current mapping config
- User can load a saved template
- Loaded template applies matching mappings correctly"

"Advanced filtering options|Add compound filtering for mapping review.

### Problem
Current filtering is limited and does not support complex review workflows.

### Goal
Allow users to combine multiple filters.

### Suggested Implementation
- Filter by confidence range
- Filter by conflict type
- Filter by reviewed/unreviewed status
- Filter by source/target table name
- Support AND/OR filter logic
- Add clear all filters button

### Acceptance Criteria
- Multiple filters can be active together
- Filter state is visible to the user
- Results update immediately"

"Undo/Redo functionality|Add undo/redo for review actions.

### Problem
Users can accidentally mark mappings reviewed or change mapping decisions without an easy way to reverse the action.

### Goal
Implement undo/redo for user-driven mapping changes.

### Suggested Implementation
- Track review state changes
- Track manual mapping edits
- Add Ctrl+Z and Ctrl+Y shortcuts
- Add visible undo/redo buttons
- Use a bounded history stack

### Acceptance Criteria
- User can undo recent changes
- User can redo undone changes
- Undo history resets safely when new result is loaded"

"Detailed conflict explanations|Improve conflict explanation UI.

### Problem
Users need clearer explanations for why conflicts were detected.

### Goal
Add detailed tooltips/drawers explaining each conflict.

### Suggested Implementation
- Show conflict reason
- Show affected table/column
- Show severity
- Suggest possible resolution
- Add examples where relevant

### Acceptance Criteria
- Each conflict has a readable explanation
- User can understand what caused the conflict
- UI does not become cluttered"

"Column type conversion suggestions|Suggest SQL conversions for mismatched column types.

### Problem
When columns have different types, users need help deciding how to migrate data safely.

### Goal
Show suggested conversion expressions.

### Suggested Implementation
- Detect common type mismatches
- Suggest SQL casts/conversions
- Warn about lossy conversions
- Support examples like INT to VARCHAR, VARCHAR to DATE, FLOAT to DECIMAL

### Acceptance Criteria
- Type mismatch conflicts show suggestions
- Risky conversions are clearly marked
- Suggestions are copyable"

"Batch mapping approval workflow|Add batch approval flow for mappings.

### Problem
Reviewing mappings one by one is slow for large schemas.

### Goal
Allow users to approve multiple mappings safely.

### Suggested Implementation
- Select multiple mapping rows
- Approve selected mappings
- Approve all high-confidence mappings
- Add confirmation modal before batch actions
- Show count of affected mappings

### Acceptance Criteria
- User can batch approve mappings
- Confirmation prevents accidental approval
- Reviewed state updates correctly"

"Real-time collaboration hints|Add collaboration presence indicators.

### Problem
Teams may review mappings together but currently cannot see who else is active.

### Goal
Show basic real-time collaboration hints.

### Suggested Implementation
- Add WebSocket-ready UI layer
- Show active viewers
- Show when another user is editing/reviewing a mapping
- Use placeholder/mock state if backend is not ready

### Acceptance Criteria
- UI supports presence indicators
- Design does not block single-user usage
- Can be connected to backend later"

"PDF report generation|Generate PDF reports from reconciliation results.

### Problem
Users may need documentation for stakeholders, audits, or migration planning.

### Goal
Export reconciliation results as a formatted PDF.

### Suggested Implementation
- Include summary stats
- Include table mappings
- Include confidence scores
- Include conflicts
- Include reviewed status
- Add export button

### Acceptance Criteria
- User can download a PDF report
- Report is readable and formatted
- Large results do not break generation"

"Mapping diff history|Track mapping changes over time.

### Problem
Users need visibility into how mappings changed during review.

### Goal
Show a history of mapping decisions.

### Suggested Implementation
- Track timestamped changes
- Record previous and new values
- Show user action history
- Add history drawer per mapping
- Support reverting a change later

### Acceptance Criteria
- Mapping changes are visible
- History is understandable
- No duplicate/noisy history entries"

"Smart column matching suggestions|Suggest matches for unmatched columns.

### Problem
Some columns remain unmatched even when there may be likely semantic matches.

### Goal
Provide intelligent suggestions for unmatched columns.

### Suggested Implementation
- Compare column names
- Compare data types
- Use naming similarity
- Use sample values if available
- Rank suggestions by confidence

### Acceptance Criteria
- Unmatched columns show possible matches
- Suggestions include confidence score
- User can accept/reject suggestions"

"Data preview integration|Show sample data for mapped columns.

### Problem
Schema names alone may not be enough to verify mappings.

### Goal
Show sample data from source and target columns.

### Suggested Implementation
- Add preview drawer/table
- Show sample values from both sides
- Mask sensitive-looking data
- Handle missing preview data gracefully

### Acceptance Criteria
- User can inspect sample values
- Preview improves mapping confidence
- UI handles unavailable data safely"

"Quick filter presets|Add saved filter presets.

### Problem
Users often reuse the same filters during review.

### Goal
Allow users to save and apply common filters.

### Suggested Implementation
- Add presets such as High confidence, Low confidence, Conflicts only, Unreviewed
- Allow custom saved presets
- Store locally
- Add reset option

### Acceptance Criteria
- Built-in presets work
- Custom presets persist
- Applying a preset updates the mapping list"

"Export to migration tools|Export mappings to migration tooling formats.

### Problem
Reconciliation results should connect directly to migration workflows.

### Goal
Support exports for tools like Liquibase, Flyway, and AWS DMS.

### Suggested Implementation
- Add export dropdown
- Generate structured output for each supported tool
- Include table mappings, column mappings, and transformations
- Validate export format

### Acceptance Criteria
- User can export migration-ready files
- Output is structured and readable
- Export does not include invalid mappings unless explicitly allowed"

"Accessibility improvements|Improve accessibility across the frontend.

### Problem
The interface should be usable with keyboards, screen readers, and high-contrast settings.

### Goal
Meet stronger accessibility standards.

### Suggested Implementation
- Add aria labels
- Improve focus states
- Ensure semantic HTML
- Check colour contrast
- Support screen reader-friendly labels
- Test keyboard-only flow

### Acceptance Criteria
- Main workflow works without mouse
- Interactive elements have accessible labels
- Contrast is acceptable"

"Mobile responsive design|Improve layout for smaller screens.

### Problem
The current UI is mainly desktop-focused.

### Goal
Make the app usable on tablets and smaller screens.

### Suggested Implementation
- Make mapping table responsive
- Collapse side panels/drawers properly
- Use mobile-friendly spacing
- Avoid horizontal overflow
- Test common breakpoints

### Acceptance Criteria
- App works on tablet widths
- No broken layout on mobile
- Core review actions remain usable"

"Custom column mapping rules|Allow users to define rules for automatic column matching.

### Problem
Different teams follow different naming conventions.

### Goal
Let users create custom rules to automate matching.

### Suggested Implementation
- Add rule builder UI
- Support prefix/suffix removal
- Support snake_case/camelCase normalization
- Support synonym mappings
- Apply rules before/after automatic matching

### Acceptance Criteria
- User can create a custom rule
- Rule affects matching suggestions
- User can edit/delete rules"
)

CREATED=0
FAILED=0

for feature in "${FEATURES[@]}"; do
    IFS='|' read -r TITLE DESCRIPTION <<< "$feature"

    echo -n "Creating: $TITLE... "

    if gh issue create \
        --title "$TITLE" \
        --body "$DESCRIPTION

---

**Type:** Feature Request  
**Component:** Frontend  
**Priority:** Medium" \
        --label "frontend" \
        --label "enhancement" \
        --repo "$REPO" \
        > /dev/null 2>&1; then

        echo -e "${GREEN}✓${NC}"
        ((CREATED++))
    else
        echo -e "${RED}✗${NC}"
        ((FAILED++))
    fi
done

echo -e "\n${BLUE}==================================${NC}"
echo -e "${GREEN}Issues created: $CREATED${NC}"

if [ $FAILED -gt 0 ]; then
    echo -e "${RED}Issues failed: $FAILED${NC}"
fi

echo -e "${BLUE}==================================${NC}\n"
echo -e "View all issues at: ${YELLOW}https://github.com/$REPO/issues?labels=frontend${NC}"