# ==============================================================================
# WEFES NEXUS NEPAL: MASTER REPOSITORY TASK ORCHESTRATOR
# ==============================================================================

.PHONY: dev build test test-nexus test-hydro run-hydro sync-data update-ai-index clean

# Start full web platform & API development servers
dev:
	pnpm dev

# Build all monorepo workspaces and engines
build:
	pnpm build

# Run polyglot automated test suites
test: test-nexus test-hydro

test-nexus:
	pnpm --filter @wefes/wefes-engine test

test-hydro:
	python3 -m py_compile engines/hydro/cli.py engines/hydro/src/*.py

# Execute the autonomous Python Hydropower & Topographic Engine
run-hydro:
	python3 engines/hydro/cli.py --district Gulmi --output-dir data/calculated/hydro_reaches

# Download and verify heavy binary rasters from data/manifest.json
sync-data:
	python3 scripts/sync_data.py

# Refresh the dynamic AI context anchor
update-ai-index:
	python3 scripts/generate_ai_index.py

# Clean build artifacts and caches
clean:
	rm -rf .turbo node_modules/.cache dist apps/web/dist engines/nexus/dist engines/hydro/__pycache__
