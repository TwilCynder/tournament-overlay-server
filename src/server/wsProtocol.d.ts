export type WSControlMessageIncoming = 
    {op: "load-data", url?: string} | 
    {op: "retry-load-data"} |
    {op: "build-data", sggog_addr: string?, fast_mode: boolean?} |
    {op: "reset"}

export type OperationFeedbackStatus = "error" | "status" | "info" | "success";
export type OperationFeedback = {type: "operation-feedback", status: OperationFeedbackStatus, message?: string}
export type Status = 
    {mode: "nothing-loaded"} |
    {mode: "event-set", slug: string} | //means no data found
    {mode: "data-loaded", slug: string, numEntrants: number}
export type StatusMessage = Status & {type: "status"};
export type WSControlMessageOutcoming = OperationFeedback | StatusMessage