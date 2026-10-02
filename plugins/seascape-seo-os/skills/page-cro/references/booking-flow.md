# Responsive booking-flow checks

Use these checks only when the conversion task spans browsing homes, choosing a
property, or reaching the booking handoff. Treat conversion impact as a
hypothesis unless current measurement proves it.

## Trace one journey

1. Record the entry route, selected dates and guests, property route, and final
   booking destination.
2. Confirm that dates, guests, property identity, and direct-booking intent
   survive each transition. A visually strong page does not repair lost state.
3. At desktop and the supported mobile floor, identify the primary next action
   before scrolling and after the visitor reaches the decision content.
4. Confirm that the DOM reading order matches the visible decision order and
   that supporting content does not separate the action from the facts needed
   to take it.

## Responsive stress tests

- Test the smallest and largest supported widths, 200% zoom, long labels, and
  content growth. Breakpoints follow the content, not familiar device presets.
- Keep critical actions in normal flow or stable chrome where resizing,
  scrolling, sticky elements, or safe-area insets cannot obscure them.
- Preserve project spacing and tokens. Use grouping, alignment, and progressive
  disclosure to reduce decision load; outside donor values are examples, not
  Seascape design law.
- Distinguish controls from explanatory text, provide a visible cue for hidden
  or horizontally scrollable content, and keep adjacent targets usable.

Report only route-backed problems. For each finding, name the broken journey
step, viewport or state, observed evidence, smallest correction, and the event
or route check that would measure the result.
