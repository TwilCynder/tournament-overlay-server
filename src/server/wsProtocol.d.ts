export type WSControlMessageIncoming = 
    {op: "load-data", url?: string} | 
    {op: "retry-load-data"}

export type OperationFeedbackStatus = "error" | "ok" | "success";
export type OperationFeedback = {type: "operation-feedback", status: OperationFeedbackStatus, message: string?}
export type Status = {}
export type WSControlMessageOutcoming = OperationFeedback | Status