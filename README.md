# n8n-nodes-doppelganger

Official n8n community node for running Doppelganger tasks via the local API.

## Install

1. In n8n, open **Settings** -> **Community Nodes**.
2. Enter the package name: `n8n-nodes-doppelganger`.
3. Install and restart n8n if prompted.

## Setup

1. Create Doppelganger API credentials in n8n.
   - Base URL: `http://localhost:11345` (or your server)
   - API Key: from Doppelganger Settings
2. Add the **Doppelganger** node to a workflow.
3. Set your Task ID and optional variables (JSON).

## What it does

Calls:

```
POST /tasks/:id/api
```

Auth header: `x-api-key`.

## Links

- Homepage: https://doppelgangerdev.com
- Docker: https://hub.docker.com/r/mnemosyneai/doppelganger
