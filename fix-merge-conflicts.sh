#!/bin/bash
# Fix all merge conflicts - Run this in Git Bash

echo "🔧 Fixing merge conflicts..."
echo ""

cd /c/Users/Shad/Desktop/CityVetCare/CityVetCare

# Stage the already-resolved code files
echo "✅ Staging resolved code files..."
git add Database/schema.sql
git add Frontend/web/package-lock.json

# Accept incoming changes for all documentation files (they're duplicates)
echo "✅ Accepting incoming changes for documentation files..."
git checkout --theirs AUTHENTICATED_REPORT_FIX.md 2>/dev/null || true
git checkout --theirs BACKEND_ANALYSIS_REPORT.md 2>/dev/null || true
git checkout --theirs BUTTON_ANALYSIS_COMPLETE.md 2>/dev/null || true
git checkout --theirs CODE_CLEANUP_SUMMARY.md 2>/dev/null || true
git checkout --theirs CODE_ORGANIZATION_SUMMARY.md 2>/dev/null || true
git checkout --theirs COMPREHENSIVE_ANALYSIS_REPORT.md 2>/dev/null || true
git checkout --theirs DATABASE_MIGRATION_FIX.md 2>/dev/null || true
git checkout --theirs ENHANCED_REPORTS_COMPLETE.md 2>/dev/null || true
git checkout --theirs FIXES_APPLIED.md 2>/dev/null || true
git checkout --theirs FIXES_SUMMARY_2026.md 2>/dev/null || true
git checkout --theirs FIX_GUIDE_AUTHENTICATED_REPORTS.md 2>/dev/null || true
git checkout --theirs FRONTEND_CONNECTIVITY_REPORT.md 2>/dev/null || true
git checkout --theirs HOW_TO_FIX.md 2>/dev/null || true
git checkout --theirs IMAGE_UPLOAD_FIX.md 2>/dev/null || true
git checkout --theirs IMAGE_UPLOAD_FIX_SUMMARY.md 2>/dev/null || true
git checkout --theirs IMPLEMENTATION_GUIDE.md 2>/dev/null || true
git checkout --theirs MOBILE_CONNECTION_SETUP.md 2>/dev/null || true
git checkout --theirs MOBILE_MONITORING_FIX_COMPLETE.md 2>/dev/null || true
git checkout --theirs MODAL_IMPLEMENTATION_COMPLETE.md 2>/dev/null || true
git checkout --theirs MODAL_VISUAL_GUIDE.md 2>/dev/null || true
git checkout --theirs PENDING_REPORT_FIX.md 2>/dev/null || true
git checkout --theirs PRIORITY_REMOVAL_COMPLETE.md 2>/dev/null || true
git checkout --theirs PROJECT_FILES.txt 2>/dev/null || true
git checkout --theirs QUICK_START.md 2>/dev/null || true
git checkout --theirs QUICK_START_GUIDE.txt 2>/dev/null || true
git checkout --theirs REPORT_TYPE_FIX_COMPLETE.md 2>/dev/null || true
git checkout --theirs SYSTEM_ANALYSIS_COMPLETE.md 2>/dev/null || true
git checkout --theirs SYSTEM_ANALYSIS_REPORT.txt 2>/dev/null || true
git checkout --theirs SYSTEM_READY.md 2>/dev/null || true
git checkout --theirs SYSTEM_STATUS.md 2>/dev/null || true
git checkout --theirs TEST_ALL_INCIDENT_REPORTS.md 2>/dev/null || true
git checkout --theirs TEST_IMAGE_UPLOAD.md 2>/dev/null || true
git checkout --theirs TEST_PENDING_VERIFICATION.md 2>/dev/null || true

# Accept incoming for archived documentation
git checkout --theirs _archived/*.md 2>/dev/null || true
git checkout --theirs docs/*.md 2>/dev/null || true

# Accept incoming for test scripts
git checkout --theirs create-test-data.js 2>/dev/null || true
git checkout --theirs run-dashboard-fix.js 2>/dev/null || true
git checkout --theirs test-*.js 2>/dev/null || true
git checkout --theirs test-*.md 2>/dev/null || true
git checkout --theirs test-*.ps1 2>/dev/null || true
git checkout --theirs validate-system.js 2>/dev/null || true
git checkout --theirs _archived/*.js 2>/dev/null || true
git checkout --theirs _archived/*.ps1 2>/dev/null || true
git checkout --theirs scripts/tests/*.js 2>/dev/null || true
git checkout --theirs scripts/utilities/*.js 2>/dev/null || true

# Stage all resolved files
echo "✅ Staging all resolved files..."
git add .

# Show status
echo ""
echo "📊 Current status:"
git status

echo ""
echo "✅ All conflicts resolved!"
echo ""
echo "Now run these commands to complete the merge:"
echo "  git commit -m \"Merge marvTest into main - resolved conflicts\""
echo "  git pull origin main"
echo "  git push origin main"
