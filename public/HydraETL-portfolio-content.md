# HydraETL — Portfolio Content

Copy-paste ready content for your portfolio site, resume, GitHub README, and LinkedIn. Swap in real GitHub/demo links before publishing — placeholders are marked `[ ]`.

---

## 1. Project title + tagline

**HydraETL** — *A concurrent, memory-bounded ETL engine in Go, with a real-time monitoring console.*

Alt taglines if you want something more literal for recruiters skimming fast:
- "A Go-powered ETL pipeline that streams multi-gigabyte files without OOM crashes."
- "Concurrent data ingestion engine: Go worker pools + MongoDB batch writes + live telemetry dashboard."

---

## 2. Portfolio card (short, 2–3 sentences)

Use this under the project thumbnail on a portfolio grid/homepage.

> HydraETL is a high-throughput ETL engine that ingests multi-gigabyte CSV/JSON files through a concurrent, three-stage Go pipeline — streaming extraction, a `NumCPU()`-scaled transform worker pool, and MongoDB batch writes — with zero out-of-memory risk and safe shutdown mid-process. A React dashboard visualizes the pipeline live: throughput, active workers, RAM footprint, and batch-flush activity, updating in real time.

---

## 3. Full project description (for a dedicated project page)

**The problem**
Naive data-loading scripts read entire files into memory, block on sequential I/O, hammer the database with one insert per row, and lose data if the process is killed mid-run. These are textbook production failure modes for any ingestion pipeline handling real-world file sizes.

**What I built**
HydraETL is a three-stage concurrent pipeline written in idiomatic Go:

- **Extract** — a single goroutine streams the input file line-by-line with `bufio.Scanner`, keeping memory usage flat and constant regardless of whether the file is 10MB or 10GB.
- **Transform** — a worker pool scaled to `runtime.NumCPU()` processes records in parallel: validating fields, normalizing timestamps across multiple formats, and masking PII (emails, phone numbers, and sensitive field names) before handing clean records downstream.
- **Load** — a single "smart batching" consumer accumulates records and flushes to MongoDB with one `BulkWrite` call every 500 records or 100ms, whichever comes first — collapsing millions of potential round-trips into a handful of bulk writes.

All three stages communicate through bounded, buffered Go channels, which double as automatic back-pressure: if MongoDB slows down, the whole pipeline self-throttles instead of buffering unbounded work in RAM. `context.Context` cancellation on `SIGINT`/`SIGTERM` drains every stage and flushes the final batch before exit, so a hard kill never corrupts or half-writes data. All live metrics (throughput, worker counts, DB write latency) are tracked with `sync/atomic` — deliberately avoiding mutexes on the hot path, since a lock would serialize every worker through one contention point.

A React + Tailwind dashboard consumes a `/api/metrics` endpoint on a polling loop to show the pipeline running in real time: a drag-and-drop upload zone, live stat cards (records/sec, active workers, live heap size), an animated flow visualizer, and an analytics table backed by a real MongoDB aggregation query.

**Why it matters**
This project isn't a CRUD app — it's a demonstration of production-grade concurrent systems design: bounded memory under load, deterministic shutdown behavior, lock-free telemetry, and database write optimization. Every design choice (single loader vs. parallel writers, atomic counters vs. mutex, channel buffer sizing) was made deliberately and is documented in-code and in the README.

---

## 4. Key highlights (bullet list for the project page)

- Constant memory footprint regardless of input file size — verified live via `runtime.ReadMemStats`, not just claimed
- Dynamically-scaled worker pool (`runtime.NumCPU()`) for parallel field validation, timestamp normalization, and PII masking
- Smart batching loader: reduces millions of potential DB round-trips to bulk writes of 500 records / 100ms windows
- Graceful shutdown via `context.Context` + OS signal handling — drains and flushes in-flight data safely on `SIGINT`/`SIGTERM`
- Lock-free metrics collection using `sync/atomic` — race-condition-free under concurrent load (`go test -race` clean)
- Channel-based back-pressure: pipeline self-throttles to the speed of its slowest stage instead of buffering unbounded data
- Real-time DevOps-style monitoring dashboard (React + Tailwind) with live throughput, worker activity, and MongoDB aggregation analytics
- Dockerized with `docker-compose` (engine + MongoDB) for one-command local setup

