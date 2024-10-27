function ResponseError (status, message, errors ){
    this.success = false;
    this.message = message || "error";
    this.errors = errors || null;
    this.status = status || 400;
    this.data = null;
}

function ResponseSuccess (status, message, data){
    this.success = true;
    this.message = message || "successfully";
    this.errors = null;
    this.status = status || 200;
    this.data = data;
}

export function sendInputValidationError(res, errors) {
    const responseJson = new ResponseError(422, "inputs validation errors", errors);
    return res.status(422).json(responseJson);
}

export function sendGenericError(res, status, message) {
    const responseJson = new ResponseError(status, message);
    return res.status(status).json(responseJson);
}

export function sendSuccess(res, status, message, data) {
    const responseJson = new ResponseSuccess(status, message, data);
    return res.status(status).json(responseJson);
}