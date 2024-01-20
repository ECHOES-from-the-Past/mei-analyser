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

## Class Diagram
[![](https://mermaid.ink/img/pako:eNqNk0Fr4zAQhf_KICi0pQ3sVYSWsHtss22zp-LLRFYagTxy5FFJaPPfd2wntpN0mzUGyU9vpO8N1ocyIbdKK-Oxqn45fItYZASQu2gNu0Dw8JJRrQA0HphtvMe5t_DRqvWTyK2ShXXhtcv39u1J3Tcle9kskfhhE52pNFQcHb0d7dadn6kfmYLr29vdTBaG501tKjrILZwpbtyHwI30MxRlIEs8ZB-PcS5saPju7myiiwv44zwPOnoZynpEf9W72qj3lLwHFvtR6DbMAfRodL3n7iBbs5zY-hu9qOEXIcJslTBaoMBYH__vqLPnYVjZ7cmxWQJh3aFDYCgPVTH_NvyOA4lSMbcRgukzdYn67o4_JdUJhga7Zkt5te9DF810lXW0ySo5RnL4TarJcSofTNMIkJeXFioTpD29RdY1TBv6wS_9f-yTL9hP0o1GJ1Ua1iGqG1XYWKDL5WI2zJkSQOmz0jLN7QKT_CEqo61YMXGYbcgozTHZG5XKHNnurrLSC_SVqCXSawj9t80dh_i4u_z1sP0LwPFHVA?type=png)](https://mermaid.live/edit#pako:eNqNk0Fr4zAQhf_KICi0pQ3sVYSWsHtss22zp-LLRFYagTxy5FFJaPPfd2wntpN0mzUGyU9vpO8N1ocyIbdKK-Oxqn45fItYZASQu2gNu0Dw8JJRrQA0HphtvMe5t_DRqvWTyK2ShXXhtcv39u1J3Tcle9kskfhhE52pNFQcHb0d7dadn6kfmYLr29vdTBaG501tKjrILZwpbtyHwI30MxRlIEs8ZB-PcS5saPju7myiiwv44zwPOnoZynpEf9W72qj3lLwHFvtR6DbMAfRodL3n7iBbs5zY-hu9qOEXIcJslTBaoMBYH__vqLPnYVjZ7cmxWQJh3aFDYCgPVTH_NvyOA4lSMbcRgukzdYn67o4_JdUJhga7Zkt5te9DF810lXW0ySo5RnL4TarJcSofTNMIkJeXFioTpD29RdY1TBv6wS_9f-yTL9hP0o1GJ1Ua1iGqG1XYWKDL5WI2zJkSQOmz0jLN7QKT_CEqo61YMXGYbcgozTHZG5XKHNnurrLSC_SVqCXSawj9t80dh_i4u_z1sP0LwPFHVA)