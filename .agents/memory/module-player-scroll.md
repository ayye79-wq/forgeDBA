---
name: Module player scroll layout
description: How to reliably scroll lesson content in the module player
---

The module player had persistent scrolling failures when using flex-based inner scroll containers (`flex-1 min-h-0 overflow-y-auto`, `absolute inset-0 overflow-y-auto`, etc.). Multiple attempts all failed in production Chrome even though they worked in dev.

**The rule:** Use sticky sidebar + natural page scroll instead.

```
<div className="flex bg-background">
  <div className="...sidebar... sticky top-16 h-[calc(100vh-4rem)] overflow-hidden">
    ...sidebar with its own overflow-y-auto...
  </div>
  <div className="flex-1 min-w-0">
    <div className="px-4 md:px-12 py-8">
      {lesson content — no overflow tricks}
    </div>
  </div>
</div>
```

**Why:** Flex height chain constraints (`h-[calc(100vh-4rem)]` → `flex-1` → `overflow-y-auto`) are unreliable in production static builds. The browser page scroll always works. Sticky sidebar keeps the lesson nav fixed without locking the document.

**How to apply:** Any time a page needs sidebar + scrollable content, use `position: sticky` on the sidebar and let `<body>` scroll the content. Never use `overflow-hidden` on the document root to force inner scrolling.
