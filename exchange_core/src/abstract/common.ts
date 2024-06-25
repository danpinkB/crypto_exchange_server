export class HttpResponse{
    status:number;
    message:string;
    data:string;
    constructor(status:number,message:string,data:any){
        this.status=status;
        this.message=message;
        this.data=data;
    }
}