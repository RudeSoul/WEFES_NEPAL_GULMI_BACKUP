# ==============================================================================
# WEFES NEXUS NEPAL: MASTER REPOSITORY TASK ORCHESTRATOR
# ==============================================================================

.PHONY: dev build test check-data test-nexus test-hydro run-hydro sync-data update-ai-index clean

# Start full web platform & API development servers
dev:
	pnpm dev

# Build all monorepo workspaces and engines
build:
	pnpm build

# Run polyglot automated test suites including strict data integrity
test: check-data test-nexus test-hydro

# Verify physical data paths, engine isolation, and anti-hallucination rules
check-data:
	python3 scripts/verify_data_integrity.py

test-nexus:
	pnpm --filter @wefes/wefes-engine test

test-hydro:
	python3 -m py_compile engines/water/hydro/cli.py engines/water/hydro/src/*.py

# Execute the autonomous Python Hydropower & Topographic Engine
run-hydro:
	python3 engines/water/hydro/cli.py --district Gulmi --output-dir data/calculated/hydro_reaches

# Download and verify heavy binary rasters from data/manifest.json
sync-data:
	python3 scripts/sync_data.py

# Refresh the dynamic AI context anchor
update-ai-index:
	python3 scripts/generate_ai_index.py

# Clean build artifacts and caches
clean:
	rm -rf .turbo node_modules/.cache dist apps/web/dist engines/nexus/dist engines/water/hydro/__pycache__
