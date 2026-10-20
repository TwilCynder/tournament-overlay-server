export type WSControlMessageIncoming = 
    {op: "load-data", url?: string} | 
    {op: "retry-load-data"}

export type OperationFeedbackStatus = "error" | "ok" | "success";
export type OperationFeedback = {type: "operation-feedback", status: OperationFeedbackStatus, message?: string}
export type Status = 
    {mode: "nothing-loaded"} |
    {mode: "event-set", slug: string} | //means no data found
    {mode: "data-loaded", slug: string, numEntrants: number}
export type StatusMessage = Status & {type: "status"};
export type WSControlMessageOutcoming = OperationFeedback | StatusMessage