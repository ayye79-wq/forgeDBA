---
name: GitHub connector pushes
description: Fallback for pushing a repository when a connected GitHub App does not authenticate local git commands.
---

When a GitHub App connection reports healthy but HTTPS git pushes still fail with an invalid credential, bind the standard GitHub connector and use its authenticated REST proxy to mirror blobs, trees, and commits. Preserve local object metadata and verify the remote and local HEAD SHAs match.

**Why:** The GitHub App connection can appear active without making credentials available to the local git or gh CLI. The standard GitHub connector may still provide repository-scoped API access.

**How to apply:** Use this only after a normal non-force push fails due to authentication. Check whether the destination repository is empty before creating refs, throttle API object uploads to stay under the connector proxy rate limit, and set the local upstream after verification.