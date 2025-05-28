export enum EventTypes {
  AddSnippet = "addSnippet",
  GetSnippets = "getSnippets",
  RunSnippet = "runSnippet",
  DeleteSnippet = "deleteSnippet",
  SnippetsData = "snippetsData"
}

export type VSCodeEvent = {
  type: EventTypes;
  value?: any;
};