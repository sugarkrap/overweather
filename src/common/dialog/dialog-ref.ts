export class DialogRef<T = void> {
  private closeCallback?: (result?: T) => void;

  _setCloseCallback(cb: (result?: T) => void): void {
    this.closeCallback = cb;
  }

  close(result?: T): void {
    this.closeCallback?.(result);
  }
}
