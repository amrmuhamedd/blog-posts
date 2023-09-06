interface IError {
  name: string;
  message: string;
  stack?: typeof Error.prototype.stack;
}

export default IError;
