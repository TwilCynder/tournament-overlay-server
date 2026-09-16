import { build } from "../build";

export type PlayerObject = {id: number, gamerTag: string};
export type Set = {}
export type h2hMatrix = {[id: number]: {[id: number]: Set[]}}
export type Data = ReturnType<typeof build>