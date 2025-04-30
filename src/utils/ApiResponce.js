class ApiResponce {
  constructor(status,data,message="") {
    this.status = status;
    this.message = message;
    this.data = data;
    this.success = status >= 200 && status < 300;
    this.errors = null;
    this.stack = null;
    this.isOperational = true;
    this.statusCode = status;
  }
}
export default ApiResponce;