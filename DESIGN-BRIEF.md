# Regis Road fieldnotes — agreed direction and proposed palette

## Confirmed requirements

- The website now requires EN / 中文 switching, default English, remembered per browser. Translate all interface labels, taxonomy, validation and help; keep original media names, place names and authored notes unchanged. New taxonomy nodes support both English and Chinese names, with an explicit fallback when one is missing.
- Simple owner upload/edit interface and visitor read-only interface. Durable media and records.
- Original iPhone HEIC photos and MOV videos; extract original capture timestamps, time offsets, GPS and reported accuracy. Preserve originals. GPS denotes camera position, not necessarily the photographed subject. Video location is not a recorded walking trajectory.
- Owner-editable categories; records can have more than one category. Geography is separate from thematic classification.
- Follow the user's spoken names and numbering: 1 Regis Road area (design site), 2 Kendish Town area (closely connected context), 3 Kendish Town surrounding area (broader case studies). Do not override these names from source-image labels. Outer study area is approximate and editable; allow observations outside it. Georeferencing and exact boundaries remain unverified.
- Five initial themes: Belongings (cultural symbols, decoration, carvings, identity and attachment); Housing (household and dwelling types, apartments and building details); Care (care facilities, accessibility and assistance); Cohabitation (shared parks and public spaces); Production (factories, work and social production).
- Architectural drawing aesthetic: white, large areas of breathing room, fine black and grey lines, quiet building outlines, restrained red editorial accents. Keep actual photographs and videos in original colors.
- Reference-image black/red squares have meanings specific to that drawing. Do NOT translate them into the website's category scheme. Selected points must retain category color; use an outline or label to indicate selection.
- Rich visualization using multiple complementary views rather than one universal point marker or chart. Keep the ordinary upload flow simple.

## Proposed presentation (not yet approved)

The user accepted palette study 02. Preserve its five proposed category colours and symbols unless subsequently changed.

The earlier multi-hue palette was rejected. Use black, grey and red, with only a small amount of muted beige. White is the drawing canvas. No blue, green, purple or saturated yellow in the graphic system; original media keeps natural colors.

Accepted category palette: Housing #242424 charcoal / square; Production #747474 graphite / triangle; Belongings #D94B43 warm red / diamond; Care #963F3F dark red / plus; Cohabitation #C8B79C sand / circle. Pair every color with its name or code (HS, PR, BL, CA, CO). Use a thin contrasting outline for pale map marks. These are design conventions based on the reference images, not exact dominant-color measurements or official mapping standards. The two reds must remain distinguishable through shape and label. Keep color patches small and page backgrounds white.

## Extensible research taxonomy

Housing has two research strands: Dwelling Types (A01–A16) and Urban Block Types (B01–B08), transcribed from the supplied tables into data/initial-taxonomy.json. Names and counts describe types, not a verified census of distinct buildings or uploaded observations. The locations suggested in the screenshots are reference content, not verified coordinates or commands to place map pins.

Implement categories as editable data with stable IDs and parent IDs, separate display codes and labels, and ordering. The supplied JSON is the initial seed, not a hardcoded list of form options. Support adding, renaming, moving and archiving categories without orphaning observations. Prevent hierarchy cycles and archive rather than delete categories that still have observations. Other themes can gain additional strands and types without a code change. Show only relevant levels, keep deeper levels optional, and allow unclassified uploads for later sorting.

Theme → Research strand → Type is the default navigation hierarchy. Media observations are linked through many-to-many assignments, not nested copies. One observation can be assigned to multiple types/strands/themes; parent filters include descendants and counts deduplicate by observation ID. User-created places/case studies group related photos, videos and notes and can connect a dwelling case to its urban block. Case-study membership and geographic research boundary are separate from typology.

Children inherit their theme's colour; use A/B codes, labels and subtle marker variations instead of introducing additional hues. A01/A02 are type codes, not the unique ID of a photograph. Selecting A09 shows associated observations; it must not imply one photo or one building per type. House/block relationships must be user-entered or verified, never inferred from proximity alone.

Views share the same underlying records and filters:

1. Map: accurate positions, three optional boundary layers, click to expand local media and notes, individual points/clustered points as needed. Building footprints depend on real map data. No invented geographic geometry.
2. Typology atlas: contact sheets grouped by themes/subtypes; compare details and multiple photos of one place. Open a record to locate it on the map.
3. Visit timeline: order actual captures by time and visit; compare repeat visits. If linking observed points by capture sequence, explicitly label it as capture sequence, not actual walking route.
4. Relations: show owner-created or confirmed relationships and multi-tag intersections; no decorative connections presented as factual relationships.
5. Research stories: owner selects observations, details, text and supporting drawings into scrollable annotated sequences inspired by the supplied architectural boards; links return to original evidence.

Density charts, coverage maps or category counts describe the collected sample only; they do not measure the true distribution of facilities or prove an absence. Start with useful record counts; do not imply research conclusions from six files.

## Current implementation state

Vinext starter only. Sites project registered as appgprj_6ae25239697081918984270de3e5c464; owner-private; no published version. Installation has not succeeded (npm unavailable in the bundled environment). No application features or public visitor site are live yet. Design discussion is ongoing.

## Latest scope

Home is a map paired with the photo/video collection. Add secondary atlas, timeline, comparison and curated-story views without complicating the upload flow. Common/public space is Cohabitation and can also have Care tags when it provides a care function. Intergenerational care remains Care; it is not automatically Cohabitation. Belonging stays broad and may be assigned directly without a subtype. All suggested site examples, including the user-described centre and park near Bacon Tower, remain unverified leads, not placed pins.
