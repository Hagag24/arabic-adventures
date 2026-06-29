# Invented Activities Removal Report

This report documents the identification and removal of unmapped, invented activities that existed in the database but did not correspond to any canonical workbook item.

## Identified Invented Activities

The following activities were identified as "invented" because they were not present in the official student workbook text (pages 1-24) and had no corresponding mapped source item in the canonical inventory (`src/content/workbook-activity-inventory.ts`):

1. **`main-idea-open`**
   - **Journey/Stage**: Journey 1, understand stage
   - **Type**: `short_text`
   - **Description**: An open-text question asking the student to write the main idea of the story in their own words.
   - **Reason for Removal**: The student workbook does not contain any open-ended request for the main idea on this page; the main idea is instead assessed via a single-choice activity (`main-idea-choice`, source key `j1-13`).

2. **`comprehension-questions`**
   - **Journey/Stage**: Journey 1, understand stage
   - **Type**: `fill_in_the_blank`
   - **Description**: A fill-in-the-blank activity with three custom blanks asking about writing tools (papyrus, cushion, scribe).
   - **Reason for Removal**: No workbook item matches these specific blank completions.

3. **`safety-listening-rules`**
   - **Journey/Stage**: Journey 3, word-play stage
   - **Type**: `checklist`
   - **Description**: A graded checklist about listening rules.
   - **Reason for Removal**: The student workbook does not contain a distinct checklist for listening rules in Journey 3; the actual self-assessment of listening habits is covered by `safety-listening-rules` (source key `j3-21`, which is mapped to `safety-listening-rules` as a self-assessment).

4. **`safety-ending-rethought`**
   - **Journey/Stage**: Journey 3, think-and-create stage
   - **Type**: `creative_ending`
   - **Description**: A redundant ending reflection asking the student to suggest a reassuring ending for the child.
   - **Reason for Removal**: This activity was redundant with existing ending reflections: `safety-alternative-ending` (source key `j3-12`, suggesting a new ending) and `safety-double-endings` (source key `j3-24`, writing two endings).

## Removal Mechanism

The removal of these activities was executed systematically as follows:

1. **Canonical Inventory Definition**: The canonical source-of-truth file `src/content/workbook-activity-inventory.ts` was established, containing only the 77 authenticated workbook items. The four invented activities were intentionally excluded from this file.
2. **Seeding Layer Isolation**: The `src/content/activity-seed-builder.ts` script was written to build database seed payloads _only_ for the items listed in the canonical inventory.
3. **Database Seeding Clean-up**: The `prisma/seed.ts` script was updated to query the list of newly generated slugs from `buildSeedActivities()` and delete any active database records whose slugs are not present in the seeded list:
   ```typescript
   const seededSlugs = seedActivities.map((sa) => sa.slug);
   await prisma.activity.deleteMany({
     where: {
       slug: { notIn: seededSlugs },
     },
   });
   ```
4. **Verification Enforcement**: The database verification script `scripts/verify-db.ts` was updated to count and fail if any published activity exists in the database that cannot be matched to a canonical `sourceItemKey` in the inventory:
   ```typescript
   const inventedPublished = activities.filter(
     (a) => a.isPublished && !inventoryKeys.includes(a.sourceItemKey || ""),
   ).length;
   if (inventedPublished > 0) {
     throw new Error(
       `Found ${inventedPublished} invented published activities in the DB.`,
     );
   }
   ```

All checks have passed completely, verifying that **zero (0)** unmapped or invented published activities exist in the database.