---

## 5. Tech stack

**Backend:** Go · Gin · MongoDB (Aggregation Framework, Indexing, BulkWrite) · goroutines & channels · `sync/atomic` · `context.Context`
**Frontend:** React · Tailwind CSS · Vite
**Infra:** Docker, Docker Compose

---

## 6. Architecture diagram (paste as-is into a README code block)

```
                    ┌─────────────┐        ┌──────────────────────┐        ┌─────────────┐
   CSV / JSON  ───▶ │  Extractor  │──chan─▶ │   Transformer Pool    │──chan─▶│    Loader    │──▶ MongoDB
   (5GB+ file)      │ (1 goroutine)│  RawLine│ (NumCPU() goroutines) │ Record │ (1 goroutine,│   BulkWrite
                    └─────────────┘        │  validate/mask/parse  │        │ batches 500  │
                                            └──────────────────────┘        │ or 100ms)    │
                                                                             └─────────────┘
                                       all stages select on ctx.Done() for graceful shutdown
```

---

## 7. Resume bullet points

Pick 2–3 depending on the role you're applying for. Keep whichever numbers you can actually back up in an interview — don't inflate throughput figures you haven't benchmarked yourself.

- Designed and built a concurrent ETL pipeline in Go using a multi-stage goroutine/channel architecture (extract → transform → load), processing large CSV/JSON files with constant memory usage via streaming I/O
- Implemented a dynamically-scaled worker pool (`runtime.NumCPU()`) for parallel data validation, timestamp normalization, and PII masking, coordinated with `sync.WaitGroup` and channel-based fan-in
- Built a smart-batching MongoDB loader that collapses per-row inserts into `BulkWrite` calls triggered by size (500 records) or time (100ms) thresholds, reducing database round-trips at scale
- Implemented graceful shutdown with `context.Context` and OS signal handling to guarantee zero data loss / corruption on process termination mid-ingestion
- Built a lock-free metrics system using `sync/atomic` to track live throughput, active workers, and DB write latency without mutex contention, verified race-free with `go test -race`
- Built a real-time monitoring dashboard in React/Tailwind consuming a Gin REST API, visualizing pipeline throughput and MongoDB aggregation-based analytics

---

## 8. LinkedIn / social post version

> Built HydraETL — a concurrent ETL engine in Go designed to survive the failure modes that take down naive data pipelines in production: OOM crashes on large files, CPU idling on blocking I/O, database write bottlenecks, and data loss on shutdown.
>
> Three-stage pipeline (extract → transform → load) connected by buffered Go channels, a worker pool scaled to CPU cores, MongoDB bulk writes, lock-free telemetry via `sync/atomic`, and a live React dashboard to watch it run.
>
> [GitHub link] · [Demo link/video]

---

## 9. Links to fill in before publishing

- [ ] GitHub repo URL
- [ ] Live demo URL (if hosted)
- [ ] Short demo video/GIF (screen recording of the dashboard while ingesting the sample CSV — this is the single highest-impact addition you can make; recruiters skim, they don't clone repos)
- [ ] Deployed API base URL (if applicable)

---

## 10. If a recruiter asks "walk me through this" — 30-second verbal version

> "It's a Go ETL pipeline built around one core idea: never let memory or the database become the bottleneck. Files stream in line-by-line instead of loading fully into RAM. A worker pool sized to the CPU processes records in parallel. Instead of writing to MongoDB row-by-row, a single loader batches writes — either every 500 records or every 100 milliseconds, whichever comes first. And if the process gets killed mid-run, a context-based shutdown drains everything in flight and flushes the last batch before exiting, so nothing gets corrupted. There's also a live dashboard so you can watch throughput and memory usage in real time while it's running."
