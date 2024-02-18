# MEI Analyser
- Development site: https://echoes-from-the-past.github.io/mei-analyser/
- Code Documentation: https://echoes-from-the-past.github.io/mei-analyser/docs/
- [Design Documentation](./DesignDocumentation.md)
  - Algorithms used for cross comparison analysis: Needleman-Wunsch
- [Testing Documentation](./Testing.md)
  - Unit tests for the algorithm(s)
- A tool to analyse MEI files, highlighting sections and comparing them to other MEI files.
- A part of project ECHOES from the Past: Unveiling a Lost Soundscape
# Development
```bash
# SSH clone
git clone --recurse-submodules git@github.com:ECHOES-from-the-Past/mei-analyser.git
```

- To detect `development` or `production` environment, use `import.meta.env.MODE` from Vite (see [Vite documentation](https://vitejs.dev/guide/env-and-mode#modes)). This is important due to the root file path to the MEI files (called "database") is different in development and production environment.
```js
const env = import.meta.env.MODE
console.log(env) // `development` or `production`

// proceed with an if statement
```

- `npm` scripts:
  - `npm run dev` - Start development server
  - `npm run build` - Build for production, including documentation and database (MEI files)
  - `npm run preview` - Serve the production build with root path `/mei-analyser/`, similar to the GitHub Pages path
  - `npm run database` - make a copy of the database (MEI files) inside the `./dist/database/` folder. This is called within the `build` script, but can be called separately.
  - `npm run docs` - make the folder `./dist/docs/` and generate documentation using [JSdoc](https://jsdoc.app/)
  - `npm run updateDatabaseList`: update the list of MEI files in the `./src/search/database.json`. This is only necessary when the submodule `GABCtoMEI` is resynced.
  - `npm test` - Run the algorithm test file(s) 

# Cross comparison analysis
- Using [Needleman-Wunsch algorithm](https://en.wikipedia.org/wiki/Needleman%E2%80%93Wunsch_algorithm) for global alignment:
  - Parsing MEI files into a list of NeumeComponents
  - Extract `@loc` attribute of Aquitanian neumes, and septenary values from `@pname` and `@oct` of Square notation neumes.
  - Construct two arrays of contour (melodic intervals) based on the extracted values.
  - Construct a matrix of scores based on the two arrays.
  - Retrace the matrix to find the optimal path (Alignment step)
    - Append the contour value, gaps, and mismatch to the result array.
  - Align the resulting contour values using its index to obtain the `@xml:id` of the neumes.
    - Account for the gaps and mismatch in between the two resulting contour arrays and the NeumeComponent arrays.
  - Highlight notes in the MEI files based on the `@xml:id` obtained, including:
    - Mismatches
    - Gaps

- Using [Smith–Waterman algorithm](https://en.wikipedia.org/wiki/Smith%E2%80%93Waterman_algorithm) for local alignment:
  - To be developed
  
# Corpus/Database search
- To be developed

# Packages
- [Vite](https://vitejs.dev/) for development and build - MIT License
- [Verovio](https://www.verovio.org/) for MEI rendering - LGPL 3.0 License

## Components Class Diagram
[![](https://mermaid.ink/img/pako:eNqVVGGL2kAQ_SvLwoEeKiYmFxPkwNp-KFR7RT-UEjjWZDVLN7vpZlLOWvvbO4mniTa1NCRk983smzczu7unkY45DWgkWZ6_FWxrWBoqgk8sDI9AaEVWb45I5UOAp5lkwMn-iJYPAzBiXSDYJ7DLeG3RWUnB5PTs8euM1V6bQlWhOsxsi5Qr6OTd7tF8CFUz-ixhCpqhN0LyJwYJRl5iCLWtTfN3758jrQD50Pp5_qEhWCkNrAy5Qrkta1MsyxV8VnLUEFIrpOS-38fRPY6WOynZWvKm2hPWFCzilnBbDlMpF7POddZnhjIQTq7YbxK3kyw4Vnim00wrLEyT79LSpJ5M2DoHwyJ4fPxHJnd3ZCUk1NunNkGJn1a07gNtFCvbz2SrORHbROIHHey67BGUpL_ybu2QZxpuOhSq5mjfYJdFWH5qlgFzexIQJaRUWcNZOW0vxccIvrPmcYjKCiyKdM3NRfefK5JO9xJE9yaU8ww3MzO7hvbyd9W4yc8_2ox5BIS_4Oo4P-WL8ionEp1XbrQh02-FAKYEu1GW6XVZpI6q00TwhYSTPNKGk9oF7X_JGy3_nc30Khvaoyk3KRMx3mSVsJCiCuwRDXAY8w0rJIQ0VAd0ZQXo5U5FNABT8B4tshivs9e7jwYbJnNEM6a-aJ2enHBKgz19oYHtWwN7aI88d_jgup438np0R4P-cGC7ju16Y-vBchx77B969EfFMBz4I89xLN_xR9ZobPluj_JYgDbz18u3_B1-A6gTrsQ?type=png)](https://mermaid.live/edit#pako:eNqVVGGL2kAQ_SvLwoEeKiYmFxPkwNp-KFR7RT-UEjjWZDVLN7vpZlLOWvvbO4mniTa1NCRk983smzczu7unkY45DWgkWZ6_FWxrWBoqgk8sDI9AaEVWb45I5UOAp5lkwMn-iJYPAzBiXSDYJ7DLeG3RWUnB5PTs8euM1V6bQlWhOsxsi5Qr6OTd7tF8CFUz-ixhCpqhN0LyJwYJRl5iCLWtTfN3758jrQD50Pp5_qEhWCkNrAy5Qrkta1MsyxV8VnLUEFIrpOS-38fRPY6WOynZWvKm2hPWFCzilnBbDlMpF7POddZnhjIQTq7YbxK3kyw4Vnim00wrLEyT79LSpJ5M2DoHwyJ4fPxHJnd3ZCUk1NunNkGJn1a07gNtFCvbz2SrORHbROIHHey67BGUpL_ybu2QZxpuOhSq5mjfYJdFWH5qlgFzexIQJaRUWcNZOW0vxccIvrPmcYjKCiyKdM3NRfefK5JO9xJE9yaU8ww3MzO7hvbyd9W4yc8_2ox5BIS_4Oo4P-WL8ionEp1XbrQh02-FAKYEu1GW6XVZpI6q00TwhYSTPNKGk9oF7X_JGy3_nc30Khvaoyk3KRMx3mSVsJCiCuwRDXAY8w0rJIQ0VAd0ZQXo5U5FNABT8B4tshivs9e7jwYbJnNEM6a-aJ2enHBKgz19oYHtWwN7aI88d_jgup438np0R4P-cGC7ju16Y-vBchx77B969EfFMBz4I89xLN_xR9ZobPluj_JYgDbz18u3_B1-A6gTrsQ)