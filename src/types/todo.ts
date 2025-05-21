export interface Todo{
    id: string;
    text:string;
    completed: boolean;
    createdAt: Date;
}
export interface TodoStats {
    total:number;
    completed:number;
    remaining:number;
}