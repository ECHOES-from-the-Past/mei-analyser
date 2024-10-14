# MEI Analyser
- A prototype tool to analyse MEI files, highlight sections and patterns, and compare them to other MEI files.
- Part of the research project **ECHOES from the Past: Unveiling a Lost Soundscape**

# Usage
- The tool is available at: https://echoes-from-the-past.github.io/mei-analyser/
- There are two major functionalities:
  - **Search**: perform a search of the selected corpus with filters and options to highlight desired patterns.
  - **Analysis** (in development): compare two MEI files and highlight the differences.

# User Guide - Wiki
- See the project's wiki for more information: https://github.com/ECHOES-from-the-Past/mei-analyser/wiki

# Dependencies
- Frontend development:
  - [Vite](https://vitejs.dev) - Frontend toolchain (dev, build)
  - [Svelte](https://svelte.dev) - Frontend component framework
  - [Verovio](https://github.com/rism-digital/verovio) - render chants onto the browser 
- Backend/database development:
  - [xml2js](https://github.com/Leonidas-from-XIV/node-xml2js) - Parse XML documents into JSON
  - [@octokit/core](https://github.com/octokit/core.js) - Access GitHub API to access `.mei` files from [GABCtoMEI](https://github.com/ECHOES-from-the-Past/GABCtoMEI) repository