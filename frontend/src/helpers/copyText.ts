class CopyText {
  static async copy(text: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!navigator.clipboard) {
        resolve(this.fallbackCopyTextToClipboard(text));
      }

      navigator.clipboard.writeText(text).then(
        () => {
          resolve(true);
        },
        (err) => {
          console.error("Async: Could not copy text: ", err);
          resolve(this.fallbackCopyTextToClipboard(text));
        }
      );

      resolve(false);
    })
  }

  static fallbackCopyTextToClipboard(text: string): boolean {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      if (successful) {
        return true;
      }
    } catch (err) {
      console.error("Fallback: Oops, unable to copy", err);
    }

    document.body.removeChild(textArea);
    return false;
  }
}

export default CopyText;
