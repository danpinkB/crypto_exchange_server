import { ValidationError } from "class-validator";

export interface IValidate<T>{
    validate_from(entity:T, errors: ValidationError[]):Promise<ValidationError[]>;
    validate_to(entity:T, errors: ValidationError[]):Promise<ValidationError[]>;
    validate_from_or_reject(entity:T, errors: ValidationError[]):Promise<T>;
    validate_to_or_reject(entity:T, errors: ValidationError[]):Promise<T>;
}

export class ValidationErrorWithConstraints extends ValidationError{
    constructor(constraints?: {
        [type: string]: string;
    }){
        super();
        this.constraints = constraints
    }
}

export class HttpValidationException extends Error{
    status = 417;
    message: string = "VALIDATION_EXCEPTION"
    data?: any;

    constructor(err:ValidationError[]){
        super();
        this.data = err.reduce((errors:Array<string>, x: ValidationError)=>errors.concat(Object.values(x.constraints!)),[])
    }
}