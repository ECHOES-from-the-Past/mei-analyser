# Terminologies in the MEI analyser

- **MEI file**: usually the name of the file, passing as a URL object
```js
// from utility/utils.js
const objectURL = URL.createObjectURL(uploaded_file);
const newContent = await load_MEI_file(objectURL, slot);
```

- **MEI Content**: the content of the MEI file, parsed via `fetch`
```js
// from utility/utils.js
let mei_content;
await fetch(file_name)
.then((response) => response.text())
.then((mei) => {
    mei_content = mei;
})
return mei_content;
```

# Contour analysis: index mapping and highlighting
> Contour == melodic interval

- The NeumeComponent (either `AQ` or `SQ`) array is extracted to construct a numerical array, via the function `location_septenary_mapping()` in `analysis/analysis.js`.
  - For Aquitanian notation: this numerical array is extracted from the `@loc` attribute.
  - For Square notation: each value of the numerical array is calculated using the formula `7 * octave + pname`, with `@pname` starts at 0 for value `c` and increment to `6` for value `b` following the C major scale. Due to the similarity of the formula and the base-7 numerical system, the function is named `septenary()` in NeumeComponentSQ class.

- The **`contour`** arrays are then constructed from the numerical arrays via `mapLocToContour(location_septenary_array)`. 
  - The _n-th_ element of the contour array is the melodic interval between the _n-th_ and the _(n+1)-th_ element of the numerical array.
  - In other words, the _n-th_ element of contour array is calculated as `location_septenary_array[n + 1] - location_septenary_array[n]`.
  - This is also kept in mind for the later highlighting functionality.

- Needleman-Wunsch algorithm is used to find the alignment between the two contour arrays. It follows 2 steps:
  - Matrix construction (`matrix_nw`)
  - Alignment (`align_nw`)
  - The output arrays of the algorithm is two arrays of alignment with gaps. Two extra arrays is outputted to hold the indecies of the gaps in each alignment array.

- To highlight the mismatches:
  - Look for differences between the two alignment arrays (`alignmentA[i] !== alignmentB[i]`). Note that these values are melodic intervals.
  - Highlight the corresponding NeumeComponent of index `i` and `i+1` in the two NeumeComponent arrays.
  - `gapOffset` is necessary to align the index of the NeumeComponent arrays with the index of the alignment arrays due to the addition of gaps.

- To highlight the gaps and gap fillers:
  - Look for the gaps in the alignment arrays.
  - On the gap filler side: 
    - Highlight the corresponding NeumeComponent of indecies `[i-1, i, i+1, i+2]` in the two NeumeComponent arrays.
    - The filler contour is of index `i` and `i+1` in the contour array from the index alignment above.
  - On the gap side:
    - Highlight the corresponding NeumeComponent of indecies `[i-1, i, i+1]` in the two NeumeComponent arrays.

# Components
- In an .mei file, the structure of a neume and syllable are as follows:
```xml
<!-- Example of an Aquitanian chant -->
<score>
  <scoreDef xml:id="...">
    <staffGrp xml:id="...">
      <staffDef n="1" lines="1" notationtype="neume" xml:id="...">
    </staffGrp>
  </scoreDef>

  <syllable xml:id="...">
    <syl wordpos="i" con="d" xml:id="...">pa</syl>
    <neume xml:id="...">
      <nc loc="1" xml:id="..."/>
      <nc loc="1" xml:id="..."/>
      <nc loc="2" tilt="ne" xml:id="..."/>
    </neume>
    <neume xml:id="...">
      <nc loc="4" xml:id="..."/>
      <nc loc="4" xml:id="..."/>
      <nc loc="5" tilt="ne" xml:id="..."/>
      <nc loc="2" xml:id="..."/>
    </neume>
  </syllable>
  <!-- more <syllable> elements -->
</score>
```
- From the structure above, we can "encapsulate" the neume and syllable into classes, following OOP principles. The classes are as follows:
  - `Syllable` for the `<syllable>` element, which contains:
    - `syl` for the `<syl>` element
    - NeumeComponent for all the `<nc>` elements. Due to two different notation types, we have 2 classes (below). Each class contains different attributes and methods, while both inherit same attributes such as `xml:id` and `tilt`, and methods such as `highlight()`.
      - `NeumeComponentAQ` for the Aquitanian notation
      - `NeumeComponentSQ` for the Square notation

# Colour scheme
- For a clear and consistent visualisation, the following colour scheme is used:

| Highlight Type | Colour | Fill | Stroke |
| --- | --- | --- | --- |
| Display | Black | hsl(0, 0%, 0%) | hsl(0, 0%, 0%) |
| Contour Pattern | Purple (default) | rgba(149, 48, 217, 0.6) | rgba(149, 48, 217, 1) |
| Mismatch | Blue | #FFD700 | hsl(50, 100%, 50%) |
| Gap side notes | Light pink | #FFFF00 | hsl(60, 100%, 50%) |
| Gap filler notes | Rose | #FFFFE0 | hsl(60, 100%, 90%) |
> This colour table is subject to change as the project progresses.

# Code Style
- Variable naming: camelCase
- Class naming: PascalCase
- Method naming: camelCase
- Constants: UPPERCASE
- File naming: kebab-case
- Note: the code style was determined later on in the project; hence, some functions/variable names may not be updated (yet) to follow the style.