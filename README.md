# EOSTUDIO

EOSTUDIO is an Endless Online content studio with built-in editors for map (`EMF`), quest (`EQF`), and pub (`EIF/ENF/ECF/ESF`) files.

## Requirements

[Node.js](https://nodejs.org) is required to install dependencies and run scripts via `npm`.

## Available Commands

| Command                  | Description                                     |
| ------------------------ | ----------------------------------------------- |
| `npm install`            | Install project dependencies                    |
| `npm start`              | Build electron and open application             |
| `npm run start:web`      | Build web and open web server running project   |
| `npm run start:electron` | Build electron and open application             |
| `npm run dist`           | Build web and electron with production settings |
| `npm run dist:web`       | Build web with production settings              |
| `npm run dist:electron`  | Build electron with production settings         |
| `npm run format`         | Format changed files using Prettier             |

## Writing Code

After cloning the repo, run `npm install` from your project directory. Then, you can start the application by running `npm start`.

After starting the application with `npm start`, webpack will automatically recompile and reload the application when source files change.

## Deploying to Web

After you run the `npm run dist:web` command, the project will be built into `dist/web`.

If you put the contents of the `dist/web` folder in a publicly-accessible location (say something like `https://example.com`), you should be able to open `https://example.com/index.html` and use the application.

Configure your web server to use [ETags](https://en.wikipedia.org/wiki/HTTP_ETag) for cache validation.

## Quest Editor

The application includes a built-in IDE-style editor for Endless Quest Files (EQF), accessible via the workspace switcher in the top bar.

**Features:**

- Syntax highlighting for EQF keywords, actions, rules, strings, numbers, and comments
- Inline lint diagnostics with wavy squiggles — errors and warnings appear as you type without a separate diagnostic panel
- Context-aware autocomplete: action names after `action`, rule names after `rule`, and state names after `goto`
- Left navigator panel listing all `State` and `random` blocks, clickable to jump to any block
- Add and remove states and random blocks from the navigator
- Save / Save As / Copy to clipboard

## Pub Editor

The application also includes a built-in PUB editor workspace for:

- `EIF` (items)
- `ENF` (NPCs)
- `ECF` (classes)
- `ESF` (skills)

**Features:**

- Load and save each PUB type independently
- Search/filter records by ID or name
- Add, duplicate, and delete records
- Edit core fields in a structured form

## Connected Mode

In the application settings, you will find a section called `Connected Mode`.
When Connected Mode is enabled, graphics will be loaded from the remote Mapper Service specified by the `Mapper Service URL` setting.

### Hosting a Mapper Service

Currently, the steps for creating your own Mapper Service are:

- Set up a web server
- Configure your web server to use [ETags](https://en.wikipedia.org/wiki/HTTP_ETag) for cache validation.
- Configure your web server for CORS
  - Return the response header `Access-Control-Allow-Origin: *`
  - See: [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
  - See: [Access-Control-Allow-Origin](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin)
- Serve EGF files from `/gfx`
- Serve Mapper Assets from `/assets`
  - Copy the bundled assets out from `src/assets/bundled`

### Forced Connected Mode

If you're hosting an instance of EOSTUDIO and want to lock it to a particular remote Mapper Service, then you can use the `FORCE_CONNECTED_MODE_URL` environment variable.

When `FORCE_CONNECTED_MODE_URL` is defined, Connected Mode will be forcibly enabled and the `Mapper Service URL` will be locked to the specified URL.

Usage examples:

- `npm run start:web -- --env FORCE_CONNECTED_MODE_URL="https://example.com"`
- `npm run dist:web -- --env FORCE_CONNECTED_MODE_URL="https://example.com"`
