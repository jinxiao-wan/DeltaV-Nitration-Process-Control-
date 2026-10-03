# Source audit

The supplied graduation-project archive contains thesis drafts, a compiled final thesis, a standalone final thesis, DOCX versions, a defence presentation, proposal/task documents and reference material. The compiled final PDF is the primary figure source; the defence presentation qualifies the original research scope.

## Unresolved source issues

| Issue | Evidence and treatment |
|---|---|
| I/O counts | Body text totals 68, table 3.1 totals 78. Both are retained. |
| Production arithmetic | 480,000 tonnes/year divided by 7,200 hours/year gives about 66.7 tonnes/hour, conflicting with the source's 1,600 tonnes/hour statement. No operating capacity is asserted by the demo. |
| Actuation sign | Prose discusses cooling and feed-flow paths without fully recoverable sign/scaling. The new model states its chosen response explicitly. |
| Implementation scope | Abstract wording is broad; defence slide 25 describes theoretical/simulation research requiring production validation. Portfolio claims follow the qualified scope. |
| Performance | Original screenshots show simulated trends; no historian dataset or measured benchmark was found. |

## Missing native deliverables

No DeltaV FHX export, configuration database, executable model source, raw historian CSV, native electrical CAD, PCB or enclosure CAD was found. Machine-readable files under `design/` are reconstructed conceptual records, not vendor import packages.

## Published evidence

Only selected control/process figures are extracted. Cover pages, student identifiers, signatures, complete thesis PDFs and third-party reference publications are excluded. `visual-sources.json` records exact figure/page locations and SHA-256 hashes. Reproduced figures may contain source-cited literature/vendor elements and are not blanket-licensed by this repository.
