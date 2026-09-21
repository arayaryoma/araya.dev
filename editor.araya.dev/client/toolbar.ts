/**
 * Markdown insertion helpers for the toolbar.
 *
 * On a phone there is no keyboard shortcut for any of this, so the buttons are
 * the only way to get markdown syntax in without fighting the software
 * keyboard's autocorrect.
 */

export type Command =
  | "heading"
  | "bold"
  | "italic"
  | "link"
  | "code"
  | "quote"
  | "list";

interface Wrap {
  before: string;
  after: string;
  placeholder: string;
}

const WRAPS: Record<"bold" | "italic" | "link" | "code", Wrap> = {
  bold: { before: "**", after: "**", placeholder: "太字" },
  italic: { before: "_", after: "_", placeholder: "斜体" },
  link: { before: "[", after: "](https://)", placeholder: "リンクテキスト" },
  code: { before: "`", after: "`", placeholder: "code" },
};

const LINE_PREFIXES: Record<"heading" | "quote" | "list", string> = {
  heading: "## ",
  quote: "> ",
  list: "- ",
};

export function applyCommand(
  textarea: HTMLTextAreaElement,
  command: Command,
): void {
  if (command in WRAPS) {
    wrapSelection(textarea, WRAPS[command as keyof typeof WRAPS]);
  } else {
    prefixLines(textarea, LINE_PREFIXES[command as keyof typeof LINE_PREFIXES]);
  }
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
  textarea.focus();
}

function wrapSelection(textarea: HTMLTextAreaElement, wrap: Wrap): void {
  const { selectionStart: start, selectionEnd: end, value } = textarea;
  const selected = value.slice(start, end);
  const text = selected === "" ? wrap.placeholder : selected;
  replaceRange(textarea, start, end, `${wrap.before}${text}${wrap.after}`);
  // With nothing selected, leave the placeholder selected so typing replaces it.
  const textStart = start + wrap.before.length;
  textarea.setSelectionRange(textStart, textStart + text.length);
}

function prefixLines(textarea: HTMLTextAreaElement, prefix: string): void {
  const { value } = textarea;
  const lineStart = value.lastIndexOf("\n", textarea.selectionStart - 1) + 1;
  const lineEndIndex = value.indexOf("\n", textarea.selectionEnd);
  const lineEnd = lineEndIndex < 0 ? value.length : lineEndIndex;

  const block = value.slice(lineStart, lineEnd);
  const lines = block.split("\n");
  const allPrefixed = lines.every((line) => line.startsWith(prefix));
  const next = lines
    .map((line) => (allPrefixed ? line.slice(prefix.length) : prefix + line))
    .join("\n");

  replaceRange(textarea, lineStart, lineEnd, next);
  textarea.setSelectionRange(lineStart, lineStart + next.length);
}

export function insertAtCursor(
  textarea: HTMLTextAreaElement,
  text: string,
): void {
  const { selectionStart: start, selectionEnd: end } = textarea;
  replaceRange(textarea, start, end, text);
  const caret = start + text.length;
  textarea.setSelectionRange(caret, caret);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

/**
 * Uses execCommand where it exists so the change lands on the browser's native
 * undo stack: retyping a paragraph because the toolbar ate ctrl+z is the kind
 * of thing that makes an editor unusable.
 */
function replaceRange(
  textarea: HTMLTextAreaElement,
  start: number,
  end: number,
  text: string,
): void {
  textarea.focus();
  textarea.setSelectionRange(start, end);
  if (!document.execCommand?.("insertText", false, text)) {
    const { value } = textarea;
    textarea.value = value.slice(0, start) + text + value.slice(end);
  }
}
