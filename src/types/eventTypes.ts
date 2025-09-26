export enum EventTypes {
  AddSnippet = "addSnippet",
  AddGroup = "addGroup",
  GetSnippets = "getSnippets",
  GetGroups = "getGroups",
  RunSnippet = "runSnippet",
  DeleteSnippet = "deleteSnippet",
  // ▼▼▼【ここから修正】▼▼▼
  UpdateSnippet = "updateSnippet",
  // ▲▲▲【ここまで修正】▲▲▲
  SnippetsData = "snippetsData",
  GroupsData = "groupsData",
}

export type VSCodeEvent = {
  type: EventTypes;
  value?: any;
};
