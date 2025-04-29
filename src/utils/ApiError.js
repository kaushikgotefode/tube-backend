class ApiError extends Error {
  constructor(message, statusCode, errors=[],stack) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.data = null;
    this.isOperational = true;
    this.success = false;
    if(stack){
        this.stack = stack;
    }else{
        Error.captureStackTrace(this, this.constructor);
        this.stack = new Error().stack;
    }
  }
}
export default ApiError;
