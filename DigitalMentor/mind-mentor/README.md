# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## AI Tutor — 3D classroom

The **AI Tutor** tab is a 3D classroom with a talking, lip-synced teacher
(`src/components/tutor3d/`). Pick a guide (Abbi, Alfie or Elliot), type or
speak a question, and the teacher answers out loud while the answer is written
on the blackboard.

- **Answers** come from this project's own backend: `POST {VITE_API_BASE_URL}/api/chat`
  with `{ message, language, history }`, expecting `{ reply }` back. If the
  backend is not running the teacher says so instead of answering.
- **Voice and mic** use the browser's built-in speech engine, so no API key is
  needed. Use Chrome or Edge; lip movement is estimated from the answer text.
- **History** is kept in the browser (localStorage), per device.
- 3D models live in `public/tutor3d/` (about 33 MB).

Run it:

```bash
npm install     # .npmrc sets legacy-peer-deps, needed by @react-three/fiber
npm run dev     # http://localhost:5173 → Sign In → AI Tutor
```

The classroom, teacher models and animation approach are adapted from the
open-source [3d-mentor-3js](https://github.com/hemanthkt/3d-mentor-3js) project.
The previous chat-only tutor is still in `src/components/ChatBot.jsx`, unused.
