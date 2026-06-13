.PHONY: help dev build start lint seed admin db-reset db-backup \
        research-history research-culture \
        province-list data-check clean

# ── Default ───────────────────────────────────────────────────────────────────
help:
	@echo ""
	@echo "  Khám Phá Việt Nam — available targets"
	@echo ""
	@echo "  Development"
	@echo "    make dev            Start Next.js dev server (localhost:3000)"
	@echo "    make build          Production build"
	@echo "    make start          Start production server"
	@echo "    make lint           Run ESLint"
	@echo ""
	@echo "  Database"
	@echo "    make seed           Run seed script (migrations + data)"
	@echo "    make db-reset       Delete database.db, then re-seed from scratch"
	@echo "    make db-backup      Copy database.db → database.db.bak"
	@echo "    make db-shell       Open SQLite shell on database.db"
	@echo ""
	@echo "  Data inspection"
	@echo "    make province-list  Show all provinces/cities in the DB"
	@echo "    make data-check     Count rows per province in all tables"
	@echo "    make data-files     List all JSON data files"
	@echo ""
	@echo "  Tools"
	@echo "    make admin          Start the admin tool server"
	@echo "    make clean          Remove build artifacts (.next, *.bak)"
	@echo ""

# ── Development ───────────────────────────────────────────────────────────────
dev:
	npm run dev

dev-fresh:
	rm -rf .next
	npm run dev

build:
	npm run build

start:
	npm run start

lint:
	npm run lint

# ── Database ──────────────────────────────────────────────────────────────────
seed:
	npm run seed

db-reset:
	@echo "→ Deleting database.db…"
	rm -f database.db
	@echo "→ Re-seeding…"
	npm run seed

db-backup:
	cp database.db database.db.bak
	@echo "→ Backed up to database.db.bak"

db-shell:
	sqlite3 database.db

# ── Data inspection ───────────────────────────────────────────────────────────
province-list:
	@sqlite3 database.db "SELECT id, name_vi, name_en, slug, type FROM provinces ORDER BY id;"

data-check:
	@echo ""
	@echo "── Provinces ──────────────────────────────────────────────"
	@sqlite3 database.db "SELECT id, slug FROM provinces ORDER BY id;"
	@echo ""
	@echo "── Events per province ─────────────────────────────────────"
	@sqlite3 database.db \
	  "SELECT p.slug, COUNT(e.id) AS events \
	   FROM provinces p LEFT JOIN events e ON e.province_id = p.id \
	   GROUP BY p.id ORDER BY p.id;"
	@echo ""
	@echo "── Cultural posts per province ─────────────────────────────"
	@sqlite3 database.db \
	  "SELECT p.slug, cp.type, COUNT(cp.id) AS posts \
	   FROM provinces p LEFT JOIN cultural_posts cp ON cp.province_id = p.id \
	   GROUP BY p.id, cp.type ORDER BY p.id, cp.type;"
	@echo ""
	@echo "── Festivals per province ──────────────────────────────────"
	@sqlite3 database.db \
	  "SELECT p.slug, COUNT(f.id) AS festivals \
	   FROM provinces p LEFT JOIN festivals f ON f.province_id = p.id \
	   GROUP BY p.id ORDER BY p.id;"
	@echo ""
	@echo "── Food items per province ─────────────────────────────────"
	@sqlite3 database.db \
	  "SELECT p.slug, COUNT(fi.id) AS food_items \
	   FROM provinces p \
	   LEFT JOIN cultural_posts cp ON cp.province_id = p.id AND cp.type = 'am-thuc' \
	   LEFT JOIN food_items fi ON fi.cultural_post_id = cp.id \
	   GROUP BY p.id ORDER BY p.id;"
	@echo ""

data-files:
	@echo ""
	@find data -name "*.json" | sort | while read f; do \
	  count=$$(python3 -c "import json,sys; d=json.load(open('$$f')); print(len(d) if isinstance(d,list) else 1)" 2>/dev/null || echo "?"); \
	  printf "  %-50s %s items\n" "$$f" "$$count"; \
	done
	@echo ""

# ── Tools ─────────────────────────────────────────────────────────────────────
admin:
	npm run admin

clean:
	rm -rf .next database.db.bak
	@echo "→ Cleaned .next and *.bak files"
