export type WSControlMessage = 
    {op: "load-data", url?: string} | 
    {op: "retry-load-data"}