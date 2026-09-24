/**
 * `date` is a free-form string in the collection schema, and the posts use it
 * two ways: `"2025-09-10"` and `"1970-01-01 00:00:00"`. An `<input type="date">`
 * can only show the day part, so the editor has to put back what it could not
 * display rather than silently truncating the value on save.
 */

/** The part of a stored `date` an `<input type="date">` can hold. */
export function toDateInput(value: string | undefined): string {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value ?? "");
  return match === null ? "" : match[1];
}

/** What to store, given the field's value and what the post had before. */
export function fromDateInput(
  input: string,
  original: string | undefined,
): string | undefined {
  if (input === "") return undefined;
  // The same day as before: keep the original spelling, time and all.
  if (original !== undefined && toDateInput(original) === input)
    return original;
  return input;
}
