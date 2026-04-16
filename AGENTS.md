## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Treat `/graphify ...` in user messages as a shortcut alias for `py -m graphify ...`.
- If the user sends only `/graphify`, run `py -m graphify update .`.
- On Windows, run Graphify queries with UTF-8 env to avoid UnicodeEncodeError:
  `PYTHONUTF8=1`, `PYTHONIOENCODING=utf-8`, and prefer `py -X utf8 -m graphify ...`.
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `py -m graphify update .` to keep the graph current (AST-only, no API cost)
