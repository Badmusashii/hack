export interface WorkerData {
  salt: string;
  targetHash: string;
  start: number;
  end: number;
  alphabet: string;
  length: number;
  workerId: number;
}
