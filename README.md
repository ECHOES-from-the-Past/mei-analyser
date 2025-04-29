# Plainchant Analyser for MEI Neumes
- A prototype tool to analyse MEI files, highlight sections and patterns, and compare them to other MEI files.
- Part of the research project **ECHOES from the Past: Unveiling a Lost Soundscape**

# Usage
- The tool is available at: https://echoes-from-the-past.github.io/PAM/
- There are two major functionalities:
  - **Search filters**: perform a search of the selected corpus with filters and options to highlight desired patterns.
  - **Analysis**: compare MEI files and highlight the differences.

# User Guide - Wiki
- See the project's wiki for more information: [PAM User Guide - Wiki](https://github.com/ECHOES-from-the-Past/PAM/wiki)
- Using your own MEI files? See: [Working with your own MEI files - Wiki](https://github.com/ECHOES-from-the-Past/PAM/wiki/Working-with-your-own-MEI-files)
- For developers: [General Developer Guide](https://github.com/ECHOES-from-the-Past/PAM/wiki/Developer-%E2%80%90-General-Guide)

# Dependencies
- Frontend development:
  - [Vite](https://vitejs.dev) - Frontend toolchain (dev, build)
  - [Verovio](https://github.com/rism-digital/verovio) - render chants onto the browser 
  - [Svelte](https://svelte.dev) - Frontend component framework
  - [TailwindCSS](https://tailwindcss.com) - styling for components
  - [Bits-UI](https://bits-ui.com) - Svelte headless components library
- Backend/database development:
  - [xml2js](https://github.com/Leonidas-from-XIV/node-xml2js) - Parse XML documents into JSON
  - [@octokit/core](https://github.com/octokit/core.js) - Access GitHub API to access `.mei` files from [GABCtoMEI](https://github.com/ECHOES-from-the-Past/GABCtoMEI) repository