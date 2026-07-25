/** Shared shape every mock handler returns — a thin adapter turns this into a `Response`. */
export interface MockResult {
  status: number
  body?: unknown
  headers?: HeadersInit
}

export interface MockContext {
  request: Request
  params: Record<string, string>
}

export type MockHandler = (ctx: MockContext) => Promise<MockResult>
