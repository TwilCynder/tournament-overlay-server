import { build } from "../build";

export type PlayerObject = {id: number, gamerTag: string};
export type StartGGSet = {}
export type Set = {slots: {score: number, players: {id: number}[]}[], fullRoundText: string, completedAt: number, event: {name: string, tournament: {name: string}}}
export type h2hMatrix = {[id: number]: {[id: number]: Set[]}}
export type Data = Awaited<ReturnType<typeof build>>