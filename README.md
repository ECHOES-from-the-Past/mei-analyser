# MEI Analyser
- Development site: https://echoes-from-the-past.github.io/mei-analyser/
- Code Documentation (temporary): https://echoes-from-the-past.github.io/mei-analyser/docs/
- A tool to analyse MEI files, highlighting sections and comparing them to other MEI files.
- A part of project ECHOES from the Past: Unveiling a Lost Soundscape
# Development
```bash
# SSH clone
git clone --recurse-submodules git@github.com:ECHOES-from-the-Past/mei-analyser.git
```
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

# Packages Used
- [Vite](https://vitejs.dev/) for development - MIT License
- [Verovio](https://www.verovio.org/) for MEI rendering - LGPL 3.0 License

## Components Class Diagram
[![](https://mermaid.ink/img/pako:eNqVVGFr2zAQ_StCUEiKO-zEjWsTClm3D4Ol60g-jGEoV1mJxWzJlc8jaZb_vovd1E48ChM2Or97J927k7zjwiSSR1xkUJafFKwt5LFmNBJlpUBlNFt-bJCaw-5S0Mh2DXQYC7RKr9lKZfIBMG0dP-Zf2fzzl0dhNEqNvQjQ2iActlhuC9m676v8SVqWU2YNuI91YzR7x9yLObu8uiLrkqx7WeXyzuSF0W_bNLmeerpJT6fwVKIFgbe3LVpp9VxJtsmzSCUtfHHBlirDTkkGpjjMkA1b1hFiSNwWTtU6zejFAVUocxjtan7JTlxZGHyXUOl2jeFZRf6lc_G9q5SSf1AoUqYhl70eFKcokb8J_A39bhjR0bSW-FhHDoanILG6UCkL6jzYbSfves3Tvkz_UC97GiImNxSdlEetlFxNYuItcmUsmz1XCkEreKcks_OSZEbUJ4_Rg6lkpTBWsp5qop0KJOC_tczOtHCH59LmoBK6eHVaMaccqA88IjORK6joBPFY74kKFZrFVgseoa2kw6siAZSvV5VHK8hKQgvQP43JjyT65NGOb3g0moQfQn8SXI-ux96NG_oO3_LIcwn0b_wwDNyxO3G98d7hL_UC5JkEoTvxvMAfh6PA4TJRaOz89UdxmPZ_AVNJSl4?type=png)](https://mermaid.live/edit#pako:eNqVVGFr2zAQ_StCUEiKO-zEjWsTClm3D4Ol60g-jGEoV1mJxWzJlc8jaZb_vovd1E48ChM2Or97J927k7zjwiSSR1xkUJafFKwt5LFmNBJlpUBlNFt-bJCaw-5S0Mh2DXQYC7RKr9lKZfIBMG0dP-Zf2fzzl0dhNEqNvQjQ2iActlhuC9m676v8SVqWU2YNuI91YzR7x9yLObu8uiLrkqx7WeXyzuSF0W_bNLmeerpJT6fwVKIFgbe3LVpp9VxJtsmzSCUtfHHBlirDTkkGpjjMkA1b1hFiSNwWTtU6zejFAVUocxjtan7JTlxZGHyXUOl2jeFZRf6lc_G9q5SSf1AoUqYhl70eFKcokb8J_A39bhjR0bSW-FhHDoanILG6UCkL6jzYbSfves3Tvkz_UC97GiImNxSdlEetlFxNYuItcmUsmz1XCkEreKcks_OSZEbUJ4_Rg6lkpTBWsp5qop0KJOC_tczOtHCH59LmoBK6eHVaMaccqA88IjORK6joBPFY74kKFZrFVgseoa2kw6siAZSvV5VHK8hKQgvQP43JjyT65NGOb3g0moQfQn8SXI-ux96NG_oO3_LIcwn0b_wwDNyxO3G98d7hL_UC5JkEoTvxvMAfh6PA4TJRaOz89UdxmPZ_AVNJSl4)